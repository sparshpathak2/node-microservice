import express from "express"
import cors from "cors"
import 'dotenv/config'
import { loginUser, logoutUser, signupUser, verifyToken } from "./controllers/auth.controller.js";
import cookieParser from "cookie-parser";
import zoomAuthRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || "3002"

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