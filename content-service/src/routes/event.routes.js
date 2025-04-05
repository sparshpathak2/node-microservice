import express from "express";
import {
    createZoomMeeting,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
} from "../controllers/event.controller.js";

const router = express.Router();

// 🔹 Create a Zoom Meeting for an Event
router.post("/", createZoomMeeting);

// 🔹 Get all Events
router.get("/", getAllEvents);

// 🔹 Get a single Event by ID
router.get("/:eventId", getEventById);

// 🔹 Update an Event by ID
router.put("/:eventId", updateEvent);

// 🔹 Delete an Event by ID
router.delete("/:eventId", deleteEvent);

export default router;