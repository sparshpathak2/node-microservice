import express from "express"
import cors from "cors"
import 'dotenv/config'
import proxy from "express-http-proxy"
import authMiddleware from "./middlewares/auth.middleware.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/users.routes.js"
import communityRoutes from "./routes/community.routes.js"
import authRoutes from "./routes/auth.routes.js"
import contentRoutes from "./routes/content.routes.js"
import cohortRoutes from "./routes/cohort.routes.js"

const app = express();
const PORT = process.env.PORT || "3001"
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || "http://localhost:3002"

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

// User management service
app.use("/api/authentication", authRoutes);

// User management service
app.use("/api/user-management/users", userRoutes);

// Community service
app.use("/api/community", communityRoutes);

// Content service
app.use("/api/content", contentRoutes);

// Cohort service
app.use("/api/cohort/", cohortRoutes)

app.listen(PORT, console.log(`The api-gateway service is running on ${PORT}`))