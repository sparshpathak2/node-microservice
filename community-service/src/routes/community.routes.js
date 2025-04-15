import express from "express";
import {
    getAllCommunities,
    getCommunityById,
    createCommunity,
    updateCommunity,
    deleteCommunity,
    getCommunityBySlug
} from "../controllers/community.controller.js";

const router = express.Router();

// ✅ Get all communities
router.get("/", getAllCommunities);

// ✅ Get a community by id
router.get("/", getCommunityById);

// ✅ Get a community by slug
router.get("/slug/:slug", getCommunityBySlug);

// ✅ Create a new community
router.post("/", createCommunity);

// ✅ Update a community
router.put("/:id", updateCommunity);

// ✅ Delete a community
router.delete("/:id", deleteCommunity);


// router.use("/:id", authMiddleware, permissionsMiddleware("Manager"), proxy(USER_SERVICE, {
//     proxyReqPathResolver: (req) => `/users/${req.params.id}`
// }));

export default router;