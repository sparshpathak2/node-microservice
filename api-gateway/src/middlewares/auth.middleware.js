import axios from "axios";
import asyncHandler from "../utils/asyncHandler.js";

const authMiddleware = async (req, res, next) => {
    // 0. This middleware will ensure the validation of AT and RT and protection of routes
    console.log("Auth middleware called")

    const publicRoutes = [
        "/login",
        "/signup",
        "/logout",
    ];

    // If the request is for a public route, allow it without authentication check
    if (publicRoutes.includes(req.path)) {
        return next();
    }

    // 1. Get the AT and RT from the cookies
    const accessToken = req.cookies?.accessToken
    const refreshToken = req.cookies?.refreshToken

    if (!accessToken && !refreshToken) {
        return res.status(401).json({ message: "Unauthorized: No tokens provided" });
    }

    // 2. Hit the verify token route in the authentication service
    try {
        const response = await axios.post(
            `${process.env.AUTH_SERVICE_URL}/verify-token`,
            { accessToken, refreshToken },
            {
                withCredentials: true,
                headers: {
                    Cookie: req.headers.cookie,  // Forward cookies from the original request
                }
            }
        );

        const { valid, user } = response.data;

        if (!valid) {
            return res.status(401).json({ message: "Token is expired, please login again." });
        }

        req.user = user

        // 3. If the token is valid then return next()
        return next()

    } catch (error) {
        // 4. If token is not valid then return 401 unauthorized access and ask to login again
        // console.log("error:", error)
        return res.status(401).json({ message: "Token is invalid" })
    }

}

const authMiddlewareNew = asyncHandler(async (req, res, next) => {
    console.log("Auth middleware called");

    const publicRoutes = ["/login", "/signup"];

    // If the request is for a public route, allow it without authentication check
    if (publicRoutes.includes(req.path)) {
        return next();
    }

    // 1. Get the AT and RT from the cookies
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
        return res.status(401).json({ message: "Unauthorized: No tokens provided" });
    }

    // 2. Hit the verify-token route in the authentication service
    const response = await axios.post(
        `${process.env.AUTH_SERVICE_URL}/verify-token`,
        { accessToken, refreshToken },
        {
            withCredentials: true,
            headers: {
                Cookie: req.headers.cookie, // Forward cookies from the original request
            }
        }
    );

    if (!response.data.valid) {
        return res.status(401).json({ message: "Token is expired, please login again." });
    }

    // 3. If the token is valid then return next()
    return next();
});

export default authMiddleware