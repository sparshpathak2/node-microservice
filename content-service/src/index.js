import express from "express"
import 'dotenv/config'
import cookieParser from "cookie-parser";
import eventRoutes from "./routes/event.routes.js"
import postRoutes from "./routes/post.routes.js"

const app = express();
const PORT = process.env.PORT || "3005"

app.use(cookieParser())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("hello from content service")
})

app.use("/events", eventRoutes)

app.use("/posts", postRoutes)

app.listen(PORT, () => {
    console.log(`The content service is running on ${PORT}`)
})