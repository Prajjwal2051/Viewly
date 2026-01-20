// ============================================
// TWEET ROUTES (PHOTO POSTS)
// ============================================
// Defines all API endpoints for tweet operations (photo posts with text)
// Tweets are image-based posts similar to Instagram/Twitter posts

import { Router } from "express"
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    getAllTweets,
    getTweetById,
    updateTweet,
} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

// ============================================
// INITIALIZE ROUTER
// ============================================
const router = Router()

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * GET ALL TWEETS ROUTE
 * Retrieves feed of all public tweets with images
 * 
 * Similar to Instagram/Twitter feed showing all public posts
 * 
 * @route GET /api/v1/tweets
 * @access Public
 */
router.route("/").get(getAllTweets)

/**
 * GET TWEET BY ID ROUTE
 * Retrieves detailed view of a single tweet
 * 
 * Used for:
 * - Direct tweet links (share tweet feature)
 * - Viewing tweet comments and likes
 * 
 * @route GET /api/v1/tweets/:tweetId
 * @access Public
 * @param tweetId - MongoDB ObjectId of the tweet
 */
router.route("/:tweetId").get(getTweetById)

/**
 * GET USER TWEETS ROUTE
 * Retrieves all tweets posted by a specific user
 * 
 * Used for:
 * - User profile page to show their tweets
 * - Filtering feed by specific creator
 * 
 * @route GET /api/v1/tweets/user/:userId
 * @access Public
 * @param userId - MongoDB ObjectId of the user
 */
router.route("/user/:userId").get(getUserTweets)

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================
// Apply verifyJWT middleware to all routes defined AFTER this line
// This ensures only logged-in users can create/edit/delete tweets
router.use(verifyJWT)

/**
 * CREATE TWEET ROUTE
 * Allows authenticated users to post a new tweet with image
 * 
 * Middleware:
 * - verifyJWT: Ensures user is logged in
 * - upload.single("image"): Handles single image file upload
 * 
 * Process:
 * 1. Multer saves image temporarily to ./public/temp/
 * 2. Controller uploads image to Cloudinary
 * 3. Tweet document saved to MongoDB with Cloudinary URL
 * 4. Local temp file deleted
 * 
 * @route POST /api/v1/tweets
 * @access Private
 * @body { content: string, image: File }
 */
router.route("/").post(upload.single("image"), createTweet)

/**
 * UPDATE & DELETE TWEET ROUTES
 * Allows tweet owners to modify or remove their tweets
 * 
 * Update: Change tweet text content (image cannot be changed)
 * Delete: Permanently removes tweet and associated Cloudinary image
 * 
 * @route PATCH /api/v1/tweets/:tweetId - Update tweet content
 * @route DELETE /api/v1/tweets/:tweetId - Delete tweet
 * @access Private (owner only - enforced in controller)
 * @param tweetId - MongoDB ObjectId of the tweet
 */
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet)

export default router
