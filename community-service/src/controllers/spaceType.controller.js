import prisma from "../db/db.config.js";

export const getAllSpaceTypes = async (req, res) => {
    // 0. This controller fetches all the space types from the database

    // 1. Fetch all the space types from the database
    try {
        const spaceTypes = await prisma.spaceType.findMany();

        // 2. Send the space types in the response
        return res.status(200).json({ success: true, data: spaceTypes })
    } catch (error) {
        // 3. Send an error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
};

export const getSpaceTypeById = async (req, res) => {
    // 0. This controller gets space type by id from the database
    // 1. Get the id from the request params
    const spaceTypeId = req.params.id;

    // 2. Fetch the space type from the database
    try {
        const spaceType = await prisma.spaceType.findUnique({
            where: {
                id: spaceTypeId
            }
        })

        if (!spaceType) {
            return res.status(404).json({ success: false, message: "Space type not found" })
        }

        // 3. Send the space type in the response
        return res.status(200).json({ success: true, data: spaceType })
    } catch (error) {
        // 4. Send the error if something goes wrong
        return res.status(500).json({ success: false, message: "Interal server error" })
    }
}

export const createSpaceType = async (req, res) => {
    // 0. This controller create a new space type
    // 1. Get the data from the request body
    const { name } = req.body
    // const userId = req.headers["x-user-id"];

    try {
        // 3. Create a new space type in the database
        const spaceType = await prisma.spaceType.create({
            data: {
                name: name,
            }
        })

        // 4. Send the success message in the response
        return res.status(200).json({ success: true, message: "Space type created successfully", data: spaceType })
    } catch (error) {
        // 5. Send the error if something goes wrong
        console.log("error:", error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const updateSpaceType = async (req, res) => {
    // 0. This controller updates the space type details
    // 1. Get the data from the request body
    const { name } = req.body
    const spaceTypeId = req.params.id;

    // 2. Update the space type details in the db
    try {
        const updatedSpaceType = await prisma.spaceType.update({
            where: {
                id: spaceTypeId
            },
            data: {
                name,
            }
        })

        // 3. Check if space type exists with that id
        if (updatedSpaceType.count === 0) {
            return res.status(404).json({ success: false, code: "DOESNT_EXIST", message: "Space type not found" })
        }

        // 4. Send success message
        return res.status(200).json({ success: true, message: "Space type updated successfully", data: updatedSpaceType })
    } catch (error) {
        // 5. Send server error message
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const deleteSpaceType = async (req, res) => {
    // 0. This controller deletes the space type from the system
    // 1. Get the space type id from the request params
    const spaceTypeId = req.params.id;

    // 2. Delete the space type from the db
    try {
        await prisma.spaceType.delete(({
            where: {
                id: spaceTypeId
            }
        }))

        // 3. Send success message in the response
        return res.status(200).json({ success: true, message: "Space type deleted successfully" })

    } catch (error) {
        // 3. Handle "Record does not exist" error
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, code: "DOESNT_EXIST", message: "Space type not found" });
        }

        // 4. Send error message if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}