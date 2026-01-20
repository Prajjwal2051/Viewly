// ============================================
// LIKE ROUTES
// ============================================
// Defines API endpoints for like/unlike operations
// Supports liking videos, comments, and tweets

import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { likeLimiter } from "../middlewares/rate-limiter.middleware.js"
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedComments,
    getLikedVideos,
    getLikedTweets,
    getIsVideoLiked,
    getIsTweetLiked,
} from "../controllers/like.controller.js"

// Initialize Express router
const router = Router()

// ============================================
// TOGGLE LIKE ROUTES (Like/Unlike)
// ============================================

/**
 * TOGGLE VIDEO LIKE ROUTE
 * Like or unlike a video
 * @route POST /api/v1/likes/video/:videoId
 * @access Private (requires authentication)
 * @middleware likeLimiter - Prevents spam liking
 */
router.post("/video/:videoId", verifyJWT, likeLimiter, toggleVideoLike)

/**
 * TOGGLE COMMENT LIKE ROUTE
 * Like or unlike a comment
 * @route POST /api/v1/likes/comment/:commentId
 * @access Private (requires authentication)
 * @middleware likeLimiter - Prevents spam liking
 */
router.post("/comment/:commentId", verifyJWT, likeLimiter, toggleCommentLike)

/**
 * TOGGLE TWEET LIKE ROUTE
 * Like or unlike a tweet
 * @route POST /api/v1/likes/tweet/:tweetId
 * @access Private (requires authentication)
 * @middleware likeLimiter - Prevents spam liking
 */
router.post("/tweet/:tweetId", verifyJWT, likeLimiter, toggleTweetLike)

// ============================================
// CHECK LIKE STATUS ROUTES
// ============================================

/**
 * CHECK IF VIDEO IS LIKED ROUTE
 * Check if current user has liked a specific video
 * @route GET /api/v1/likes/status/video/:videoId
 * @access Private (requires authentication)
 * @returns {Object} {isLiked: true/false}
 */
router.get("/status/video/:videoId", verifyJWT, getIsVideoLiked)

/**
 * CHECK IF TWEET IS LIKED ROUTE
 * Check if current user has liked a specific tweet
 * @route GET /api/v1/likes/status/tweet/:tweetId
 * @access Private (requires authentication)
 * @returns {Object} {isLiked: true/false}
 */
router.get("/status/tweet/:tweetId", verifyJWT, getIsTweetLiked)

// ============================================
// GET LIKED CONTENT ROUTES
// ============================================

/**
 * GET LIKED VIDEOS ROUTE
 * Get all videos liked by current user
 * @route GET /api/v1/likes/videos
 * @access Private (requires authentication)
 * @returns {Object} Paginated list of liked videos
 */
router.get("/videos", verifyJWT, getLikedVideos)

/**
 * GET LIKED TWEETS ROUTE
 * Get all tweets liked by current user
 * @route GET /api/v1/likes/tweets
 * @access Private (requires authentication)
 * @returns {Object} Paginated list of liked tweets
 */
router.get("/tweets", verifyJWT, getLikedTweets)

/**
 * GET LIKED COMMENTS ROUTE
 * Get all comments liked by current user
 * @route GET /api/v1/likes/comments
 * @access Private (requires authentication)
 * @returns {Object} Paginated list of liked comments
 */
router.get("/comments", verifyJWT, getLikedComments)

// ============================================
// GET LIKED CONTENT BY USER ID (Optional)
// ============================================

/**
 * GET USER'S LIKED VIDEOS ROUTE
 * Get all videos liked by a specific user
 * @route GET /api/v1/likes/user/:userId/videos
 * @access Private (requires authentication)
 */
router.get("/user/:userId/videos", verifyJWT, getLikedVideos)

/**
 * GET USER'S LIKED COMMENTS ROUTE
 * Get all comments liked by a specific user
 * @route GET /api/v1/likes/user/:userId/comments
 * @access Private (requires authentication)
 */
router.get("/user/:userId/comments", verifyJWT, getLikedComments)

// Export router for use in app.js
export default router
