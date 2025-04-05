import express from 'express';
import dotenv from 'dotenv';
// import cors from 'cors';
import uploadRoutes from './routes/uploadRawVideo.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Routes
app.use('/api', uploadRoutes);

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: "Course service is running" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
