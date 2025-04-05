import prisma from "../db/db.config.js";
// import { v4 as uuidv4 } from "uuid";

export const getAllSpaceGroups = async (req, res) => {
    // 0. This controller fetches all the space groups from the database

    // 1. Fetch all the space groups from the database
    try {
        const spaceGroups = await prisma.spaceGroup.findMany();

        // 2. Send the space groups in the response
        return res.status(200).json({ success: true, data: spaceGroups })
    } catch (error) {
        // 3. Send an error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
};

export const getSpaceGroupById = async (req, res) => {
    // 0. This controller gets space group by id from the database
    // 1. Get the id from the request params
    const spaceGroupId = req.params.id;

    // 2. Fetch the space group from the database
    try {
        const spaceGroup = await prisma.spaceGroup.findUnique({
            where: {
                id: spaceGroupId
            }
        })

        if (!spaceGroup) {
            return res.status(404).json({ success: false, message: "Space group not found" })
        }

        // 3. Send the space group in the response
        return res.status(200).json({ success: true, data: spaceGroup })
    } catch (error) {
        // 4. Send the error if something goes wrong
        return res.status(500).json({ success: false, message: "Interal server error" })
    }
}

export const createSpaceGroup = async (req, res) => {
    // 0. This controller create a new space group
    // 1. Get the data from the request body
    const { name, description, accessType, communityId } = req.body
    // const userId = req.headers["x-user-id"];

    try {
        // 2. Create paywallId from the paywall service
        // const paywallId = uuidv4();

        const spaceGroupData = {
            name,
            description,
            communityId,
            // paywallId
        }

        if (accessType) spaceGroupData.accessType = accessType;

        // 3. Create a new space group in the database
        const spaceGroup = await prisma.spaceGroup.create({
            data: spaceGroupData
        })

        // 4. Send the success message in the response
        return res.status(200).json({ success: true, message: "Space group created successfully", data: spaceGroup })
    } catch (error) {
        // 5. Send the error if something goes wrong
        console.log("error:", error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const updateSpaceGroup = async (req, res) => {
    // 0. This controller updates the space group details
    // 1. Get the data from the request body
    const { name, description, accessType, communityId, paywallId } = req.body
    const spaceGroupId = req.params.id;

    // 2. Update the space group details in the db
    try {
        const updatedSpaceGroup = await prisma.spaceGroup.update({
            where: {
                id: spaceGroupId
            },
            data: {
                name,
                description,
                accessType,
                communityId,
                paywallId
            }
        })

        // 3. Check if space group exists with that id
        if (updateSpaceGroup.count === 0) {
            return res.status(404).json({ success: false, code: "DOESNT_EXIST", message: "Space group not found" })
        }

        // 4. Send success message
        return res.status(200).json({ success: true, message: "Space group updated successfully", data: updatedSpaceGroup })
    } catch (error) {
        // 5. Send server error message
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const deleteSpaceGroup = async (req, res) => {
    // 0. This controller deletes the space group from the system
    // 1. Get the space group id from the request params
    const spaceGroupId = req.params.id;

    // 2. Delete the space group from the db
    try {
        await prisma.spaceGroup.delete(({
            where: {
                id: spaceGroupId
            }
        }))

        // 3. Send success message in the response
        return res.status(200).json({ success: true, message: "Space group deleted successfully" })

    } catch (error) {
        // 3. Handle "Record does not exist" error
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, code: "DOESNT_EXIST", message: "Space group not found" });
        }

        // 4. Send error message if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}