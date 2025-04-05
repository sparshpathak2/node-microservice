import prisma from "../db/db.config.js";

const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();

        return res.status(201).json({ success: true, data: users })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const getUser = async (req, res) => {
    try {

        // Get the user id from req params
        // const id = parseInt(req.params.id, 10);
        const id = req.params.id

        console.log("Req on get single user:", req.cookies)

        // Check if id is valid
        // if (isNaN(id)) {
        //     return res.status(400).json({ message: "Invalid user id" })
        // }

        // Get the user using prisma client matching that userid
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        })

        // Check if user exists
        if (user) {
            // Send the user data in response
            return res.status(200).json({ success: true, data: user })
        }
        else {
            // Send error message for user does not exist
            return res.status(404).json({ success: false, message: "User not found" })
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const updateUser = async (req, res) => {
    // Extract user details to be updated from the request body
    const { username, email, password } = req.body

    // Extract the id from params
    const id = parseInt(req.params.id, 10)

    // Check if the id is of valid type
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid user id" })
    }

    // Check if user exist with that id
    const user = await prisma.user.findUnique({
        where: {
            id: id,
        }
    })

    if (user) {
        // Update the user corresponding to the id
        await prisma.user.update({
            where: {
                id: id
            },
            data: {
                username: username,
                email: email,
                password: password
            }
        })

        // Send user updated message in response
        return res.status(200).json({ success: true, message: "User updated successfully" })
    }
    else {
        // Send error message if does not exist with that id 
        return res.status(404).json({ success: false, message: "User not found" })
    }
}

const deleteUser = async (req, res) => {
    // Get the id from params
    const id = parseInt(req.params.id, 10)

    // Check if the id is of valid type
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid user id" })
    }

    // Check if the user exists with that id
    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    })

    // Send response if user not found
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" })
    }

    try {
        // Delete the user
        await prisma.user.delete({
            where: {
                id: id
            }
        })

        // Send user deleted success message in response
        return res.status(200).json({ success: true, message: "User deleted successfully" })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }

}

const checkUserPermissionsOld = async (req, res) => {
    // 0. This controller checks for user permissions based on the role for a specific resource
    console.log("Check permissions controller run")

    // 1. Get the user id from the req object
    const userId = req.user?.id
    console.log("userId:", userId)

    const { resource, action } = req.body

    // 2. Get the user roleIds from the db using the userid
    try {
        const userRoles = await prisma.userRole.findMany({
            where: {
                userId: userId,
                select: { roleId: true }
            }
        })

        if (!userRoles.length) {
            return res.status(403).json({ success: false, isAllowed: false, message: "Forbidden: no roles assigned" })
        }

        const roleIds = userRoles.map((role) => role.roleId)

        // 3. Get the permissionIds corresponding to the roleIds
        const rolePermissions = await prisma.rolePermission.findMany({
            where: {
                roleId: { in: roleIds },
            },
            select: { permissionId: true }
        })

        const permissionIds = rolePermissions.map((permission) => permission.permissionId)


        // 4. Get the action and resource for corresponding permissionIds
        // 5. Cross check the action and resource allowed from the request with the action and resource user is allowed to access
        // 6. If the role matches then get the permissions from the permissions table corresponding to that role
        const isAuthorized = await prisma.permission.findFirst({
            where: { in: permissionIds },
            action,
            resource
        })

        if (!isAuthorized) {
            return res.status(403).json({ message: "Access denied due to assigned role/s" })
        }

        return next();

    } catch (error) {
        return res.status(400).json({ message: "" })
    }


    // 5. Check if the permissions matches with the action and resource from the req 
}

const checkUserPermissions = async (req, res) => {
    // 0. This controller checks for user permissions based on the role for a specific resource
    console.log("Check permissions controller run")

    // 1. Get the user id and allowed role from the req body
    // const userId = req.user?.id
    const { userId, allowedRole } = req.body

    try {
        // 2. Get the user roleIds from the db using the userid
        const userRoleIdsRes = await prisma.userRole.findMany({
            where: {
                userId: userId
            }
        })

        // console.log("userRoleIdsRes:", userRoleIdsRes)

        if (!userRoleIdsRes.length) {
            return res.status(200).json({ success: false, isAllowed: false, message: "No roles found for the user" })
        }

        const userRoleIds = userRoleIdsRes.map((role) => role.roleId)

        // console.log("userRoleIds", userRoleIds)

        // 3. Check if the user has the allowed role then allow otherwise access denied
        const userRolesRes = await prisma.role.findMany({
            where: {
                id: { in: userRoleIds },
            }
        })

        // console.log("userRoles:", userRolesRes)

        const userRoles = userRolesRes.map((role) => role.role)

        console.log("userRoles:", userRoles)

        if (!userRoles.includes(allowedRole)) {
            return res.status(200).json({ success: false, isAllowed: false, message: "Forbidden: You don't have the privilege" })
        }

        return res.status(200).json({ success: true, isAllowed: true, message: "You have the right permissions" })

    } catch (error) {
        return res.status(500).json({ success: false, isAllowed: false, message: "Internal server error" })
    }

}

const updateZoomToken = async (req, res) => {
    const { userId, zoomAccessToken, zoomRefreshToken, zoomTokenExpiry } = req.body;

    if (!userId || !zoomAccessToken || !zoomRefreshToken) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                zoomAccessToken,
                zoomRefreshToken,
                zoomTokenExpiry: new Date(Number(zoomTokenExpiry)),
            },
        });

        res.json({ message: "Zoom token updated successfully" });
    } catch (error) {
        console.error("Error updating Zoom token:", error);
        res.status(500).json({ error: "Failed to update Zoom token" });
    }
};

const getZoomCredentials = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                zoomAccessToken: true,
                zoomRefreshToken: true,
                zoomTokenExpiry: true,
            },
        });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, ...user });
    } catch (error) {
        console.error("Database query failed:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getZoomStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const isConnected =
            !!(user.zoomAccessToken &&
                user.zoomRefreshToken &&
                user.zoomTokenExpiry &&
                new Date(user.zoomTokenExpiry) > new Date());

        return res.json({
            success: true,
            isConnected,
            message: isConnected ? "Zoom is connected." : "Zoom is not connected. Please authenticate.",
            zoomTokenExpiry: user.zoomTokenExpiry || null
        });

    } catch (error) {
        console.error("Error checking Zoom status:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

export { getUsers, getUser, updateUser, deleteUser, checkUserPermissions, updateZoomToken, getZoomCredentials, getZoomStatus };