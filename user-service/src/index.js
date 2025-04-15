import express from "express"
import cors from "cors"
import 'dotenv/config'
import {
    checkUserPermissions,
    deleteUser,
    getUser,
    getUsers,
    getZoomCredentials,
    updateUser,
    updateZoomToken,
    getZoomStatus
} from "./controllers/user.controller.js";
import cookieParser from "cookie-parser";

const app = express();

const PORT = process.env.PORT || "3003"
// ✅ Allow frontend origin with credentials
// app.use(
//     cors({
//         origin: "http://localhost:3000", // your frontend
//         credentials: true,
//     })
// )

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true); // Allow non-browser tools

            const allowedOriginRegex = /^http:\/\/([a-z0-9-]+)\.lvh\.me:3000$/;

            if (
                origin === 'http://localhost:3000' ||
                origin === 'http://lvh.me:3000' ||
                allowedOriginRegex.test(origin)
            ) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use(cookieParser())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("user-management service is live")
})

// Get Users
app.get("/users", getUsers)

// Get a single user
app.get("/users/:id", getUser)

// Update User
app.patch("/users/:id", updateUser)

// Delete User
app.delete("/users/:id", deleteUser)

// Check user permissions
app.post("/permissions/check", checkUserPermissions)

// Update Zoom tokens in user model
app.post("/users/update-zoom-token", updateZoomToken)

// Check Zoom credentials or tokens
app.get("/users/:userId/zoom-credentials", getZoomCredentials)

// Check user Zoom status
app.get("/users/:userId/zoom-status", getZoomStatus);

app.listen(PORT, () => {
    console.log(`The user-management service is running on ${PORT}`)
})