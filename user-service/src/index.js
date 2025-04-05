import express from "express"
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