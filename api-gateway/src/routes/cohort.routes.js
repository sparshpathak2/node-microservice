import express from "express";
import proxy from "express-http-proxy";
import authMiddleware from "../middlewares/auth.middleware.js";
import permissionsMiddleware from "../middlewares/permissions.middleware.js";

const router = express.Router();
const COHORT_SERVICE = process.env.COHORT_SERVICE_URL || "http://localhost:3007";

// Proxy routes for cohorts (Admins and moderators can manage)
router.use("/cohorts", authMiddleware, permissionsMiddleware("Admin"), proxy(COHORT_SERVICE, {
    proxyReqPathResolver: (req) => `/cohorts${req.url}`,
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
        // proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
        return proxyReqOpts;
    }
}));

// Proxy routes for assignments (All authenticated users can access spaces)
router.use("/assignments", authMiddleware, permissionsMiddleware("Admin"), proxy(COHORT_SERVICE, {
    proxyReqPathResolver: (req) => `/assignments${req.url}`,
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
        // proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
        return proxyReqOpts;
    }
}));

export default router;