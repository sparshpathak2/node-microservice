import express from "express";
import { createMembership, deleteMembership, getAllMemberships, getMembershipById, updateMembership } from "../controllers/membership.controller.js";

const router = express.Router();


// SPACE GROUPS ROUTES
// ✅ Get all space groups
router.get("/", getAllMemberships);

// ✅ Get a space group by id
router.get("/", getMembershipById);

// ✅ Create a new space group
router.post("/", createMembership);

// ✅ Update a space group
router.put("/:id", updateMembership);

// ✅ Delete a space group
router.delete("/:id", deleteMembership);

export default router;