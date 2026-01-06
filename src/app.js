// ============================================
// EXPRESS APP CONFIGURATION
// ============================================
// Sets up the Express application with middleware and routes
// This is the core of the backend server

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

// Initialize Express application
const app = express()

console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN) // DEBUG log

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

/**
 * CORS MIDDLEWARE
 * Enables Cross-Origin Resource Sharing (CORS)
 * Allows frontend (different origin/port) to communicate with backend
 * 
 * Why needed:
 * - Frontend: http://localhost:5173 (Vite dev server)
 * - Backend: http://localhost:8000 (Express server)
 * - Browsers block cross-origin requests by default for security
 * - CORS middleware explicitly allows specific origins
 * 
 * Configuration:
 * - origin: Dynamic origin checking (supports wildcard or specific origin)
 * - credentials: true (allows cookies to be sent cross-origin)
 * - methods: Allowed HTTP methods
 * - allowedHeaders: Headers frontend can send
 */
app.use(
    cors({
        origin: function (origin, callback) {
            const allowedOrigin = process.env.CORS_ORIGIN  // From .env file

            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true)

            // Check if origin matches allowed origin or is wildcard
            // If allowedOrigin is '*', allow all origins (development)
            // In production, set specific origin like "https://yourdomain.com"
            if (allowedOrigin === "*" || allowedOrigin === origin) {
                callback(null, true)  // Allow the request
            } else {
                console.log(
                    `CORS Blocked: Origin ${origin} does not match ${allowedOrigin}`
                )
                callback(new Error("Not allowed by CORS"))  // Reject the request
            }
        },
        credentials: true,  // Allow cookies and authentication headers
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",      // For JSON and form data
            "Authorization",     // For JWT tokens
            "X-Requested-With",  // Standard header
            "Accept",            // Response format preference
        ],
    })
)

/**
 * JSON BODY PARSER MIDDLEWARE
 * Parses incoming requests with JSON payloads
 * Converts JSON string in request body to JavaScript object
 * 
 * Limit: 16kb (prevents large payload attacks)
 * Access via: req.body
 */
app.use(
    express.json({
        limit: "16kb",  // Maximum JSON payload size
    })
)

/**
 * URL-ENCODED BODY PARSER MIDDLEWARE
 * Parses incoming requests with URL-encoded payloads (form submissions)
 * 
 * Extended: true (supports nested objects in form data)
 * Limit: 16kb (prevents large payload attacks)
 * Access via: req.body
 */
app.use(
    express.urlencoded({
        extended: true,  // Parse complex objects
        limit: "16kb",   // Maximum payload size
    })
)

/**
 * STATIC FILES MIDDLEWARE
 * Serves static files from the "public" directory
 * Files in public/ are accessible via HTTP (e.g., images, CSS, temp files)
 * 
 * Example: public/temp/avatar.jpg -> http://localhost:8000/temp/avatar.jpg
 */
app.use(express.static("public"))

/**
 * COOKIE PARSER MIDDLEWARE
 * Parses cookies from incoming requests
 * Makes cookies available in req.cookies object
 * 
 * Why needed:
 * - Access and refresh tokens are stored in HTTP-only cookies
 * - More secure than localStorage (protects against XSS attacks)
 * - Automatically sent with every request by the browser
 */
app.use(cookieParser())

// ============================================
// RATE LIMITING
// ============================================

// Import rate limiters to prevent abuse
import { generalLimiter } from "./middlewares/rate-limiter.middleware.js"

/**
 * GENERAL API RATE LIMITER
 * Limits number of requests from a single IP address
 * Prevents spam, brute force attacks, and API abuse
 * 
 * Applied to: All /api/v1/* routes
 * Limit: Defined in rate-limiter.middleware.js (e.g., 3000 requests per 15 minutes)
 */
app.use("/api/v1/", generalLimiter)

// ============================================
// API ROUTES REGISTRATION
// ============================================

// Import all route modules
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import LikeRouter from "./routes/likes.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import searchRouter from "./routes/search.routes.js"
import notificationRouter from "./routes/notification.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import healthRoutes from "./routes/health.route.js"

/**
 * ROUTE DECLARATIONS
 * Maps URL paths to route handlers
 * 
 * Pattern: app.use(basePath, router)
 * - basePath: URL prefix for all routes in that router
 * - router: Imported router module with route definitions
 * 
 * Example: 
 * app.use("/api/v1/users", userRouter)
 * -> /api/v1/users/register, /api/v1/users/login, etc.
 */
app.use("/api/v1/users", userRouter)              // User authentication and profile
app.use("/api/v1/videos", videoRouter)            // Video CRUD operations
app.use("/api/v1/comments", commentRouter)        // Comment operations
app.use("/api/v1/like", LikeRouter)               // Like/unlike functionality
app.use("/api/v1/subscription", subscriptionRouter)  // Channel subscriptions
app.use("/api/v1/search", searchRouter)           // Video search
app.use("/api/v1/notifications", notificationRouter)  // User notifications
app.use("/api/v1/dashboard", dashboardRouter)     // Channel analytics
app.use("/api/v1/tweets", tweetRouter)            // Tweet/post operations
app.use("/api/v1/playlists", playlistRouter)      // Playlist management
app.use("/api/v1/health",healthRoutes);                   // api healthCheck route

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// Import error handlers (must be registered AFTER all routes)
import {
    errorHandler,
    notFoundHandler,
} from "./middlewares/error.middleware.js"

/**
 * 404 NOT FOUND HANDLER
 * Catches requests to undefined routes
 * Must be placed after all valid route registrations
 * 
 * Example: GET /api/v1/invalid-route -> 404 error
 */
app.use(notFoundHandler)

/**
 * GLOBAL ERROR HANDLER
 * Catches all errors thrown in the application
 * Formats and sends consistent error responses
 * 
 * Handles:
 * - ApiError instances (custom errors)
 * - JWT errors (invalid/expired tokens)
 * - Mongoose validation errors
 * - Unexpected server errors
 * 
 * Must be placed last (after all routes and middlewares)
 */
app.use(errorHandler)

// Export the configured Express app
export { app }
