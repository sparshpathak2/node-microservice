import prisma from "../db/db.config.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import axios from "axios";
import { updateUserZoomToken } from "../services/zoom.service.js";

// User signup controller
const signupUserOld = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {

        // Check if all values are present
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "Username, email and password are required" })
        }

        // 1. Check if username and email exist
        if (username && email) {

            // 2. Check if the user already exists in the system
            const existingUser = await prisma.user.findUnique({
                where: {
                    email: email
                }
            })

            if (existingUser) {
                return res.status(401).json({ success: false, message: "Email already exists. Please use another email" })
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10)

            // 3. Find the role in the database (default to "Member" if not provided)
            const userRole = await prisma.role.findUnique({
                where: { role: role || "Member" }
            });

            if (!userRole) {
                return res.status(400).json({ success: false, message: "Invalid role provided" });
            }

            // 4. Add the user in db using Prisma client
            const newUser = await prisma.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    userRole: { create: [{ roleId: userRole.id }] } // Link the user to the role
                }
            })

            // 5. Create AT and Refresh Token
            // const accessToken = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" })
            const accessToken = jwt.sign({ id: newUser.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" })
            // const refreshToken = jwt.sign({ email: email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" })
            const refreshToken = uuidv4()

            // Create a refresh token in db
            await prisma.refreshToken.create({
                data: {
                    refreshToken: refreshToken,
                    userId: newUser.id,
                    // expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 min
                }
            })

            // Send AT and RT in secured cookies
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                // secure: true, // Required for cookies to be sent over HTTPS, only required for production
                sameSite: "None", // Required for cross-origin cookies
            })

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                // secure: true, // Required for cookies to be sent over HTTPS, only required for production
                sameSite: "None", // Required for cross-origin cookies
            })

            return res.status(201).json({ success: true, message: "User created successfully" })
        }

        else {
            res.status(401).json({ success: false, message: "Username or email was empty" })
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const signupUser = async (req, res) => {
    const { username, email, password, roles, communityId } = req.body;  // Accept array of roles

    try {
        // 1. Validate input
        if (!username || !email || !password || !communityId) {
            return res.status(400).json({ success: false, message: "Username, email, password, and communityId are required" });
        }

        // 2. Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(401).json({ success: false, message: "Email already exists. Please use another email" });
        }

        // 3. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Fetch roles from DB (if roles are provided, otherwise default to ["Member"])
        const roleNames = roles && roles.length > 0 ? roles : ["Member"];

        const validRoles = await prisma.role.findMany({
            where: { role: { in: roleNames } }
        });

        if (validRoles.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid roles provided" });
        }

        // 5. Create the user
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                userRole: { create: validRoles.map(role => ({ roleId: role.id })) }  // Assign multiple roles
            }
        });

        // 6. Generate Access & Refresh Tokens
        const accessToken = jwt.sign({ id: newUser.id, communityId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });
        const refreshToken = uuidv4();

        // 7. Store refresh token in DB
        await prisma.refreshToken.create({
            data: {
                refreshToken,
                userId: newUser.id,
                communityId,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 min
            }
        });

        // 8. Set secure cookies
        res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "None" });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "None" });

        return res.status(201).json({ success: true, message: "User created successfully", newUser });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// User login controller
const loginUserOld = async (req, res) => {
    // 0. This controller handles the login of the user
    // 1. Get email, password from the req body
    const { email, password, communityId } = req.body

    // const userId = req.headers["x-user-id"];
    // console.log("userId in loginUser:", userId)

    if (!email || !password || !communityId) {
        return res.status(400).json({ success: false, message: "Email, password and communityId are required" })
    }

    // 2. Check if the user exists in the db
    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (!existingUser) {
        return res.status(401).json({ success: false, message: "User does not exists" })
    }

    // 3. Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)

    if (!isPasswordCorrect) {
        return res.status(401).json({ success: false, message: "Password is incorrect" })
    }

    // 4. If the password is correct then create a new AT and RT
    const newAccessToken = jwt.sign({ id: existingUser.id, communityId: communityId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" })
    const newRefreshToken = uuidv4()

    // 5. Delete old refresh tokens for this user (Optional Cleanup)
    await prisma.refreshToken.deleteMany({
        where: { userId: existingUser.id }
    });

    // 6. Store the new RT in the db
    await prisma.refreshToken.create({
        data: {
            refreshToken: newRefreshToken,
            userId: existingUser.id,
            communityId: communityId,
            // expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 days
        }
    })

    // 7. Send the AT and RT in the cookies
    res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        // secure: true, // Required for cookies to be sent over HTTPS
        // sameSite: "None", // Required for cross-origin cookies
        sameSite: "Lax",
        secure: false
    })

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        // secure: true, // Required for cookies to be sent over HTTPS
        // sameSite: "None", // Required for cross-origin cookies
        sameSite: "Lax",
        secure: false
    })

    // 8. Return status 200 and login successful

    return res.status(200).json({ success: true, message: "Login successful", user: { id: existingUser.id, email: existingUser.email, } })
}

const loginUser = async (req, res) => {
    // 0. This controller handles the login of the user
    // 1. Get email, password from the req body
    const { email, password, communityId } = req.body

    // const userId = req.headers["x-user-id"];
    // console.log("userId in loginUser:", userId)

    if (!email || !password || !communityId) {
        return res.status(400).json({ success: false, message: "Email, password and communityId are required" })
    }

    // 2. Check if the user exists in the db
    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (!existingUser) {
        return res.status(401).json({ success: false, message: "User does not exists" })
    }

    // 3. Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)

    if (!isPasswordCorrect) {
        return res.status(401).json({ success: false, message: "Password is incorrect" })
    }

    // Step 3: Check membership via external service
    try {
        const membershipRes = await axios.get(
            `http://localhost:3001/api/community/memberships/check`,
            {
                params: {
                    userId: existingUser.id,
                    communityId,
                },
            },
            { withCredentials: true }
        );

        const isMember = membershipRes.data?.isMember;

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "User is not a member of this community",
            });
        }
    } catch (error) {
        console.log("Error message:", error.message)
        return res.status(500).json({ success: false, message: "Internal server error while checking membership" })
    }


    // 4. If the password is correct then create a new AT and RT
    const newAccessToken = jwt.sign({ id: existingUser.id, communityId: communityId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" })
    const newRefreshToken = uuidv4()

    // 5. Delete old refresh tokens for this user (Optional Cleanup)
    await prisma.refreshToken.deleteMany({
        where: { userId: existingUser.id }
    });

    // 6. Store the new RT in the db
    await prisma.refreshToken.create({
        data: {
            refreshToken: newRefreshToken,
            userId: existingUser.id,
            communityId: communityId,
            // expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 days
        }
    })

    // 7. Send the AT and RT in the cookies
    res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false, // keep false for local HTTP testing
        sameSite: "Lax", // ✅ okay for subdomains like lvh.me
        domain: ".lvh.me", // ✅ important: allows cookies on all subdomains
        path: "/",         // ✅ good practice
    });

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        domain: ".lvh.me",
        path: "/",
    });

    // 8. Return status 200 and login successful

    return res.status(200).json({ success: true, message: "Login successful", user: { id: existingUser.id, email: existingUser.email, } })
}

const logoutUserOld = async (req, res) => {
    // 0. This controller handlers logging out a user
    // 1. Get RT from the cookies
    const { refreshToken } = req.cookies

    if (!refreshToken) {
        return res.status(400).json({ success: false, message: "Token is missing" })
    }

    try {
        // 2. Delete the RT from the db
        await prisma.refreshToken.deleteMany({
            where: {
                refreshToken: refreshToken
            }
        })

        // 3. Clear users cookies by deleting AT & RT
        // Match the options used during res.cookie
        const cookieOptions = {
            httpOnly: true,
            sameSite: "Lax",
            secure: false,
        }

        res.clearCookie("accessToken", cookieOptions)
        res.clearCookie("refreshToken", cookieOptions)

        // 4. Send response with logged out successfully
        return res.status(200).json({ success: true, message: "Logged out successfully" })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }

}

const logoutUser = async (req, res) => {
    // Always try to clear cookies, even if tokens are missing

    // Define the cookie options (should match what you used in res.cookie)
    const cookieOptions = {
        domain: ".lvh.me",
        path: "/",
    }

    try {
        const { refreshToken } = req.cookies

        if (refreshToken) {
            // Delete the refresh token from DB if it exists
            await prisma.refreshToken.deleteMany({
                where: { refreshToken },
            })
        }

        // Clear both access and refresh tokens from cookies
        res.clearCookie("accessToken", cookieOptions)
        res.clearCookie("refreshToken", cookieOptions)

        return res.status(200).json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        console.error("Logout error:", error)
        // Still clear cookies in case of any error
        res.clearCookie("accessToken", cookieOptions)
        res.clearCookie("refreshToken", cookieOptions)

        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// Verify Token controller
const verifyToken = async (req, res) => {
    // 0. This controller get the req from the middleware from the api-gateway and checks if the token is valid
    // 1. Get AT from the req and check if it is valid using access token secret
    // const { accessToken, refreshToken } = req.body

    const accessToken = req.cookies?.accessToken
    const refreshToken = req.cookies?.refreshToken

    if (!accessToken && !refreshToken) {
        return res.status(401).json({ success: false, valid: false, message: "Unauthorized: No tokens provided to verify token" });
    }

    // 2. If AT is valid then return login successful
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        console.log("decoded:", decoded)

        if (decoded) {
            const user = await prisma.user.findUnique({
                where: {
                    id: decoded.id
                },
            })

            return res.status(200).json({ success: true, valid: true, message: "Login successful", user })
        }
    } catch (error) {
        // return res.status(401).json({ message: "Token is invalid, checking refresh token..." })
        console.log("Token is invalid, checking refresh token...")
    }

    // 3. If the AT is not valid check if the RT is valid by matching it with the RT from the db
    try {
        const storedRefreshToken = await prisma.refreshToken.findFirst({
            where: {
                refreshToken: refreshToken
            }
        })

        if (!storedRefreshToken) {
            return res.status(401).json({ success: false, valid: false, message: "Refresh token not found" });
        }

        // 4. If the RT is expired ask the user to login again
        if (storedRefreshToken.expiresAt < Date.now()) {
            // 5. Delete the expired RT from the db
            await prisma.refreshToken.delete({
                where: {
                    id: storedRefreshToken.id
                }
            })
            return res.status(401).json({ success: false, valid: false, message: "Token is expired, please login again" })
        }

        // 6. If the RT is valid then create a new AT using userid from the RT db
        const newAccessToken = jwt.sign({ id: storedRefreshToken.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" })

        // Fetch full user
        const user = await prisma.user.findUnique({
            where: { id: storedRefreshToken.userId },
            select: {
                id: true,
                email: true,
                username: true,
                roles: true
            }
        })

        // 7. Set the new AT and RT in the cookies
        // res.cookie("accessToken", newAccessToken, {
        //     httpOnly: true,
        //     sameSite: "Lax",
        //     secure: false
        // })

        // res.cookie("refreshToken", refreshToken, {
        //     httpOnly: true,
        //     // secure: true, // Required for cookies to be sent over HTTPS
        //     // sameSite: "None", // Required for cross-origin cookies
        //     sameSite: "Lax",
        //     secure: false
        // })

        // res.cookie("accessToken", newAccessToken, {
        //     httpOnly: true,
        //     secure: false, // keep false for local HTTP testing
        //     sameSite: "Lax", // ✅ okay for subdomains like lvh.me
        //     domain: ".lvh.me", // ✅ important: allows cookies on all subdomains
        //     path: "/",         // ✅ good practice
        // });

        // res.cookie("refreshToken", refreshToken, {
        //     httpOnly: true,
        //     secure: false,
        //     sameSite: "Lax",
        //     domain: ".lvh.me",
        //     path: "/",
        // });

        // 8. Send the new AT in the response
        return res.status(200).json({ success: true, valid: true, message: "Login successful", user })

    } catch (error) {
        return res.status(401).json({ success: false, valid: false, message: "Token is invalid" })
    }
}

// Zoom Callback controller
const zoomCallback = async (req, res) => {
    const { code, state } = req.query; // Step 1: Get authorization code from Zoom

    // const userId = req.headers["x-user-id"];

    console.log("code in zoomcallback:", code)
    console.log("userId in zoomcallback:", state)

    if (!code) {
        return res.status(400).json({ error: "Authorization code missing" });
    }

    const userId = state; // Use userId from query param

    try {
        // Step 2: Exchange code for access token
        const response = await axios.post("https://zoom.us/oauth/token", null, {
            params: {
                grant_type: "authorization_code",
                code,
                redirect_uri: process.env.ZOOM_REDIRECT_URI,
            },
            headers: {
                Authorization: `Basic ${Buffer.from(
                    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
                ).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        console.log("Response from zoom:", response.data)
        const { access_token, refresh_token, expires_in } = response.data;


        // console.log("access_token, refresh_token, expires_in, req.user.id", access_token, refresh_token, expires_in, req.user.id)

        // Step 3: Store tokens in User Service
        // const success = await updateUserZoomToken(req.user.id, access_token, refresh_token, expires_in);
        const success = await updateUserZoomToken(userId, access_token, refresh_token, expires_in);

        if (success) {
            res.json({ message: "Zoom account connected successfully" });
        } else {
            res.status(500).json({ error: "Failed to save Zoom token" });
        }
    } catch (error) {
        console.error("Zoom authentication failed:", error?.response?.data || error.message);
        res.status(500).json({ error: "Zoom authentication failed" });
    }
};

// Update Zoom token controller
const updateZoomToken = async (req, res) => {
    const { userId } = req.params;
    const { zoomAccessToken, zoomRefreshToken, zoomTokenExpiry } = req.body;

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                zoomAccessToken,
                zoomRefreshToken,
                zoomTokenExpiry,
            },
        });

        res.json({ success: true, message: "Zoom tokens updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export { signupUser, loginUser, logoutUser, verifyToken, zoomCallback, updateZoomToken }