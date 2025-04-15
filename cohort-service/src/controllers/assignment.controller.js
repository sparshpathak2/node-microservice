import prisma from "../db/db.config.js";

export const getAllAssignments = async (req, res) => {
    // 0. This controller fetches all the assignments from the database
    try {
        const assignments = await prisma.assignment.findMany();

        // 2. Send the assignments in the response
        return res.status(200).json({ success: true, data: assignments });
    } catch (error) {
        // 3. Send an error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getAssignmentById = async (req, res) => {
    // 0. This controller gets assignment by id from the database
    const assignmentId = req.params.id;

    try {
        const assignment = await prisma.assignment.findUnique({
            where: {
                id: assignmentId
            }
        });

        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        // 3. Send the assignment in the response
        return res.status(200).json({ success: true, data: assignment });
    } catch (error) {
        // 4. Send the error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// export const getAssignmentBySlug = async (req, res) => {
//     // 0. This controller gets assignment by slug from the database
//     const assignmentSlug = req.params.slug;

//     if (!assignmentSlug) {
//         return res.status(400).json({ success: false, message: "Assignment slug is required" });
//     }

//     try {
//         const assignment = await prisma.assignment.findUnique({
//             where: {
//                 slug: assignmentSlug
//             }
//         });

//         if (!assignment) {
//             return res.status(404).json({ success: false, message: "Assignment not found" });
//         }

//         // 3. Send the assignment in the response
//         return res.status(200).json({ success: true, data: assignment });
//     } catch (error) {
//         // 4. Send the error if something goes wrong
//         return res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };

export const createAssignment = async (req, res) => {
    // 0. This controller creates a new assignment
    const { title, description, dueDate, cohortId } = req.body;
    const userId = req.headers["x-user-id"];

    try {
        // 1. Check for assignment slug uniqueness
        // const existingAssignment = await prisma.assignment.findUnique({
        //     where: {
        //         slug: slug
        //     }
        // });

        // if (existingAssignment) {
        //     return res.status(400).json({ success: false, code: "ALREADY_EXISTS", message: "Assignment with that slug already exists" });
        // }

        // 2. Create a new assignment in the database
        const assignment = await prisma.assignment.create({
            data: {
                title,
                // slug,
                description,
                dueDate: new Date(dueDate),
                cohortId,
                createdBy: userId
            }
        });

        // 3. Send success message in the response
        return res.status(201).json({ success: true, message: "Assignment created successfully", data: assignment });
    } catch (error) {
        // 4. Send the error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateAssignment = async (req, res) => {
    // 0. This controller updates the assignment details
    const { title, description, dueDate, cohortId } = req.body;
    const assignmentId = req.params.id;

    try {
        // 1. Update the assignment details in the db
        const updatedAssignment = await prisma.assignment.update({
            where: {
                id: assignmentId
            },
            data: {
                title,
                // slug,
                description,
                dueDate: new Date(dueDate),
                cohortId
            }
        });

        if (!updatedAssignment) {
            return res.status(404).json({ success: false, code: "DOESNT_EXIST", message: "Assignment not found" });
        }

        // 2. Send success message in the response
        return res.status(200).json({ success: true, message: "Assignment updated successfully", data: updatedAssignment });
    } catch (error) {
        // 3. Send the error if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deleteAssignment = async (req, res) => {
    // 0. This controller deletes the assignment from the system
    const assignmentId = req.params.id;

    try {
        // 1. Delete the assignment from the db
        await prisma.assignment.delete({
            where: {
                id: assignmentId
            }
        });

        // 2. Send success message in the response
        return res.status(200).json({ success: true, message: "Assignment deleted successfully" });
    } catch (error) {
        // 3. Handle "Record does not exist" error
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, code: "DOESNT_EXIST", message: "Assignment not found" });
        }

        // 4. Send error message if something goes wrong
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
