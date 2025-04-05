import express from "express"
import 'dotenv/config'
import proxy from "express-http-proxy"
import authMiddleware from "./middlewares/auth.middleware.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/users.routes.js"
import communityRoutes from "./routes/community.routes.js"
import authRoutes from "./routes/auth.routes.js"
import contentRoutes from "./routes/content.routes.js"

const app = express();
const PORT = process.env.PORT || "3001"
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || "http://localhost:3002"

app.use(cookieParser())
app.use(express.json())

// Auth service
// app.use('/api/authentication', authMiddleware, proxy(AUTH_SERVICE))

// app.use("/api/authentication", authMiddleware, proxy(AUTH_SERVICE, {
//     proxyReqPathResolver: (req) => `/api/authentication${req.url}`,
//     proxyReqOptDecorator(proxyReqOpts, srcReq) {
//         proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
//         // proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
//         return proxyReqOpts;
//     }
// }));


// User management service
app.use("/api/authentication", authRoutes);

// User management service
app.use("/api/user-management/users", userRoutes);

// Community service
app.use("/api/community", communityRoutes);

// Content service
app.use("/api/content", contentRoutes);

app.listen(PORT, console.log(`The api-gateway service is running on ${PORT}`))