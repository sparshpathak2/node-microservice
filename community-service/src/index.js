import express from "express"
import 'dotenv/config'
import cors from "cors"
import cookieParser from "cookie-parser";
import communityRoutes from "./routes/community.routes.js"
import spaceGroupRoutes from "./routes/space-group.routes.js"
import spaceRoutes from "./routes/space.routes.js"
import spaceTypeRoutes from "./routes/space-type.routes.js"
import membershipRoutes from "./routes/membership.routes.js"

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
    return res.send("hello from the Community Service")
})

app.use("/communities", communityRoutes)

app.use("/space-groups", spaceGroupRoutes)

app.use("/spaces", spaceRoutes)

app.use("/space-types", spaceTypeRoutes)

app.use("/memberships", membershipRoutes)

app.listen(PORT, () => {
    console.log(`The community service is live on ${PORT}`)
})