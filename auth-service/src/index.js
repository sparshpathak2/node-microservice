import express from "express"
import 'dotenv/config'
import { loginUser, logoutUser, signupUser, verifyToken } from "./controllers/auth.controller.js";
import cookieParser from "cookie-parser";
import zoomAuthRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || "3002"


app.use(cookieParser())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("authentication service is live")
})

// User signup route
app.post("/signup", signupUser)

// User login route
app.post('/login', loginUser)

// User logout route
app.post('/logout', logoutUser)

// Verify token route
app.post("/verify-token", verifyToken)

// Redirect users to Zoom OAuth login
app.use("/auth", zoomAuthRoutes);

app.listen(PORT, () => {
    console.log(`The authentication service is running on ${PORT}`)
})