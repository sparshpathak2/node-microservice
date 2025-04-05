import express from "express"
import 'dotenv/config'
import cookieParser from "cookie-parser";
import communityRoutes from "./routes/community.routes.js"
import spaceGroupRoutes from "./routes/space-group.routes.js"
import spaceRoutes from "./routes/space.routes.js"
import spaceTypeRoutes from "./routes/space-type.routes.js"
import membershipRoutes from "./routes/membership.routes.js"

const app = express();
const PORT = process.env.PORT || 3004

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