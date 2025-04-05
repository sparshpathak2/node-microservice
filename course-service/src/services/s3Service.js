import 'dotenv/config';
import AWS from 'aws-sdk';
import fs from 'fs';
import { Readable } from 'stream';

// AWS Configuration
const s3 = new AWS.S3();

// export async function checkIfFileExists(bucket, key, maxRetries = 3, delay = 1000) {
//     let attempts = 0;

//     while (attempts < maxRetries) {
//         try {
//             await s3.headObject({ Bucket: bucket, Key: key }).promise();
//             return { success: true, exists: true, code: "FILE_EXISTS", message: "File exists in S3." };
//         } catch (error) {
//             if (error.code === "NotFound") {
//                 return { success: true, exists: false, code: "FILE_NOT_FOUND", message: "File does not exist in S3." };
//             }

//             attempts++;

//             if (attempts < maxRetries) {
//                 await new Promise(resolve => setTimeout(resolve, delay));
//                 delay *= 2; // Exponential backoff
//             } else {
//                 console.error("S3 file existence check failed after multiple retries:", error);
//                 return {
//                     success: false,
//                     code: "CHECK_FAILED",
//                     message: "Error checking file existence after multiple retries.",
//                     error: error.message
//                 };
//             }
//         }
//     }
// }

export async function checkIfFileExists(bucket, key) {
    try {
        await s3.headObject({ Bucket: bucket, Key: key }).promise();
        return { success: true, exists: true, code: "FILE_EXISTS", message: "File exists in S3." };
    } catch (error) {
        if (error.code === "NotFound") {
            return { success: true, exists: false, code: "FILE_NOT_FOUND", message: "File does not exist in S3." };
        }

        console.error("S3 file existence check failed:", error);
        return {
            success: false,
            code: "CHECK_FAILED",
            message: "Error checking file existence.",
            error: error.message
        };
    }
}

export async function uploadToRawS3Bucket(fileBuffer, fileName) {
    try {
        const bucketName = process.env.AWS_S3_RAW_BUCKET;

        // Use the existing function to check if the file exists
        const fileCheck = await checkIfFileExists(bucketName, fileName);

        if (!fileCheck.success) {
            return { success: false, code: "CHECK_FAILED", message: "Failed to check file existence", error: fileCheck.error };
        }

        if (fileCheck.exists) {
            return {
                success: false,
                code: "FILE_EXISTS",
                message: "File already exists in S3",
                fileUrl: `https://${bucketName}.s3.amazonaws.com/${fileName}`
            };
        }

        // Proceed with the upload if file does not exist
        const uploadParams = {
            Bucket: bucketName,
            Key: fileName,
            Body: fileBuffer,
            ContentType: "video/mp4",
        };

        await s3.upload(uploadParams).promise();

        return { success: true, message: "Video uploaded successfully" };
    } catch (error) {
        console.error("S3 Upload Error:", error);
        return { success: false, error: error.message };
    }
}

export async function downloadFromRawS3Bucket(bucket, key) {
    try {
        const params = { Bucket: bucket, Key: key };
        const filePath = `/tmp/${key}`;
        const file = fs.createWriteStream(filePath);

        const { Body } = await s3.getObject(params).promise();

        if (Body instanceof Buffer) {
            Readable.from(Body).pipe(file);
        } else if (Body.pipe) {
            Body.pipe(file);
        } else {
            throw new Error("S3 object Body is not a valid stream or buffer");
        }

        return new Promise((resolve, reject) => {
            file.on('finish', () => resolve(filePath));
            file.on('error', reject);
        });
    } catch (error) {
        console.error("Error downloading from S3:", error);
        throw new Error("Failed to download file from S3");
    }
}

export async function uploadToProdS3Bucket(filePath, key) {
    try {
        const fileStream = fs.createReadStream(filePath);
        const params = {
            Bucket: process.env.AWS_S3_TRANSCODED_BUCKET,
            Key: key,
            Body: fileStream,
        };
        await s3.upload(params).promise();
        return { success: true, message: "File uploaded successfully", key };
    } catch (error) {
        console.error("Error uploading to S3:", error);
        throw new Error("Failed to upload file to S3");
    }
}