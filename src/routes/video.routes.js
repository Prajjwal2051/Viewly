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

// Import all video controller functions
import { 
    uploadVideo,      // Handles video upload
    getAllVideos,     // Lists all videos with filters
    getVideoById,     // Gets single video details
    updateVideo,      // Updates video metadata
    deleteVideo       // Deletes video
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
router.route('/').get(getAllVideos)

/**
 * GET /api/v1/videos/:videoId
 * Get single video by ID and increment view count
 * Anyone can view a video (unless it's unpublished)
 */
router.route('/:videoId').get(getVideoById)

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * POST /api/v1/videos
 * Upload a new video with thumbnail
 * Requires: JWT token, video file, thumbnail file
 * Middleware chain: verifyJWT → upload files → uploadVideo controller
 */
router.route('/').post(
    verifyJWT,                          // Verify user is logged in
    upload.fields([                     // Handle multipart form-data with 2 files
        { name: 'video', maxCount: 1 },      // Accept 1 video file
        { name: 'thumbnail', maxCount: 1 }   // Accept 1 thumbnail image
    ]),
    uploadVideo                         // Process upload and save to DB
)

/**
 * PATCH /api/v1/videos/:videoId
 * Update video details (title, description, thumbnail)
 * Only video owner can update
 * Requires: JWT token
 */
router.route('/:videoId').patch(
    verifyJWT,                          // Verify user is logged in
    upload.single('thumbnail'),         // Optional: new thumbnail file
    updateVideo                         // Process update
)

/**
 * DELETE /api/v1/videos/:videoId
 * Delete video and its files from Cloudinary and database
 * Only video owner can delete
 * Requires: JWT token
 */
router.route('/:videoId').delete(
    verifyJWT,                          // Verify user is logged in
    deleteVideo                         // Process deletion
)

// Export router to be used in app.js
export default router

