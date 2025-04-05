import express from "express";
import proxy from "express-http-proxy";
import authMiddleware from "../middlewares/auth.middleware.js";
import permissionsMiddleware from "../middlewares/permissions.middleware.js";

const router = express.Router();
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || "http://localhost:3002";

router.use("/", authMiddleware, proxy(AUTH_SERVICE, {
    proxyReqPathResolver: (req) => `${req.url}`,
    // proxyReqOptDecorator(proxyReqOpts, srcReq) {
    //     proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
    //     // proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
    //     return proxyReqOpts;
    // }
}));

router.use("/auth", authMiddleware, proxy(AUTH_SERVICE, {
    proxyReqPathResolver: (req) => `/auth${req.url}`,
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
        // proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
        return proxyReqOpts;
    }
}));

export default router;