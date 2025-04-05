import express from "express";
import {
    getAllCommunities,
    getCommunityById,
    createCommunity,
    updateCommunity,
    deleteCommunity
} from "../controllers/community.controller.js";

const router = express.Router();

// ✅ Get all communities
router.get("/", getAllCommunities);

// ✅ Get a community by id
router.get("/", getCommunityById);

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