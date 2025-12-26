// ============================================
// COMMENT ROUTES
// ============================================
// Defines API endpoints for comment operations (CRUD)
// Supports comments on both videos and tweets

import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { commentLimiter } from "../middlewares/rate-limiter.middleware.js"
import {
    addComment,
    deleteComment,
    getAllComment,
    getTweetComments,
    updateComment,
} from "../controllers/comment.controller.js"

// Initialize Express router
const router = Router()

/**
 * GET VIDEO COMMENTS ROUTE
 * Retrieves paginated comments for a specific video
 * 
 * @route GET /api/v1/comments/:videoId
 * @access Public (anyone can view comments)
 * @param {string} videoId - MongoDB ObjectId of the video
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Comments per page (default: 10)
 * @returns {Object} Paginated comments with user details
 */
router.get("/:videoId", getAllComment)

/**
 * GET TWEET COMMENTS ROUTE
 * Retrieves paginated comments for a specific tweet
 * 
 * @route GET /api/v1/comments/t/:tweetId
 * @access Public (anyone can view tweet comments)
 * @param {string} tweetId - MongoDB ObjectId of the tweet
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Comments per page (default: 10)
 * @returns {Object} Paginated comments with user details
 */
router.get("/t/:tweetId", getTweetComments)

/**
 * ADD COMMENT ROUTE
 * Allows authenticated users to post a comment
 * 
 * @route POST /api/v1/comments
 * @access Private (requires authentication)
 * @middleware verifyJWT - Ensures user is logged in
 * @middleware commentLimiter - Rate limits comment posting (prevents spam)
 * @body {string} content - Comment text (1-500 characters)
 * @body {string} videoId - Video ID (if commenting on video)
 * @body {string} tweetId - Tweet ID (if commenting on tweet)
 * @returns {Object} Created comment with user details
 */
router.post("/", verifyJWT, commentLimiter, addComment)

/**
 * UPDATE COMMENT ROUTE
 * Allows user to edit their own comment
 * 
 * @route PATCH /api/v1/comments/:commentId
 * @access Private (only comment owner)
 * @middleware verifyJWT - Ensures user is logged in
 * @param {string} commentId - MongoDB ObjectId of comment
 * @body {string} content - Updated comment text
 * @returns {Object} Updated comment
 */
router.patch("/:commentId", verifyJWT, updateComment)

/**
 * DELETE COMMENT ROUTE
 * Allows user to delete their own comment
 * 
 * @route DELETE /api/v1/comments/:commentId
 * @access Private (only comment owner)
 * @middleware verifyJWT - Ensures user is logged in
 * @param {string} commentId - MongoDB ObjectId of comment
 * @returns {Object} Success message
 */
router.delete("/:commentId", verifyJWT, deleteComment)

// Export router for use in app.js
export default router
