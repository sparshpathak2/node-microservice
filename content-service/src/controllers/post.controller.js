import prisma from "../db/db.config.js";

// ✅ Create a new post
export const createPost = async (req, res) => {
    try {
        const { title, content, createdBy } = req.body;

        // Create the Post
        const createdPost = await prisma.posts.create({
            data: {
                title,
                content,
                createdBy,
                createdAt: new Date(),
                updatedAt: new Date(),

                // 🔹 Automatically create and link a Content record
                contentRel: {
                    create: {
                        title: title || "Post Content Title",
                        description: "This content is auto-created for a post.",
                        contentTypeId: "ba060da4-1128-4fad-819b-485f9c0c4a0c", // Replace with actual content type ID
                        spaceId: "6150babf-b446-4fc3-b91a-61fa1cb38683", // Replace with actual space ID
                        createdBy,
                        status: "DRAFT",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                },
            },
            include: { contentRel: true }, // Include the related Content in response
        });

        res.status(201).json({ success: true, data: createdPost });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Get a post by ID
export const getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await prisma.posts.findUnique({
            where: { id },
            include: { contentRel: true }, // Get related Content
        });

        if (!post) return res.status(404).json({ error: "Post not found" });

        res.json(post);
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Update a post
export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        const updatedPost = await prisma.posts.update({
            where: { id },
            data: { title, content, updatedAt: new Date() },
        });

        res.json(updatedPost);
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Delete a post
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.posts.delete({ where: { id } });

        // Optionally delete related Content
        await prisma.content.delete({ where: { id } });

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Get all posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await prisma.posts.findMany({
            include: { contentRel: true },
            orderBy: { createdAt: "desc" },
        });

        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
