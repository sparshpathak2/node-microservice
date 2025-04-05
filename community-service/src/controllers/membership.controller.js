import prisma from "../db/db.config.js";

export const getAllMemberships = async (req, res) => {
    // 0. This controller fetches all the memberships from the database

    // 1. Fetch all the memberships from the database
    try {
        const memberships = await prisma.membership.findMany();

        // 2. Send the membership in the response
        return res.status(200).json({ success: true, data: memberships })
    } catch (error) {
        // 3. Send an error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
};

export const getMembershipById = async (req, res) => {
    // 0. This controller gets membership by id from the database
    // 1. Get the id from the request params
    const membershipId = req.params.id;

    // 2. Fetch the membership from the database
    try {
        const membership = await prisma.membership.findUnique({
            where: {
                id: membershipId
            }
        })

        if (!membership) {
            return res.status(404).json({ success: false, message: "Membership not found" })
        }

        // 3. Send the membership in the response
        return res.status(200).json({ success: true, data: membership })
    } catch (error) {
        // 4. Send the error if something goes wrong
        return res.status(500).json({ success: false, message: "Interal server error" })
    }
}

export const createMembership = async (req, res) => {
    // 0. This controller create a new membership

    // 1. Get the data from the request body
    const { userId, communityId, status } = req.body
    // const userId = req.headers["x-user-id"];

    try {
        // 2. Validate required fields
        if (!communityId) {
            return res.status(400).json({ success: false, message: "CommunityId is required" });
        }

        // 3. Validate communityId exists
        const communityExists = await prisma.community.findUnique({
            where: { id: communityId }
        });

        if (!communityExists) {
            return res.status(404).json({ success: false, message: "Community not found" });
        }

        const membershipData = {
            userId,
            communityId,
        }

        if (status) membershipData.status = status;

        // 3. Create a new membership in the database
        const membership = await prisma.membership.create({
            data: membershipData
        })

        // 4. Send the success message in the response
        return res.status(200).json({ success: true, message: "Membership created successfully", data: membership })
    } catch (error) {
        // 5. Send the error if something goes wrong
        console.log("error:", error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const updateMembership = async (req, res) => {
    // 0. This controller create a new membership
    // 1. Get the data from the request body
    const { userId, communityId, status } = req.body
    const membershipId = req.params.id;
    // const userId = req.headers["x-user-id"];

    try {
        // 5. Prepare space data object
        const membershipData = {
            userId,
            communityId,
            status
        }

        // if (accessType) spaceData.accessType = accessType;
        // if (spaceGroupId) spaceData.spaceGroupId = spaceGroupId;

        // 3. Create a new space in the database
        const updatedMembership = await prisma.membership.update({
            where: { id: membershipId },
            data: membershipData
        })

        // 3. Check if space exists with that id
        if (updatedMembership.count === 0) {
            return res.status(404).json({ success: false, code: "DOESNT_EXIST", message: "Membership not found" })
        }

        // 4. Send the success message in the response
        return res.status(200).json({ success: true, message: "Membership created successfully", data: updatedMembership })
    } catch (error) {
        // 5. Send the error if something goes wrong
        console.log("error:", error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const deleteMembership = async (req, res) => {
    // 0. This controller deletes the membership from the system
    // 1. Get the membership id from the request params
    const membershipId = req.params.id;

    // 2. Delete the membership from the db
    try {
        await prisma.membership.delete(({
            where: {
                id: membershipId
            }
        }))

        // 3. Send success message in the response
        return res.status(200).json({ success: true, message: "membership deleted successfully" })

    } catch (error) {
        // 3. Handle "Record does not exist" error
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, code: "DOESNT_EXIST", message: "membership not found" });
        }

        // 4. Send error message if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}