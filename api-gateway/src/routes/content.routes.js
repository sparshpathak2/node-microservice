import express from "express";
import proxy from "express-http-proxy";
import authMiddleware from "../middlewares/auth.middleware.js";
import permissionsMiddleware from "../middlewares/permissions.middleware.js";

const router = express.Router();
const CONTENT_SERVICE = process.env.CONTENT_SERVICE_URL || "http://localhost:3005";

// Proxy routes for communities (Admins can manage communities)
router.use("/events", authMiddleware, permissionsMiddleware("Admin"), proxy(CONTENT_SERVICE, {
    proxyReqPathResolver: (req) => `/events${req.url}`,
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
        // proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
        return proxyReqOpts;
    }
}));

export default router;