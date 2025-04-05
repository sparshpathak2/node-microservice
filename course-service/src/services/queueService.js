import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import path from 'path';
import { checkIfFileExists, downloadFromRawS3Bucket, uploadToProdS3Bucket } from './s3Service.js';
import { transcodeVideo } from './transcodingService.js';
import { retryOperation } from '../helpers/retryOperation.helper.js';
import 'dotenv/config';
import { getFilesRecursively } from '../helpers/getFilesRecursively.helper.js';

const QUEUE_URL = process.env.AWS_SQS_URL;

const client = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

export async function processQueueMessage() {
    try {
        const command = new ReceiveMessageCommand({
            QueueUrl: QUEUE_URL,
            MaxNumberOfMessages: 1,
            WaitTimeSeconds: 5
        });

        const response = await client.send(command);
        if (!response.Messages) {
            console.log("No messages found in the queue");
            return { success: true, message: "No messages found in the queue" };
        }

        for (const message of response.Messages) {
            try {
                const { Body } = message;
                console.log('Message Received:', Body);

                if (!Body) continue;

                let event;
                try {
                    event = JSON.parse(Body);
                } catch (error) {
                    console.error('Invalid JSON format:', error);
                    return { success: false, code: "JSONParsingError", message: "Failed to parse JSON body", details: error.message };
                }

                for (const record of event.Records) {
                    const { bucket, object: { key } } = record.s3;
                    console.log(`Processing file: ${key}`);

                    const baseFileName = path.basename(key, path.extname(key));

                    // Check if file already exists in the processed S3 bucket with retry
                    const fileCheck = await retryOperation(() => checkIfFileExists(process.env.AWS_S3_TRANSCODED_BUCKET, key));
                    if (fileCheck.success && fileCheck.exists) {
                        console.log(`File ${key} already processed. Skipping.`);
                        return { success: false, code: "DuplicateFileError", message: `File ${key} already processed` };
                    }


                    // Download File with Retry
                    let localPath;
                    try {
                        localPath = await retryOperation(() => downloadFromRawS3Bucket(bucket.name, key));
                    } catch (error) {
                        console.error('Error downloading file:', error);
                        return { success: false, code: "S3DownloadError", message: "Failed to download file", details: error.message };
                    }

                    const outputDir = '/tmp/transcoded';

                    // Transcoding with Retry Mechanism
                    let transcodedFiles;
                    try {
                        transcodedFiles = await retryOperation(() => transcodeVideo(localPath, outputDir, baseFileName));
                    } catch (error) {
                        console.log(`🚨 Transcoding failed for ${key}. Skipping.`);
                        return { success: false, errorType: "MaxRetriesExceeded", message: "Max retries reached, skipping video" };
                    }

                    // Upload Transcoded Files with Retry
                    // for (const file of transcodedFiles) {
                    //     const newKey = path.basename(file);
                    //     try {
                    //         await retryOperation(() => uploadToProdS3Bucket(file, newKey));
                    //         console.log(`✅ Uploaded: ${newKey}`);
                    //     } catch (error) {
                    //         console.error(`Error uploading ${newKey}:`, error);
                    //         return { success: false, code: "S3UploadError", message: `Failed to upload ${newKey}`, details: error.message };
                    //     }
                    // }

                    // Upload Transcoded Files with Retry
                    try {
                        const filesToUpload = getFilesRecursively(outputDir);

                        for (const filePath of filesToUpload) {
                            const relativePath = path.relative(outputDir, filePath);
                            // const s3Key = `videos/${videoId}/${relativePath}`;
                            const s3Key = `videos/${key}/${relativePath}`;

                            await retryOperation(() => uploadToProdS3Bucket(filePath, s3Key));
                            console.log(`✅ Uploaded: ${s3Key}`);
                        }
                    } catch (error) {
                        console.error("Error uploading files:", error);
                        return { success: false, code: "S3UploadError", message: "Failed to upload transcoded files", details: error.message };
                    }

                    // Delete SQS Message with Retry
                    try {
                        const deleteCommand = new DeleteMessageCommand({
                            QueueUrl: QUEUE_URL,
                            ReceiptHandle: message.ReceiptHandle,
                        });
                        await retryOperation(() => client.send(deleteCommand));
                        console.log(`✅ Successfully deleted SQS message for ${key}`);
                    } catch (error) {
                        console.error("Error deleting SQS message:", error);
                        return { success: false, code: "SQSError", message: "Failed to delete SQS message", details: error.message };
                    }
                }
            } catch (error) {
                console.error("Error processing message:", error);
                return { success: false, code: "ProcessingError", message: "Unexpected error processing message", details: error.message };
            }
        }

        console.log("Queue processing complete");
        return { success: true, message: "Queue processing complete" };
    } catch (error) {
        console.error("Error processing queue:", error);
        return { success: false, code: "QueueProcessingError", message: "Error processing queue", details: error.message };
    }
}

