import axios from "axios";
import { PrismaClient } from "@prisma/client";
import 'dotenv/config'
// import { refreshZoomToken } from "../utils/zoomUtils.js";

const prisma = new PrismaClient();

// Function to refresh Zoom token
export const refreshZoomToken = async (refreshToken, userId) => {
    try {
        const response = await axios.post("https://zoom.us/oauth/token", null, {
            params: {
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            },
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const { access_token: newAccessToken, refresh_token: newRefreshToken, expires_in: expiresIn } = response.data;

        // 🔹 Call User Service API to update tokens
        try {
            const updateResponse = await axios.put(`http://localhost:3002/auth/refresh-zoom-token/${userId}`, {
                // const updateResponse = await axios.put(`http://localhost:3001/api/authentication/auth/refresh-zoom-token/${userId}`, {
                zoomAccessToken: newAccessToken,
                zoomRefreshToken: newRefreshToken,
                zoomTokenExpiry: new Date(Date.now() + expiresIn * 1000),
            });

            console.log("Update Response:", updateResponse.data);
        } catch (updateError) {
            console.error("Error updating Zoom token in backend:", updateError.response ? updateError.response.data : updateError.message);
        }

        return newAccessToken;
    } catch (error) {
        console.error("Error refreshing Zoom token:", error.message);
        throw new Error("Failed to refresh Zoom token");
    }
};

// Function to create Zoom meeting & event
export const createMeeting = async ({ title, eventDate, location, userId }) => {
    try {
        // 🔹 Step 1: Fetch Zoom Credentials from User Service
        const userServiceResponse = await axios.get(
            `http://localhost:3003/users/${userId}/zoom-credentials`
        );

        if (!userServiceResponse.data.success) {
            throw new Error("Failed to fetch Zoom credentials");
        }

        // console.log("ZoomCreds from User service:", userServiceResponse.data);

        let { zoomAccessToken, zoomRefreshToken, zoomTokenExpiry } = userServiceResponse.data;

        // 🔹 Step 2: Refresh Zoom Token if Expired
        if (new Date() > new Date(zoomTokenExpiry)) {
            console.log("🔄 Zoom token expired. Refreshing...");
            zoomAccessToken = await refreshZoomToken(zoomRefreshToken, userId);
        }

        // 🔹 Step 3: Validate & Convert eventDate
        // console.log("Received eventDate:", eventDate, "Type:", typeof eventDate);

        if (!eventDate) {
            throw new Error("eventDate is required");
        }

        let parsedEventDate = new Date(eventDate);

        if (isNaN(parsedEventDate.getTime())) {
            throw new Error(`Invalid eventDate format: ${eventDate}`);
        }

        console.log("Parsed eventDate:", parsedEventDate.toISOString());

        // 🔹 Step 4: Create Zoom Meeting
        const zoomResponse = await axios.post(
            `https://api.zoom.us/v2/users/me/meetings`,
            {
                topic: title || "Event Meeting",
                type: 2, // Scheduled Meeting
                start_time: parsedEventDate.toISOString(),
                duration: 60, // 60 minutes
                timezone: "Asia/Kolkata",
                settings: { host_video: true, participant_video: true },
            },
            {
                headers: {
                    Authorization: `Bearer ${zoomAccessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!zoomResponse || !zoomResponse.data) {
            throw new Error("Failed to create Zoom meeting");
        }

        // 🔹 Step 5: Save Event & Content Details in Content Service
        const createdEvent = await prisma.events.create({
            data: {
                eventDate: parsedEventDate, // Store as Date object
                location,
                createdBy: userId,
                zoomMeetingId: String(zoomResponse.data.id), // Ensure it's a string
                zoomHostId: zoomResponse.data.host_id,
                zoomJoinUrl: zoomResponse.data.join_url,
                zoomStartUrl: zoomResponse.data.start_url,
                createdAt: new Date(),
                updatedAt: new Date(),

                // 🔹 Automatically create and link a Content record
                contentRel: {
                    create: {
                        title: title || "Event Content Title",
                        description: "This content is auto-created for an event.",
                        contentTypeId: "ba060da4-1128-4fad-819b-485f9c0c4a0c", // Replace with actual content type
                        spaceId: "6150babf-b446-4fc3-b91a-61fa1cb38683", // Replace with actual space ID
                        createdBy: userId,
                        status: "DRAFT",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                },
            },
        });

        return createdEvent;
    } catch (error) {
        console.error("❌ Error in createMeeting:", error.message);
        throw new Error(error.message);
    }
};

