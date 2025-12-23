// ============================================
// VIDEO ROUTES
// ============================================
// Defines all API endpoints for video operations (CRUD)

// Import Router from Express to create modular route handlers
import { Router } from "express"

// Import Multer middleware for handling file uploads (video and thumbnail)
import { upload } from "../middlewares/multer.middleware.js"

// Import JWT authentication middleware to protect routes
import { verifyJWT } from "../middlewares/auth.middleware.js"

// Import rate limiters
import { uploadLimiter } from "../middlewares/rate-limiter.middleware.js"

// Import all video controller functions
import {
    uploadVideo, // Handles video upload
    getAllVideos, // Lists all videos with filters
    getVideoById, // Gets single video details
    updateVideo, // Updates video metadata
    deleteVideo, // Deletes video
    getVideoCategories, // Gets video categories
    getMostUsedTags, // Gets popular tags
} from "../controllers/video.controller.js"

// Create Express router instance
const router = Router()

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * GET /api/v1/videos
 * Get all videos with optional filters (category, tags, search, sorting, pagination)
 * Anyone can view the video list
 */
router.get("/", getAllVideos)

/**
 * GET /api/v1/videos/categories
 * Get all unique categories from published videos
 */
router.get("/categories", getVideoCategories)

/**
 * GET /api/v1/videos/tags/popular
 * Get most frequently used tags from published videos
 */
router.get("/tags/popular", getMostUsedTags)

/**
 * GET /api/v1/videos/:videoId
 * Get single video by ID and increment view count
 * Anyone can view a video (unless it's unpublished)
 */
router.get("/:videoId", getVideoById)

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * POST /api/v1/videos
 * Upload a new video with thumbnail
 * Requires: JWT token, video file, thumbnail file
 * Middleware chain: verifyJWT → uploadLimiter → upload files → uploadVideo controller
 */
router.post(
    "/",
    verifyJWT, // Verify user is logged in
    uploadLimiter, // Rate limit uploads (10 per hour)
    upload.fields([
        // Handle multipart form-data with 2 files
        { name: "video", maxCount: 1 }, // Accept 1 video file
        { name: "thumbnail", maxCount: 1 }, // Accept 1 thumbnail image
    ]),
    uploadVideo // Process upload and save to DB
)

/**
 * PATCH /api/v1/videos/:videoId
 * Update video details (title, description, thumbnail)
 * Only video owner can update
 * Requires: JWT token
 */
router.patch(
    "/:videoId",
    verifyJWT, // Verify user is logged in
    upload.single("thumbnail"), // Optional: new thumbnail file
    updateVideo // Process update
)

/**
 * DELETE /api/v1/videos/:videoId
 * Delete video and its files from Cloudinary and database
 * Only video owner can delete
 * Requires: JWT token
 */
router.delete(
    "/:videoId",
    verifyJWT, // Verify user is logged in
    deleteVideo // Process deletion
)

// Export router to be used in app.js
export default router
