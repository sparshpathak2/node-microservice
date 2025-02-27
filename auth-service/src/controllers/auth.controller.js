import prisma from "../db/db.config.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

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
    const { username, email, password, roles } = req.body;  // Accept array of roles

    try {
        // 1. Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "Username, email, and password are required" });
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
        const accessToken = jwt.sign({ id: newUser.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });
        const refreshToken = uuidv4();

        // 7. Store refresh token in DB
        await prisma.refreshToken.create({
            data: {
                refreshToken,
                userId: newUser.id,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 min
            }
        });

        // 8. Set secure cookies
        res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "None" });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "None" });

        return res.status(201).json({ success: true, message: "User created successfully" });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// User login controller
const loginUser = async (req, res) => {
    // 0. This controller handles the login of the user
    // 1. Get email, password from the req body
    const { email, password } = req.body

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
    const newAccessToken = jwt.sign({ id: existingUser.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" })
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
            // expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 days
        }
    })

    // 7. Send the AT and RT in the cookies
    res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true, // Required for cookies to be sent over HTTPS
        sameSite: "None", // Required for cross-origin cookies
    })

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true, // Required for cookies to be sent over HTTPS
        sameSite: "None", // Required for cross-origin cookies
    })

    // 8. Return status 200 and login successful

    return res.status(200).json({ success: true, message: "Login successful", user: { id: existingUser.id, email: existingUser.email, } })
}

const logoutUser = async (req, res) => {
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
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")

        // 4. Send response with logged out successfully
        return res.status(200).json({ success: true, message: "Logged out successfully" })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }

}

// Verify Token controller
const verifyToken = async (req, res) => {
    // 0. This controller get the req from the middleware from the api-gateway and checks if the token is valid
    // 1. Get AT from the req and check if it is valid using access token secret
    const { accessToken, refreshToken } = req.body

    // const accessToken = req.cookies?.accessToken
    // const refreshToken = req.cookies?.refreshToken

    if (!accessToken && !refreshToken) {
        return res.status(401).json({ success: false, valid: false, message: "Unauthorized: No tokens provided" });
    }

    // 2. If AT is valid then return login successful
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        console.log("decoded:", decoded)

        if (decoded) {
            return res.status(200).json({ success: true, valid: true, message: "Login successful", user: decoded })
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

        // 7. Set the new AT in the cookies
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true
        })

        // 8. Send the new AT in the response
        return res.status(200).json({ success: true, valid: true, message: "Login successful", accessToken: newAccessToken, user: decoded })

    } catch (error) {
        return res.status(401).json({ success: false, valid: false, message: "Token is invalid" })
    }
}

export { signupUser, loginUser, logoutUser, verifyToken }