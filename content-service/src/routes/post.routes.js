import express from "express";
import {
    createPost,
    deletePost,
    getAllPosts,
    getPostById,
    updatePost
} from "../controllers/post.controller.js";

const router = express.Router();

router.post("/", createPost);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;