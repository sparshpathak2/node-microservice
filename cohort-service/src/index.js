import express from "express"
import 'dotenv/config'
import cors from "cors"
import cookieParser from "cookie-parser";
import cohortRoutes from "./routes/cohort.routes.js"
import assignmentRoutes from "./routes/assignment.routes.js"

const app = express();
const PORT = process.env.PORT || 3004

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true); // Allow non-browser tools

            const allowedOriginRegex = /^http:\/\/([a-z0-9-]+)\.lvh\.me:3000$/;

            if (
                origin === 'http://localhost:3000' ||
                origin === 'http://lvh.me:3000' ||
                allowedOriginRegex.test(origin)
            ) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use(cookieParser())
app.use(express.json())

app.get("/", (req, res) => {
    return res.send("hello from the Cohort Service")
})

app.use("/cohorts", cohortRoutes)

// app.use("/discussion-threads", discussionThreadRoutes)

app.use("/assignments", assignmentRoutes)

// app.use("/assignment-submissions", assignmentSubmissionRoutes)

// app.use("/memberships", membershipRoutes)

app.listen(PORT, () => {
    console.log(`The cohort service is live on ${PORT}`)
})