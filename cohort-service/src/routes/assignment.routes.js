import express from "express";
import {
    createAssignment,
    deleteAssignment,
    getAllAssignments,
    getAssignmentById,
    // getAssignmentBySlug,
    updateAssignment
} from "../controllers/assignment.controller.js";

const router = express.Router();

// ✅ Get all communities
router.get("/", getAllAssignments);

// ✅ Get a community by id
router.get("/", getAssignmentById);

// ✅ Get a community by slug
// router.get("/slug/:slug", getAssignmentBySlug);

// ✅ Create a new community
router.post("/", createAssignment);

// ✅ Update a community
router.put("/:id", updateAssignment);

// ✅ Delete a community
router.delete("/:id", deleteAssignment);


// router.use("/:id", authMiddleware, permissionsMiddleware("Manager"), proxy(USER_SERVICE, {
//     proxyReqPathResolver: (req) => `/users/${req.params.id}`
// }));

export default router;