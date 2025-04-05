import prisma from "../db/db.config.js";
// import { v4 as uuidv4 } from "uuid";

export const getAllSpaces = async (req, res) => {
    // 0. This controller fetches all the spaces from the database

    // 1. Fetch all the spaces from the database
    try {
        const spaces = await prisma.space.findMany();

        // 2. Send the space in the response
        return res.status(200).json({ success: true, data: spaces })
    } catch (error) {
        // 3. Send an error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
};

export const getSpaceById = async (req, res) => {
    // 0. This controller gets space by id from the database
    // 1. Get the id from the request params
    const spaceId = req.params.id;

    // 2. Fetch the space from the database
    try {
        const space = await prisma.space.findUnique({
            where: {
                id: spaceId
            }
        })

        if (!space) {
            return res.status(404).json({ success: false, message: "Space not found" })
        }

        // 3. Send the space in the response
        return res.status(200).json({ success: true, data: space })
    } catch (error) {
        // 4. Send the error if something goes wrong
        return res.status(500).json({ success: false, message: "Interal server error" })
    }
}

export const createSpace = async (req, res) => {
    // 0. This controller create a new space
    // 1. Get the data from the request body
    const { name, description, accessType, communityId, spaceGroupId, spaceTypeId } = req.body
    // const userId = req.headers["x-user-id"];

    try {
        // 2. Validate required fields
        if (!name || !communityId || !spaceTypeId) {
            return res.status(400).json({ success: false, message: "Name, communityId, and spaceTypeId are required" });
        }

        // 3. Validate communityId exists
        const communityExists = await prisma.community.findUnique({
            where: { id: communityId }
        });
        if (!communityExists) {
            return res.status(404).json({ success: false, message: "Community not found" });
        }

        // 4. Validate spaceGroupId (if provided)
        if (spaceGroupId) {
            const spaceGroupExists = await prisma.spaceGroup.findUnique({
                where: { id: spaceGroupId }
            });
            if (!spaceGroupExists) {
                return res.status(404).json({ success: false, message: "Space Group not found" });
            }
        }

        // 5. Prepare space data object
        const spaceData = {
            name,
            description,
            communityId,
            spaceTypeId,
            // paywallId
        }

        if (accessType) spaceData.accessType = accessType;
        if (spaceGroupId) spaceData.spaceGroupId = spaceGroupId;

        // 3. Create a new space in the database
        const space = await prisma.space.create({
            data: spaceData
        })

        // 4. Send the success message in the response
        return res.status(200).json({ success: true, message: "Space created successfully", data: space })
    } catch (error) {
        // 5. Send the error if something goes wrong
        console.log("error:", error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const updateSpace = async (req, res) => {
    // 0. This controller create a new space
    // 1. Get the data from the request body
    const { name, description, accessType, communityId, spaceGroupId, spaceTypeId } = req.body
    const spaceId = req.params.id;
    // const userId = req.headers["x-user-id"];

    try {
        // 5. Prepare space data object
        const spaceData = {
            name,
            description,
            accessType,
            communityId,
            spaceGroupId,
            spaceTypeId,
            // paywallId
        }

        // if (accessType) spaceData.accessType = accessType;
        // if (spaceGroupId) spaceData.spaceGroupId = spaceGroupId;

        // 3. Create a new space in the database
        const updatedSpace = await prisma.space.update({
            where: { id: spaceId },
            data: spaceData
        })

        // 3. Check if space exists with that id
        if (updatedSpace.count === 0) {
            return res.status(404).json({ success: false, code: "DOESNT_EXIST", message: "Space not found" })
        }

        // 4. Send the success message in the response
        return res.status(200).json({ success: true, message: "Space created successfully", data: updatedSpace })
    } catch (error) {
        // 5. Send the error if something goes wrong
        console.log("error:", error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const deleteSpace = async (req, res) => {
    // 0. This controller deletes the space from the system
    // 1. Get the space id from the request params
    const spaceId = req.params.id;

    // 2. Delete the space from the db
    try {
        await prisma.space.delete(({
            where: {
                id: spaceId
            }
        }))

        // 3. Send success message in the response
        return res.status(200).json({ success: true, message: "Space deleted successfully" })

    } catch (error) {
        // 3. Handle "Record does not exist" error
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, code: "DOESNT_EXIST", message: "Space not found" });
        }

        // 4. Send error message if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}