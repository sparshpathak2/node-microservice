import express from "express";
import {
    createCohort,
    deleteCohort,
    getAllCohorts,
    getCohortById,
    getCohortBySlug,
    updateCohort
} from "../controllers/cohort.controller.js";

const router = express.Router();

// ✅ Get all communities
router.get("/", getAllCohorts);

// ✅ Get a community by id
router.get("/", getCohortById);

// ✅ Get a community by slug
router.get("/slug/:slug", getCohortBySlug);

// ✅ Create a new community
router.post("/", createCohort);

// ✅ Update a community
router.put("/:id", updateCohort);

// ✅ Delete a community
router.delete("/:id", deleteCohort);


// router.use("/:id", authMiddleware, permissionsMiddleware("Manager"), proxy(USER_SERVICE, {
//     proxyReqPathResolver: (req) => `/users/${req.params.id}`
// }));

export default router;