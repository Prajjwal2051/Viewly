// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { video } from "../models/video.model.js"
import { comment } from "../models/comment.model.js"
import { like } from "../models/like.model.js"
import mongoose from "mongoose"

// ============================================
// CONTROLLER FUNCTIONS
// ============================================

/**
 * TOGGLE VIDEO LIKE CONTROLLER
 * Allows authenticated users to like or unlike a video
 * 
 * Purpose:
 * - Enable users to express appreciation for videos
 * - Toggle mechanism: if already liked, remove like; if not liked, add like
 * - Maintains single like per user per video (no duplicate likes)
 * 
 * Features:
 * - Validates video ID format and existence
 * - Checks if user already liked the video
 * - Adds like if not exists, removes if exists
 * - Returns current like status (isliked: true/false)
 * 
 * Process:
 * 1. Extract video ID from URL and user ID from auth
 * 2. Validate video ID format
 * 3. Verify video exists in database
 * 4. Check if user already liked this video
 * 5. If liked: remove like and return isliked:false
 * 6. If not liked: create like and return isliked:true
 * 
 * @route POST /api/v1/likes/toggle/v/:videoId
 * @access Private (requires authentication)
 */
const toggleVideoLike = asyncHandler(async (req, res) => {
    // STEP 1: Extract video ID from URL parameters and user ID from auth middleware
    const { videoId } = req.params
    const userId = req.user._id

    // STEP 2: Validate video ID is provided and is valid MongoDB ObjectId
    if (!videoId) {
        throw new ApiError(400, "VideoId not provided")
    }
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id provided")
    }

    // STEP 3: Verify video exists in database
    const exisitingVideo = await video.findById(videoId)
    if (!exisitingVideo) {
        throw new ApiError(404, "Video not found")
    }

    // STEP 4: Check if user has already liked this video
    // Query for existing like document with this video ID and user ID
    const existingLike = await like.findOne({
        video: videoId,
        likedBy: userId,
    })

    // STEP 5: Toggle logic - remove like if exists, add if doesn't exist
    if (existingLike) {
        // User already liked - remove the like (unlike)
        await like.deleteOne({ _id: existingLike._id })
        return res.status(200).json(
            new ApiResponse(200, { isliked: false }, "Like removed successfully")
        )
    } else {
        // User hasn't liked yet - create new like
        await like.create({
            video: videoId,
            likedBy: userId,
        })
        return res.status(200).json(
            new ApiResponse(200, { isliked: true }, "Video liked successfully")
        )
    }
})

/**
 * TOGGLE COMMENT LIKE CONTROLLER
 * Allows authenticated users to like or unlike a comment
 * 
 * Purpose:
 * - Enable users to express appreciation for comments
 * - Toggle mechanism: if already liked, remove like; if not liked, add like
 * - Maintains single like per user per comment (no duplicate likes)
 * 
 * Features:
 * - Validates comment ID format and existence
 * - Checks if user already liked the comment
 * - Adds like if not exists, removes if exists
 * - Returns current like status (isliked: true/false)
 * 
 * Process:
 * 1. Extract comment ID from URL and user ID from auth
 * 2. Validate comment ID format
 * 3. Verify comment exists in database
 * 4. Check if user already liked this comment
 * 5. If liked: remove like and return isliked:false
 * 6. If not liked: create like and return isliked:true
 * 
 * @route POST /api/v1/likes/toggle/c/:commentId
 * @access Private (requires authentication)
 */
const toggleCommentLike = asyncHandler(async (req, res) => {
    // STEP 1: Extract comment ID from URL parameters and user ID from auth middleware
    const { commentId } = req.params
    const userId = req.user._id

    // STEP 2: Validate comment ID is provided and is valid MongoDB ObjectId
    if (!commentId) {
        throw new ApiError(400, "Comment id not provided")
    }
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    // STEP 3: Verify comment exists in database
    const existingComment = await comment.findById(commentId)
    if (!existingComment) {
        throw new ApiError(404, "Comment not found")
    }

    // STEP 4: Check if user has already liked this comment
    // Query for existing like document with this comment ID and user ID
    const existingLike = await like.findOne({
        comment: commentId,
        likedBy: userId,
    })

    // STEP 5: Toggle logic - remove like if exists, add if doesn't exist
    if (existingLike) {
        // User already liked - remove the like (unlike)
        await like.deleteOne({ _id: existingLike._id })
        return res.status(200).json(
            new ApiResponse(200, { isliked: false }, "Like removed successfully")
        )
    } else {
        // User hasn't liked yet - create new like
        await like.create({ comment: commentId, likedBy: userId })
        return res.status(200).json(
            new ApiResponse(200, { isliked: true }, "Comment liked successfully")
        )
    }
})

// ============================================
// EXPORT CONTROLLERS
// ============================================
export {
    toggleVideoLike,    // POST /likes/toggle/v/:videoId - Toggle like on a video
    toggleCommentLike,  // POST /likes/toggle/c/:commentId - Toggle like on a comment
}