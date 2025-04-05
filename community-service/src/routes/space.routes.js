import express from "express";
import {
    createSpace,
    deleteSpace,
    getAllSpaces,
    getSpaceById,
    updateSpace
} from "../controllers/space.controller.js";

const router = express.Router();


// SPACE GROUPS ROUTES
// ✅ Get all space groups
router.get("/", getAllSpaces);

// ✅ Get a space group by id
router.get("/", getSpaceById);

// ✅ Create a new space group
router.post("/", createSpace);

// ✅ Update a space group
router.put("/:id", updateSpace);

// ✅ Delete a space group
router.delete("/:id", deleteSpace);

export default router;