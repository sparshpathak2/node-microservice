import express from "express"
import 'dotenv/config'
import { checkUserPermissions, deleteUser, getUser, getUsers, updateUser } from "./controllers/user.controller.js";
import cookieParser from "cookie-parser";

const app = express();

const PORT = process.env.PORT || "3003"

app.use(cookieParser())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("user-management service is live")
})

// Create User
// app.post("/users", createUser)
// app.post("/signup", signupUser)

// Get Users
app.get("/users", getUsers)

// Get a single user
app.get("/users/:id", getUser)

// Update User
app.patch("/users/:id", updateUser)

// Delete User
app.delete("/users/:id", deleteUser)

app.post("/permissions/check", checkUserPermissions)

app.listen(PORT, () => {
    console.log(`The user-management service is running on ${PORT}`)
})