import express from "express";
import proxy from "express-http-proxy";
import authMiddleware from "../middlewares/auth.middleware.js";
import permissionsMiddleware from "../middlewares/permissions.middleware.js";

const router = express.Router();
const USER_SERVICE = process.env.USER_SERVICE_URL || "http://localhost:3003";

// Route for `/users` (Only Admins can access)
router.use("/", authMiddleware, permissionsMiddleware("Admin"), proxy(USER_SERVICE, {
    proxyReqPathResolver: (req) => `/users${req.url}`
}));

// Route for `/users/:id` (Managers can access specific user details)
// router.use("/:id", authMiddleware, permissionsMiddleware("Manager"), proxy(USER_SERVICE, {
//     proxyReqPathResolver: (req) => `/users/${req.params.id}`
// }));

export default router;
