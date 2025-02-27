import express from "express"
import 'dotenv/config'
import proxy from "express-http-proxy"
import authMiddleware from "./middlewares/auth.middleware.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/users.routes.js"

const app = express();
const PORT = process.env.PORT || "3001"
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || "http://localhost:3002"
const USER_SERVICE = process.env.USER_SERVICE_URL || "http://localhost:3003"

app.use(cookieParser())
app.use(express.json())

// app.use('/authentication', proxy(AUTH_SERVICE))
app.use('/authentication', authMiddleware, proxy(AUTH_SERVICE))

// app.use('/user-management', proxy(USER_SERVICE))
// app.use('/user-management/users', authMiddleware, permissionsMiddleware("Admin"), proxy(USER_SERVICE))

// app.use('/user-management/users',
//     authMiddleware,
//     permissionsMiddleware("Admin"),
//     proxy(USER_SERVICE, {
//         proxyReqPathResolver: (req) => {
//             return `/users${req.url}`;  // Ensures "/users" is always included
//         }
//     })
// );

// Route for `/users/:id` (Managers can access specific user details)
app.use("/user-management/users", userRoutes);


app.listen(PORT, console.log(`The api-gateway service is running on ${PORT}`))