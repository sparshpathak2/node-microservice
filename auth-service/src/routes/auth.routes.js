import express from "express";
import dotenv from "dotenv";
import { zoomCallback, updateZoomToken } from "../controllers/auth.controller.js";

dotenv.config();
const router = express.Router();

// Step 1: Send Zoom Auth URL to Frontend
router.get("/zoom-auth", (req, res) => {

    const userId = req.headers["x-user-id"];

    console.log("userId in zoom:", userId)

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    // Include userId in the redirect URL
    const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.ZOOM_CLIENT_ID}&redirect_uri=${process.env.ZOOM_REDIRECT_URI}&state=${userId}`;

    res.json({ authUrl: zoomAuthUrl });  // Send URL to frontend
});

// Step 2: Handle Zoom Callback
router.get("/zoom/callback", zoomCallback);

router.put("/refresh-zoom-token/:userId", updateZoomToken);

export default router;