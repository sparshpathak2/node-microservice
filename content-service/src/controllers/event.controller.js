import prisma from "../db/db.config.js";
import { createMeeting } from "../services/zoomService.js";

// 🔹 Create a new Zoom Meeting (Event)
export const createZoomMeeting = async (req, res) => {
    try {
        // const { title, eventDate, location, contentId } = req.body;
        const { title, eventDate, location } = req.body;
        // const createdBy = req.user.id; // 🔹 Authenticated User (Admin)
        const userId = req.headers["x-user-id"]; // 🔹 Authenticated User (Admin)

        // console.log("userId in createZoomMeeting:", userId);

        // 🔹 Validate Input
        if (!title || !eventDate || !location) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }

        // 🔹 Create Zoom Meeting & Event
        const meetingDetails = await createMeeting({ title, eventDate, location, userId });

        res.status(201).json({ success: true, meeting: meetingDetails });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 🔹 Get all Events
export const getAllEvents = async (req, res) => {
    try {
        const events = await prisma.events.findMany();

        if (!events || events.length === 0) {
            return res.status(404).json({ success: false, message: "No events found" })
        }

        return res.status(200).json({ success: true, data: events })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// 🔹 Get a single Event by ID
export const getEventById = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await prisma.events.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        res.json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 🔹 Update an Event
export const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { title, startTime, duration } = req.body;

        // 🔹 Directly attempt to update; Prisma throws an error if event doesn't exist
        const updatedEvent = await prisma.events.update({
            where: { id: eventId },
            data: { title, startTime, duration },
        });

        res.json({ success: true, data: updatedEvent });
    } catch (error) {
        // 🔹 Handle "Event Not Found" error from Prisma
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 🔹 Delete an Event
export const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        // 🔹 Directly attempt to delete; Prisma throws an error if event doesn't exist
        await prisma.events.delete({
            where: { id: eventId },
        });

        res.json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
        // 🔹 Handle "Event Not Found" error from Prisma
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
