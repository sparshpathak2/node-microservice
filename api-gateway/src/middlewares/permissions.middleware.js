import axios from "axios"

const permissionsMiddlewareOldOld = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Unauthorized access." })
        }
        next()
    }
}

const permissionsMiddlewareOld = async (resource, action) => {
    // 0. This middleware handles RBAC
    console.log("RBAC Middleware ran")

    // 1. Get the user id from the req
    const userId = req.user?.id
    console.log("userId:", userId)

    // 2. Send post request to check permissions with user id, resource and action
    try {
        const response = await axios.post(
            `${process.env.USER_SERVICE_URL}/permissions/check`,
            {
                userId,
                resource,
                action
            }
        )

        // 3. If allowed = true then allow user otherwise access denied 
        const { isAllowed } = response.data

        if (!isAllowed) {
            return res.status(403).json({ success: false, isAllowed: false, message: "You don't have right permissions" })
        }

        return next()
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

const permissionsMiddleware = (allowedRole) => {
    return async (req, res, next) => {  // Middleware must return a function
        console.log("RBAC Middleware ran");

        // 1. Get the user ID from the request
        const userId = req.user?.id;
        console.log("userId:", userId);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: No user ID provided" });
        }

        // 2. Check permissions by sending a request to the permissions service
        try {
            const response = await axios.post(
                `${process.env.USER_SERVICE_URL}/permissions/check`,
                { userId, allowedRole },
                {
                    withCredentials: true,
                    headers: {
                        Cookie: req.headers.cookie,  // Forward cookies from the original request
                    }
                }
            );

            console.log("data from the response:", response.data)

            // 3. Check if user is allowed
            if (!response.data.isAllowed) {
                return res.status(403).json({ success: false, message: "You don't have the right permissions" });
            }

            req.user.id = userId

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error("Error in permissionsMiddleware:", error);
            return res.status(500).json({ success: false, message: "Internal server error finally" });
        }
    };
};

export default permissionsMiddleware