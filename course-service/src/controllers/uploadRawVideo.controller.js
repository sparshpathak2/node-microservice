import { uploadToRawS3Bucket } from '../services/s3Service.js';
import { processQueueMessage } from '../services/queueService.js';

export async function uploadRawVideo(req, res) {

    console.log("===== Incoming Request =====");
    console.log("Request Headers:", req.headers);
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);
    console.log("============================");

    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const { originalname, buffer } = req.file;
        const uploadResult = await uploadToRawS3Bucket(buffer, originalname);

        if (!uploadResult.success) {
            if (uploadResult.code === "FILE_EXISTS") {
                return res.status(409).json({
                    success: false,
                    code: "FILE_EXISTS",
                    message: "File with this name already exists.",
                    // fileUrl: uploadResult.fileUrl
                });
            }
            return res.status(500).json({
                success: false,
                code: "UPLOAD_FAILED",
                message: "Failed to upload video",
                error: uploadResult.error
            });
        }

        console.log(`Raw video uploaded: ${originalname}`);

        // Trigger queue processing after successful upload
        await processQueueMessage();

        return res.status(201).json({ success: true, message: "Video uploaded successfully", fileUrl: uploadResult.fileUrl });
    } catch (error) {
        console.error("Error uploading video:", error);
        return res.status(500).json({ success: false, code: "SERVER_ERROR", message: "Error uploading video", error: error.message });
    }
}
