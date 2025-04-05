import express from "express";
import { updateZoomToken } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/users/update-zoom-token", updateZoomToken);

export default router;