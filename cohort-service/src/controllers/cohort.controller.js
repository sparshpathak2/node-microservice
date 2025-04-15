import prisma from "../db/db.config.js";

export const getAllCohorts = async (req, res) => {
    // 0. This controller fetches all the cohorts from the database
    try {
        const cohorts = await prisma.cohort.findMany();

        // 2. Send the cohorts in the response
        return res.status(200).json({ success: true, data: cohorts });
    } catch (error) {
        // 3. Send an error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getCohortById = async (req, res) => {
    // 0. This controller gets cohort by id from the database
    const cohortId = req.params.id;

    try {
        const cohort = await prisma.cohort.findUnique({
            where: {
                id: cohortId
            }
        });

        if (!cohort) {
            return res.status(404).json({ success: false, message: "Cohort not found" });
        }

        // 3. Send the cohort in the response
        return res.status(200).json({ success: true, data: cohort });
    } catch (error) {
        // 4. Send the error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getCohortBySlug = async (req, res) => {
    // 0. This controller gets cohort by slug from the database
    const cohortSlug = req.params.slug;

    if (!cohortSlug) {
        return res.status(400).json({ success: false, message: "Cohort slug is required" });
    }

    try {
        const cohort = await prisma.cohort.findUnique({
            where: {
                slug: cohortSlug
            }
        });

        if (!cohort) {
            return res.status(404).json({ success: false, message: "Cohort not found" });
        }

        // 3. Send the cohort in the response
        return res.status(200).json({ success: true, data: cohort });
    } catch (error) {
        // 4. Send the error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const createCohort = async (req, res) => {
    // 0. This controller creates a new cohort
    const { name, slug, description, startDate, endDate, spaceId } = req.body;
    const userId = req.headers["x-user-id"];
    // const userId = req.user?.id

    // console.log("userid in create cohort controller:", userId)

    try {
        // 1. Check for cohort name or slug uniqueness
        const existingCohort = await prisma.cohort.findUnique({
            where: {
                slug: slug
            }
        });

        if (existingCohort) {
            return res.status(400).json({ success: false, code: "ALREADY_EXISTS", message: "Cohort with that slug already exists" });
        }

        // 2. Create a new cohort in the database
        const cohort = await prisma.cohort.create({
            data: {
                name,
                slug,
                description,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                spaceId,
                createdBy: userId
            }
        });

        // 3. Send success message in the response
        return res.status(201).json({ success: true, message: "Cohort created successfully", data: cohort });
    } catch (error) {
        // 4. Send the error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateCohort = async (req, res) => {
    // 0. This controller updates the cohort details
    const { name, slug, description, startDate, endDate, spaceId } = req.body;
    const cohortId = req.params.id;

    try {
        // 1. Update the cohort details in the db
        const updatedCohort = await prisma.cohort.update({
            where: {
                id: cohortId
            },
            data: {
                name,
                slug,
                description,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                spaceId
            }
        });

        if (!updatedCohort) {
            return res.status(404).json({ success: false, code: "DOESNT_EXIST", message: "Cohort not found" });
        }

        // 2. Send success message in the response
        return res.status(200).json({ success: true, message: "Cohort updated successfully", data: updatedCohort });
    } catch (error) {
        // 3. Send the error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deleteCohort = async (req, res) => {
    // 0. This controller deletes the cohort from the system
    const cohortId = req.params.id;

    try {
        // 1. Delete the cohort from the db
        await prisma.cohort.delete({
            where: {
                id: cohortId
            }
        });

        // 2. Send success message in the response
        return res.status(200).json({ success: true, message: "Cohort deleted successfully" });
    } catch (error) {
        // 3. Handle "Record does not exist" error
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, code: "DOESNT_EXIST", message: "Cohort not found" });
        }

        // 4. Send error message if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};