import prisma from "../db/db.config.js";

export const getAllCommunities = async (req, res) => {
    // 0. This controller fetches all the communities from the database

    // 1. Fetch all the communities from the database
    try {
        const communities = await prisma.community.findMany();

        // 2. Send the communities in the response
        return res.status(200).json({ success: true, data: communities })
    } catch (error) {
        // 3. Send an error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
};

export const getCommunityById = async (req, res) => {
    // 0. This controller gets community by id from the database
    // 1. Get the id from the request params
    const communityId = req.params.id;

    // 2. Fetch the community from the database
    try {
        const community = await prisma.community.findUnique({
            where: {
                id: communityId
            }
        })

        if (!community) {
            return res.status(404).json({ success: false, message: "Community not found" })
        }

        // 3. Send the community in the response
        return res.status(200).json({ success: true, data: community })
    } catch (error) {
        // 4. Send the error if something goes wrong
        return res.status(500).json({ success: false, message: "Interal server error" })
    }
}

export const getCommunityBySlug = async (req, res) => {
    // 0. This controller gets community by id from the database
    // 1. Get the id from the request params
    const communitySlug = req.params.slug;

    if (!communitySlug) {
        return res.status(400).json({ success: false, message: "Community slus is required" })
    }

    // 2. Fetch the community from the database
    try {
        const community = await prisma.community.findUnique({
            where: {
                slug: communitySlug
            }
        })

        if (!community) {
            return res.status(404).json({ success: false, message: "Community not found" })
        }

        // 3. Send the community in the response
        return res.status(200).json({ success: true, data: community })
    } catch (error) {
        // 4. Send the error if something goes wrong
        return res.status(500).json({ success: false, message: "Interal server error" })
    }
}

export const createCommunity = async (req, res) => {
    // 0. This controller create a new community
    // 1. Get the data from the request body
    const { name, description } = req.body
    const userId = req.headers["x-user-id"];

    console.log("userId in create community controller:", userId)

    try {
        // 2. Check for community name uniqueness
        // const existingCommunity = await prisma.community.findFirst({
        //     where: {
        //         name: name
        //     }
        // })

        // if (existingCommunity) {
        //     return res.status(400).json({ success: false, code: "ALREADY_EXISTS", message: "Community with that name already exists" })
        // }

        // 3. Create a new community in the database
        const community = await prisma.community.create({
            data: {
                name,
                description,
                ownerId: userId
            }
        })

        // 4. Send the success message in the response
        return res.status(200).json({ success: true, message: "Community created successfully", data: community })
    } catch (error) {
        // 5. Send the error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const updateCommunity = async (req, res) => {
    // 0. This controller updates the community details
    // 1. Get the data from the request body
    const { name, description } = req.body
    const communityId = req.params.id;

    // 2. Update the community details in the db
    try {
        const updatedCommunity = await prisma.community.update({
            where: {
                id: communityId
            },
            data: {
                name,
                description
            }
        })

        // 3. Check if community exists with that id
        if (updatedCommunity.count === 0) {
            return res.status(404).json({ success: false, code: "DOESNT_EXIST", message: "Community not found" })
        }

        // 4. Send success message
        return res.status(200).json({ success: true, message: "Community updated successfully", data: updatedCommunity })
    } catch (error) {
        // 5. Send server error message
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const deleteCommunity = async (req, res) => {
    // 0. This controller deletes the community from the system
    // 1. Get the community id from the request params
    const communityId = req.params.id;

    // 2. Delete the community from the db
    try {
        await prisma.community.delete(({
            where: {
                id: communityId
            }
        }))

        // 3. Send success message in the response
        return res.status(200).json({ success: true, message: "Community deleted successfully" })

    } catch (error) {
        // 3. Handle "Record does not exist" error
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, code: "DOESNT_EXIST", message: "Community not found" });
        }

        // 4. Send error message if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}