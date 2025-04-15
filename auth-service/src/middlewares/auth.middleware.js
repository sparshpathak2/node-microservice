import jwt from "jsonwebtoken";
import prisma from "../db/db.config"

const Auth = async (req, res, next) => {
    // 0. This middleware will ensure the validation of AT and RT and protection of routes
    console.log("Authorize middleware called")
    // 1. Get the AT and RT from the cookies
    const accessToken = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken

    // const { email, password } = req.body

    // 2. Check if the AT is valid
    try {
        const decoded = JsonWebTokenError.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        console.log("decoded:", decoded)

        // Attaching user payload to the request body so that it can be accessible as the request moves forward
        req.user = decoded;

        // 3. If access token is valid then return next()
        return next();

    } catch (error) {
        console.log("Access Token is not valid, checking for Refresh Token")
        // return res.status(401).json({ message: "Token is expired or invalid" })
    }

    // 4. If AT is not valid check if RT is valid via cross verifying from the db
    try {
        const storedRefreshToken = await prisma.refreshToken.findFirst({
            where: {
                refreshToken: refreshToken
            }
        })

        // 5. Check if the RT from the db is not expired 
        if (storedRefreshToken) {
            // if (new Date(storedRefreshToken.expiresAt) < new Date()) {
            if (storedRefreshToken.expiresAt.getTime() < Date.now()) {
                await prisma.refreshToken.delete({
                    where: {
                        refreshToken: storedRefreshToken.refreshToken
                    }
                })
                return res.status(401).json({ message: "Token is expired. Please login again" })
            }

            // 6. If the RT is not expired then create a new AT with user id
            const newAccessToken = jwt.sign({ id: storedRefreshToken.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' })

            // 7. Attach the new AT to the response cookies
            // res.cookie("accessToken", newAccessToken, { httpOnly: true, sameSite: "none", secure: true })
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: false, // keep false for local HTTP testing
                sameSite: "Lax", // ✅ okay for subdomains like lvh.me
                domain: ".lvh.me", // ✅ important: allows cookies on all subdomains
                path: "/",         // ✅ good practice
            });
            return next()
        }
        else {
            return res.status(401).json({ message: "Token is expired. Please login again" })
        }

    } catch (error) {
        return res.status(401).json({ message: "Token is not valid" })
    }

}

export default Auth