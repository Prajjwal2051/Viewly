import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN) // DEBUG log

app.use(
    cors({
        origin: function (origin, callback) {
            const allowedOrigin = process.env.CORS_ORIGIN
            // Allow fallback if no origin provided (e.g. mobile apps)
            if (!origin) return callback(null, true)

            // If allowedOrigin is '*', we return 'true'.
            // The cors middleware will then emit 'Access-Control-Allow-Origin: <request_origin>'
            // which allows credentials to work (browsers reject literal '*')
            if (allowedOrigin === "*" || allowedOrigin === origin) {
                callback(null, true)
            } else {
                console.log(
                    `CORS Blocked: Origin ${origin} does not match ${allowedOrigin}`
                )
                callback(new Error("Not allowed by CORS"))
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
        ],
    })
)

app.use(
    express.json({
        limit: "16kb",
    })
)

app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    })
)

app.use(express.static("public"))

app.use(cookieParser())

// routes

import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import LikeRouter from "./routes/likes.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import searchRouter from "./routes/search.routes.js"
import notificationRouter from "./routes/notification.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import tweetRouter from "./routes/tweet.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/like", LikeRouter)
app.use("/api/v1/subscription", subscriptionRouter)
app.use("/api/v1/search", searchRouter)
app.use("/api/v1/notifications", notificationRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/tweets", tweetRouter)

export { app }
