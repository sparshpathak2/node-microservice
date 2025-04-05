import express from "express";
import {
    createSpaceGroup,
    deleteSpaceGroup,
    getAllSpaceGroups,
    getSpaceGroupById,
    updateSpaceGroup
} from "../controllers/spaceGroup.controller.js";

const router = express.Router();


// SPACE GROUPS ROUTES
// ✅ Get all space groups
router.get("/", getAllSpaceGroups);

// ✅ Get a space group by id
router.get("/", getSpaceGroupById);

// ✅ Create a new space group
router.post("/", createSpaceGroup);

// ✅ Update a space group
router.put("/:id", updateSpaceGroup);

// ✅ Delete a space group
router.delete("/:id", deleteSpaceGroup);

export default router;