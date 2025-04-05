import express from "express";
import proxy from "express-http-proxy";
import authMiddleware from "../middlewares/auth.middleware.js";
import permissionsMiddleware from "../middlewares/permissions.middleware.js";

const router = express.Router();
const COMMUNITY_SERVICE = process.env.COMMUNITY_SERVICE_URL || "http://localhost:3004";

// Proxy routes for communities (Admins can manage communities)
router.use("/communities", authMiddleware, permissionsMiddleware("Admin"), proxy(COMMUNITY_SERVICE, {
    proxyReqPathResolver: (req) => `/communities${req.url}`,
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
        // proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
        return proxyReqOpts;
    }
}));

// Proxy routes for space groups (Admins and moderators can manage)
router.use("/space-groups", authMiddleware, permissionsMiddleware("Admin"), proxy(COMMUNITY_SERVICE, {
    proxyReqPathResolver: (req) => `/space-groups${req.url}`,
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
        // proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
        return proxyReqOpts;
    }
}));

// Proxy routes for spaces (All authenticated users can access spaces)
router.use("/spaces", authMiddleware, permissionsMiddleware("Admin"), proxy(COMMUNITY_SERVICE, {
    proxyReqPathResolver: (req) => `/spaces${req.url}`,
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
        // proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
        return proxyReqOpts;
    }
}));

// Proxy routes for space types (All authenticated users can access spaces)
router.use("/space-types", authMiddleware, permissionsMiddleware("Admin"), proxy(COMMUNITY_SERVICE, {
    proxyReqPathResolver: (req) => `/space-types${req.url}`,
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
        // proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
        return proxyReqOpts;
    }
}));

// Proxy routes for memberships (Users can manage their own memberships)
router.use("/memberships", authMiddleware, permissionsMiddleware("Admin"), proxy(COMMUNITY_SERVICE, {
    proxyReqPathResolver: (req) => `/memberships${req.url}`,
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
        // proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
        return proxyReqOpts;
    }
}));

export default router;