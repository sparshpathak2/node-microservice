import express from 'express';
import multer from 'multer';
import { uploadRawVideo } from '../controllers/uploadRawVideo.controller.js';

const router = express.Router();

// Multer storage setup (Temporary storage before upload to S3)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('video'), uploadRawVideo);

export default router;