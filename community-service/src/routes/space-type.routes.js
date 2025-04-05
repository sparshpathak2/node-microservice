import express from "express";
import { createSpaceType, deleteSpaceType, getAllSpaceTypes, getSpaceTypeById, updateSpaceType } from "../controllers/spaceType.controller.js";

const router = express.Router();


// SPACE GROUPS ROUTES
// ✅ Get all space groups
router.get("/", getAllSpaceTypes);

// ✅ Get a space group by id
router.get("/", getSpaceTypeById);

// ✅ Create a new space group
router.post("/", createSpaceType);

// ✅ Update a space group
router.put("/:id", updateSpaceType);

// ✅ Delete a space group
router.delete("/:id", deleteSpaceType);

export default router;