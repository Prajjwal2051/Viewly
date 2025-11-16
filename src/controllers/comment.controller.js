// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { comment } from "../models/comment.model.js"
import { video } from "../models/video.model.js"
import mongoose from "mongoose"

// ============================================
// CONTROLLER FUNCTIONS
// ============================================

/**
 * ADD COMMENT TO VIDEO CONTROLLER
 * Allows authenticated users to add comments to published videos
 * 
 * Features:
 * - Validates comment content (1-500 characters)
 * - Verifies video exists and is published
 * - Creates top-level comment (not a reply)
 * - Returns comment with populated owner details
 * 
 * Process:
 * 1. Extract and validate comment content
 * 2. Validate video ID format
 * 3. Verify video exists and is published
 * 4. Create comment in database
 * 5. Return comment with user information
 * 
 * @route POST /api/v1/comments
 * @access Private (requires authentication)
 */
const addComment = asyncHandler(async (req, res) => {
    // STEP 1: Extract comment data from request body
    const { content, videoId } = req.body

    // STEP 2: Validate comment content - must not be empty and within character limit
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment not Provided")
    }
    if (content.trim().length > 500) {
        throw new ApiError(400, "Comment cannot be longer than 500 characters")
    }

    // STEP 3: Validate video ID - must be provided and valid MongoDB ObjectId
    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid Video ID required")
    }

    // STEP 4: Verify video exists in database and is published
    // Users can only comment on published videos
    const videoExists = await video.findById(videoId)
    if (!videoExists) {
        throw new ApiError(404, "Video not found")
    }
    if (!videoExists.isPublished) {
        throw new ApiError(403, "Cannot comment on unpublished video")
    }

    // STEP 5: Create comment document in database
    // owner comes from req.user._id (added by auth middleware)
    // parentComment is null for top-level comments (not replies)
    const newComment = await comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id,
        likes: 0,
        parentComment: null,
    })

    // STEP 6: Validate comment creation was successful
    if (!newComment) {
        throw new ApiError(500, "Failed to create comment")
    }

    // STEP 7: Fetch created comment with populated owner details
    // Populate owner field with username, fullname, and avatar for response
    const createdComment = await comment
        .findById(newComment._id)
        .populate("owner", "username fullname avatar")

    // STEP 8: Send success response with comment data
    return res
        .status(201)
        .json(new ApiResponse(201, createdComment, "Comment added successfully"))
})

/**
 * GET ALL COMMENTS FOR VIDEO CONTROLLER
 * Fetches paginated list of top-level comments for a specific video
 * 
 * Purpose:
 * - Display comments section for video player
 * - Show comment author details (username, avatar)
 * - Supports pagination for better performance
 * - Returns only top-level comments (excludes replies)
 * 
 * Features:
 * - MongoDB aggregation pipeline for efficient querying
 * - Joins comment and user collections
 * - Sorted by newest comments first
 * - Includes like count and timestamps
 * 
 * Aggregation Pipeline Architecture:
 * Match Comments → Lookup Owner → Unwind → Project Fields → Sort → Paginate
 * 
 * Process:
 * 1. Validate video ID from URL parameters
 * 2. Verify video exists in database
 * 3. Build aggregation pipeline to:
 *    - Filter comments for this video (top-level only)
 *    - Join with users collection for owner details
 *    - Select specific fields to return
 *    - Sort by creation date (newest first)
 * 4. Apply pagination and return results
 * 
 * @route GET /api/v1/comments/:videoId
 * @access Public
 */
const getAllComment = asyncHandler(async (req, res) => {
    // STEP 1: Extract video ID from URL parameters and pagination from query
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    // STEP 2: Validate video ID - must be provided and valid MongoDB ObjectId
    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid Video ID required")
    }

    // STEP 3: Verify video exists in database
    const videoExists = await video.findById(videoId)
    if (!videoExists) {
        throw new ApiError(404, "Video not found")
    }

    // STEP 4: Build MongoDB aggregation pipeline
    // This efficiently fetches comments with owner details in a single query
    const aggregate = comment.aggregate([
        // Match only top-level comments for this specific video
        // parentComment: null excludes nested replies
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
                parentComment: null,
            },
        },
        // Join with users collection to get comment author information
        {
            $lookup: {
                from: "users",              // Collection to join with
                localField: "onwer",        // Field from comments collection
                foreignField: "_id",        // Field from users collection
                as: "ownerDetails",         // Output array field name
            },
        },
        // Convert ownerDetails from array to object
        // $lookup returns an array, but we need single object
        {
            $unwind: "$onwerDetails",
        },
        // Select only required fields for response
        // This reduces payload size and improves performance
        {
            $project: {
                content: 1,                     // Comment text
                likes: 1,                       // Like count
                createdAt: 1,                   // When comment was created
                updateAt: 1,                    // When comment was last updated
                "ownerDetails.username": 1,     // Comment author's username
                "ownerDetails.fullName": 1,     // Comment author's full name
                "ownerDetails.avatar": 1,       // Comment author's profile picture
            },
        },
        // Sort comments by creation date in descending order (newest first)
        {
            $sort: { createdAt: -1 },
        },
    ])

    // STEP 5: Configure pagination options
    const options = {
        page: parseInt(page),           // Current page number
        limit: parseInt(limit),         // Comments per page
        docs: "comments",               // Rename results array to "comments"
        totalDocs: "totalComments",     // Rename total count to "totalComments"
    }

    // STEP 6: Execute aggregation with pagination
    // aggregatePaginate handles pagination logic automatically
    const comments = await comment.aggregatePaginate(aggregate, options)

    // STEP 7: Send success response with paginated comments
    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})



// ============================================
// EXPORT CONTROLLERS
// ============================================
export { 
    addComment,         // POST /comments - Add comment to a video
    getAllComment,      // GET /comments/:videoId - Get all comments for a video (paginated)
}
