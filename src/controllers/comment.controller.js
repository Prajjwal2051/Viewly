// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"
import mongoose, { mongo } from "mongoose"

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
    const { content, videoId, tweetId } = req.body

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }

    let targetObject = {}

    if (videoId) {
        if (!mongoose.isValidObjectId(videoId))
            throw new ApiError(400, "Invalid Video ID")
        const video = await Video.findById(videoId)
        if (!video) throw new ApiError(404, "Video not found")
        targetObject.video = videoId
    } else if (tweetId) {
        if (!mongoose.isValidObjectId(tweetId))
            throw new ApiError(400, "Invalid Tweet ID")
        const tweet = await Tweet.findById(tweetId)
        if (!tweet) throw new ApiError(404, "Tweet not found")
        targetObject.tweet = tweetId
    } else {
        throw new ApiError(400, "Either Video ID or Tweet ID is required")
    }

    const newComment = await Comment.create({
        content: content.trim(),
        owner: req.user._id,
        likes: 0,
        parentComment: null,
        ...targetObject,
    })

    const createdComment = await Comment.findById(newComment._id).populate(
        "owner",
        "username fullName avatar"
    )

    return res
        .status(201)
        .json(
            new ApiResponse(201, createdComment, "Comment added successfully")
        )
})

const getAllComment = asyncHandler(async (req, res) => {
    // ... existing getAllComment implementation ...
    // Note: This function specifically gets comments for a Video (from route param)
    // We will keep it as is and add getTweetComments separately
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid Video ID required")
    }

    const aggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
                parentComment: null,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            },
        },
        {
            $unwind: {
                path: "$ownerDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                content: 1,
                likes: 1,
                createdAt: 1,
                "ownerDetails.username": 1,
                "ownerDetails._id": 1,
                "ownerDetails.fullName": 1,
                "ownerDetails.avatar": 1,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
    ])

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        customLabels: {
            docs: "comments",
            totalDocs: "totalComments",
        },
    }

    const comments = await Comment.aggregatePaginate(aggregate, options)

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

const getTweetComments = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!tweetId || !mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Valid Tweet ID required")
    }

    const aggregate = Comment.aggregate([
        {
            $match: {
                tweet: new mongoose.Types.ObjectId(tweetId),
                parentComment: null,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            },
        },
        {
            $unwind: {
                path: "$ownerDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                content: 1,
                "ownerDetails._id": 1,
                likes: 1,
                createdAt: 1,
                "ownerDetails.username": 1,
                "ownerDetails.fullName": 1,
                "ownerDetails.avatar": 1,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
    ])

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        customLabels: {
            docs: "comments",
            totalDocs: "totalComments",
        },
    }

    const comments = await Comment.aggregatePaginate(aggregate, options)

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

// Keep update/delete logic but ensure only exports are updated
const updateComment = asyncHandler(async (req, res) => {
    // ... existing update logic ...
    const { commentId } = req.params
    const { content } = req.body

    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Valid Comment ID required")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content required")
    }

    const existingComment = await Comment.findById(commentId)
    if (!existingComment) {
        throw new ApiError(404, "Comment not found")
    }

    if (existingComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content.trim(),
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )

    const commentWithOwner = await Comment.findById(
        updatedComment._id
    ).populate("owner", "username fullName avatar")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                commentWithOwner,
                "Comment updated successfully"
            )
        )
})

const deleteComment = asyncHandler(async (req, res) => {
    // ... existing delete logic ...
    const { commentId } = req.params
    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Provide a valid comment id")
    }

    const existingComment = await Comment.findById(commentId)
    if (!existingComment) {
        throw new ApiError(404, "comment not found")
    }

    if (existingComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
        .status(200)
        .json(new ApiResponse(200, commentId, "Comment sucessfully deleted"))
})

/**
 * GET USER COMMENTS CONTROLLER
 * Fetches all comments made by the authenticated user
 *
 * Features:
 * - Returns user's comments across all videos and tweets
 * - Includes context (video/tweet details) for each comment
 * - Paginated results for performance
 * - Sorted by most recent first
 *
 * @route GET /api/v1/comments/user/me
 * @access Private (requires authentication)
 */
const getUserComments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query
    const userId = req.user._id

    const aggregate = Comment.aggregate([
        // Step 1: Match comments by user
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },

        // Step 2: Lookup video details (if commented on video)
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
            },
        },

        // Step 3: Lookup tweet details (if commented on tweet)
        {
            $lookup: {
                from: "tweets",
                localField: "tweet",
                foreignField: "_id",
                as: "tweetDetails",
            },
        },

        // Step 4: Unwind arrays (handle optional fields)
        {
            $unwind: {
                path: "$videoDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: "$tweetDetails",
                preserveNullAndEmptyArrays: true,
            },
        },

        // Step 5: Project only needed fields
        {
            $project: {
                content: 1,
                likes: 1,
                createdAt: 1,
                updatedAt: 1,
                // Video context (if exists)
                "videoDetails._id": 1,
                "videoDetails.title": 1,
                "videoDetails.thumbnail": 1,
                // Tweet context (if exists)
                "tweetDetails._id": 1,
                "tweetDetails.content": 1,
                "tweetDetails.image": 1,
                // Determine type
                commentType: {
                    $cond: [{ $ifNull: ["$video", false] }, "video", "tweet"],
                },
            },
        },

        // Step 6: Sort by most recent first
        {
            $sort: { createdAt: -1 },
        },
    ])

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        customLabels: {
            docs: "comments",
            totalDocs: "totalComments",
            page: "currentPage",
            totalPages: "totalPages",
        },
    }

    const result = await Comment.aggregatePaginate(aggregate, options)

    return res
        .status(200)
        .json(
            new ApiResponse(200, result, "User comments fetched successfully")
        )
})

export {
    addComment,
    getAllComment,
    getTweetComments,
    updateComment,
    deleteComment,
    getUserComments,
}
