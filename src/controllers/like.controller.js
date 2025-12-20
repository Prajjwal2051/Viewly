// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { like } from "../models/like.model.js"
import { Tweet } from "../models/tweet.model.js"
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
    console.log("\n" + "=".repeat(60))
    console.log("👍 TOGGLE VIDEO LIKE REQUEST")
    console.log("=".repeat(60))

    // STEP 1: Extract video ID from URL parameters and user ID from auth middleware
    const { videoId } = req.params
    const userId = req.user._id

    console.log("\n[STEP 1] 📝 Extracting Request Data")
    console.log("   ➜ Video ID:", videoId || "(not provided)")
    console.log("   ➜ User ID:", userId)
    console.log("   ➜ User:", req.user?.username)

    console.log("\n[STEP 2] ✅ Validating Video ID")
    // STEP 2: Validate video ID is provided and is valid MongoDB ObjectId
    if (!videoId) {
        console.log("   ❌ Video ID not provided")
        throw new ApiError(400, "VideoId not provided")
    }
    console.log("   ✓ Video ID provided")

    if (!mongoose.isValidObjectId(videoId)) {
        console.log("   ❌ Invalid MongoDB ObjectId format")
        throw new ApiError(400, "Invalid video Id provided")
    }
    console.log("   ✓ Video ID format is valid")

    console.log("\n[STEP 3] 🎬 Verifying Video Exists")
    // STEP 3: Verify video exists in database
    const exisitingVideo = await Video.findById(videoId)
    if (!exisitingVideo) {
        console.log("   ❌ Video not found in database")
        throw new ApiError(404, "Video not found")
    }
    console.log("   ✓ Video found:", exisitingVideo.title)

    console.log("\n[STEP 4] 🔍 Checking Existing Like")
    // STEP 4: Check if user has already liked this video
    // Query for existing like document with this video ID and user ID
    const existingLike = await like.findOne({
        video: videoId,
        likedBy: userId,
    })

    if (existingLike) {
        console.log("   ➜ Status: Already liked - will UNLIKE")
    } else {
        console.log("   ➜ Status: Not liked - will LIKE")
    }

    console.log("\n[STEP 5] 💾 Processing Like Toggle")
    // STEP 5: Toggle logic - remove like if exists, add if doesn't exist
    if (existingLike) {
        console.log("   ➜ Removing existing like...")
        // User already liked - remove the like (unlike)
        await like.deleteOne({ _id: existingLike._id })

        // Decrement likes count in Video model
        await Video.findByIdAndUpdate(videoId, { $inc: { likes: -1 } })

        console.log("   ✓ Like removed successfully")

        console.log("\n" + "=".repeat(60))
        console.log("✅ VIDEO UNLIKED")
        console.log("=".repeat(60))
        console.log("   👤 User:", req.user.username)
        console.log("   🎬 Video:", exisitingVideo.title)
        console.log("   👍 Status: Unliked")
        console.log("=".repeat(60) + "\n")

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { isliked: false },
                    "Like removed successfully"
                )
            )
    } else {
        console.log("   ➜ Creating new like...")
        // User hasn't liked yet - create new like
        await like.create({
            video: videoId,
            likedBy: userId,
        })

        // Increment likes count in Video model
        await Video.findByIdAndUpdate(videoId, { $inc: { likes: 1 } })

        console.log("   ✓ Like created successfully")

        console.log("\n" + "=".repeat(60))
        console.log("✅ VIDEO LIKED")
        console.log("=".repeat(60))
        // console.log("   👤 User:", req.user.username);
        // console.log("   🎬 Video:", exisitingVideo.title);
        console.log("   👍 Status: Liked")
        console.log("=".repeat(60) + "\n")

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { isliked: true },
                    "Video liked successfully"
                )
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
    console.log("\n" + "=".repeat(60))
    console.log("👍 TOGGLE COMMENT LIKE REQUEST")
    console.log("=".repeat(60))

    // STEP 1: Extract comment ID from URL parameters and user ID from auth middleware
    const { commentId } = req.params
    const userId = req.user._id

    console.log("\n[STEP 1] 📝 Extracting Request Data")
    console.log("   ➜ Comment ID:", commentId || "(not provided)")
    console.log("   ➜ User:", req.user?.username)

    console.log("\n[STEP 2] ✅ Validating Comment ID")
    // STEP 2: Validate comment ID is provided and is valid MongoDB ObjectId
    if (!commentId) {
        console.log("   ❌ Comment ID not provided")
        throw new ApiError(400, "Comment id not provided")
    }
    console.log("   ✓ Comment ID provided")

    if (!mongoose.isValidObjectId(commentId)) {
        console.log("   ❌ Invalid MongoDB ObjectId format")
        throw new ApiError(400, "Invalid comment id")
    }
    console.log("   ✓ Comment ID format is valid")

    console.log("\n[STEP 3] 💬 Verifying Comment Exists")
    // STEP 3: Verify comment exists in database
    const existingComment = await Comment.findById(commentId)
    if (!existingComment) {
        console.log("   ❌ Comment not found in database")
        throw new ApiError(404, "Comment not found")
    }
    console.log(
        "   ✓ Comment found:",
        `"${existingComment.content.substring(0, 50)}${existingComment.content.length > 50 ? "..." : ""}"`
    )

    console.log("\n[STEP 4] 🔍 Checking Existing Like")
    // STEP 4: Check if user has already liked this comment
    // Query for existing like document with this comment ID and user ID
    const existingLike = await like.findOne({
        comment: commentId,
        likedBy: userId,
    })

    if (existingLike) {
        console.log("   ➜ Status: Already liked - will UNLIKE")
    } else {
        console.log("   ➜ Status: Not liked - will LIKE")
    }

    // STEP 5: Toggle logic - remove like if exists, add if doesn't exist
    if (existingLike) {
        // User already liked - remove the like (unlike)
        await like.deleteOne({ _id: existingLike._id })

        // Decrement likes count in Comment model
        await Comment.findByIdAndUpdate(commentId, { $inc: { likes: -1 } })

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { isliked: false },
                    "Like removed successfully"
                )
            )
    } else {
        // User hasn't liked yet - create new like
        await like.create({ comment: commentId, likedBy: userId })

        // Increment likes count in Comment model
        await Comment.findByIdAndUpdate(commentId, { $inc: { likes: 1 } })

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { isliked: true },
                    "Comment liked successfully"
                )
            )
    }
})

/**
 * GET LIKED VIDEOS CONTROLLER
 * Fetches paginated list of all videos liked by the authenticated user
 *
 * Purpose:
 * - Display user's liked videos collection
 * - Show video details along with channel/owner information
 * - Support pagination for better performance with large collections
 * - Sort by most recently liked videos first
 *
 * Features:
 * - Uses MongoDB aggregation pipeline for efficient querying
 * - Joins three collections: likes → videos → users
 * - Filters only video likes (excludes comment likes)
 * - Returns complete video and owner details
 * - Automatically handles deleted videos (filtered out by lookup)
 *
 * Aggregation Pipeline Architecture:
 * Raw Likes Data → [Match User] → [Join Videos] → [Flatten] → [Join Users/Owners] → [Flatten] → [Select Fields] → [Sort] → Paginated Result
 *
 * Process:
 * 1. Extract user ID from authentication
 * 2. Get pagination parameters from query
 * 3. Build aggregation pipeline:
 *    - Filter likes by current user (video likes only)
 *    - Join with videos collection to get video details
 *    - Join with users collection to get channel/owner details
 *    - Select specific fields for response
 *    - Sort by most recently liked
 * 4. Apply pagination and execute query
 * 5. Return paginated results
 *
 * @route GET /api/v1/likes/videos
 * @access Private (requires authentication)
 */
const getLikedVideos = asyncHandler(async (req, res) => {
    // STEP 1: Extract user ID from authenticated user (added by verifyJWT middleware)
    const userId = req.user._id

    // STEP 2: Extract pagination parameters from query string with defaults
    // Default: page 1, 10 videos per page
    const { page = 1, limit = 10 } = req.query

    // STEP 3: Build MongoDB aggregation pipeline for efficient data retrieval
    // This pipeline joins multiple collections and transforms data in a single database call
    const aggregationPipeline = [
        // STAGE 1: Match (Filter) - Get only this user's video likes
        // This is the entry point - filters the likes collection
        {
            $match: {
                // Match likes by current user only
                likedBy: new mongoose.Types.ObjectId(userId),
                // Filter for video likes only (exclude comment likes)
                // $exists ensures field exists, $ne ensures it's not null
                video: {
                    $exists: true, // Video field must exist
                    $ne: null, // Video field must not be null
                },
            },
        },
        // STAGE 2: Lookup (Join) - Join with videos collection
        // This fetches complete video information for each like
        {
            $lookup: {
                from: "videos", // Target collection to join with
                localField: "video", // Field from likes collection (ObjectId)
                foreignField: "_id", // Field from videos collection to match
                as: "videoDetails", // Store results in this array field
            },
        },
        // STAGE 3: Unwind - Convert videoDetails array to single object
        // $lookup returns an array even for single matches
        // $unwind flattens it: [{video}] becomes {video}
        // This makes accessing fields easier: videoDetails.title instead of videoDetails[0].title
        {
            $unwind: "$videoDetails",
        },
        // STAGE 4: Lookup (Nested Join) - Join with users collection for video owner/channel info
        // Now that we have video details, get information about who uploaded it
        {
            $lookup: {
                from: "users", // Users collection (channels)
                localField: "videoDetails.owner", // Owner ID from video document
                foreignField: "_id", // User ID to match
                as: "ownerDetails", // Store channel info here
            },
        },
        // STAGE 5: Unwind - Convert ownerDetails array to single object
        // Same reason as Stage 3 - easier field access
        {
            $unwind: "$ownerDetails",
        },
        // STAGE 6: Project - Select only specific fields to return
        // This improves performance (less data transfer) and security (hide sensitive fields)
        // Using 1 means "include this field"
        {
            $project: {
                "videoDetails._id": 1, // Video ID
                "videoDetails.title": 1, // Video title
                "videoDetails.thumbnail": 1, // Video thumbnail URL
                "videoDetails.duration": 1, // Video duration in seconds
                "videoDetails.views": 1, // View count
                "ownerDetails.username": 1, // Channel username
                "ownerDetails.fullName": 1, // Channel full name
                "ownerDetails.avatar": 1, // Channel profile picture
                createdAt: 1, // When user liked this video (from like document)
            },
        },
        // STAGE 7: Sort - Order by most recently liked
        // -1 means descending order (newest first)
        {
            $sort: {
                createdAt: -1, // Most recent likes appear first
            },
        },
    ]

    // STEP 4: Create aggregation object from pipeline
    // This doesn't execute yet - just prepares the query
    const aggregate = like.aggregate(aggregationPipeline)

    // STEP 5: Configure pagination options
    // These settings control how results are split into pages
    const options = {
        page: parseInt(page), // Current page number (convert string to number)
        limit: parseInt(limit), // Items per page (convert string to number)
        customLabels: {
            docs: "likedVideos", // Rename results array to "likedVideos"
            totalDocs: "totalLikes", // Rename count to "totalLikes"
        },
    }

    // STEP 6: Execute aggregation with pagination
    // aggregatePaginate runs the pipeline and handles skip/limit automatically
    const result = await like.aggregatePaginate(aggregate, options)

    // STEP 7: Send success response with paginated liked videos
    return res
        .status(200)
        .json(new ApiResponse(200, result, "Liked videos fetched successfully"))
})

/**
 * GET LIKED COMMENTS CONTROLLER
 * Fetches paginated list of all comments liked by the authenticated user
 *
 * Purpose:
 * - Display user's liked comments collection
 * - Show comment content along with comment author information
 * - Support pagination for better performance with large collections
 * - Sort by most recently liked comments first
 *
 * Features:
 * - Uses MongoDB aggregation pipeline for efficient querying
 * - Joins three collections: likes → comments → users
 * - Filters only comment likes (excludes video likes)
 * - Returns complete comment and author details
 * - Automatically handles deleted comments (filtered out by lookup)
 *
 * Aggregation Pipeline Architecture:
 * Raw Likes Data → [Match User] → [Join Comments] → [Flatten] → [Join Users/Authors] → [Flatten] → [Sort] → Paginated Result
 *
 * Process:
 * 1. Extract user ID from authentication
 * 2. Get pagination parameters from query
 * 3. Build aggregation pipeline:
 *    - Filter likes by current user (comment likes only)
 *    - Join with comments collection to get comment details
 *    - Join with users collection to get comment author details
 *    - Sort by most recently liked
 * 4. Apply pagination and execute query
 * 5. Return paginated results
 *
 * @route GET /api/v1/likes/comments
 * @access Private (requires authentication)
 */
const getLikedComments = asyncHandler(async (req, res) => {
    // STEP 1: Extract user ID from authenticated user (added by verifyJWT middleware)
    const userId = req.user._id

    // STEP 2: Extract pagination parameters from query string with defaults
    // Default: page 1, 10 comments per page
    const { page = 1, limit = 10 } = req.query

    // STEP 3: Build MongoDB aggregation pipeline for efficient data retrieval
    // Similar to getLikedVideos but for comments instead
    const aggregationPipeline = [
        // STAGE 1: Match (Filter) - Get only this user's comment likes
        // This is the entry point - filters the likes collection
        {
            $match: {
                // Match likes by current user only
                likedBy: new mongoose.Types.ObjectId(userId),
                // Filter for comment likes only (exclude video likes)
                // $exists ensures field exists, $ne ensures it's not null
                comment: {
                    $exists: true, // Comment field must exist
                    $ne: null, // Comment field must not be null
                },
            },
        },
        // STAGE 2: Lookup (Join) - Join with comments collection
        // This fetches complete comment information for each like
        {
            $lookup: {
                from: "comments", // Target collection to join with
                localField: "comment", // Field from likes collection (ObjectId)
                foreignField: "_id", // Field from comments collection to match
                as: "commentDetails", // Store results in this array field
            },
        },
        // STAGE 3: Unwind - Convert commentDetails array to single object
        // $lookup returns an array even for single matches
        // $unwind flattens it for easier field access
        {
            $unwind: "$commentDetails",
        },
        // STAGE 4: Lookup (Nested Join) - Join with users collection for comment author info
        // Now that we have comment details, get information about who wrote it
        {
            $lookup: {
                from: "users", // Users collection (comment authors)
                localField: "commentDetails.owner", // Author ID from comment document
                foreignField: "_id", // User ID to match
                as: "ownerDetails", // Store author info here
            },
        },
        // STAGE 5: Unwind - Convert ownerDetails array to single object
        // Same reason as Stage 3 - easier field access
        {
            $unwind: "$ownerDetails",
        },
        // STAGE 6: Project - Select specific fields (optional for future enhancement)
        // You can add a $project stage here to select only needed fields:
        // "commentDetails.content", "commentDetails.createdAt",
        // "ownerDetails.username", "ownerDetails.avatar", etc.
        {
            $project: {
                "commentDetails._id": 1, // Comment ID
                "commentDetails.content": 1, // Comment text
                "commentDetails.createdAt": 1, // When comment was created
                "ownerDetails.username": 1, // Comment author username
                "ownerDetails.fullName": 1, // Comment author full name
                "ownerDetails.avatar": 1, // Comment author profile picture
                createdAt: 1, // When user liked this comment (from like document)
            },
        },
        // STAGE 7: Sort - Order by most recently liked
        // -1 means descending order (newest first)
        {
            $sort: {
                createdAt: -1, // Most recent likes appear first
            },
        },
    ]

    // STEP 4: Create aggregation object from pipeline
    // This doesn't execute yet - just prepares the query
    const aggregate = like.aggregate(aggregationPipeline)

    // STEP 5: Configure pagination options
    // These settings control how results are split into pages
    const options = {
        page: parseInt(page), // Current page number (convert string to number)
        limit: parseInt(limit), // Items per page (convert string to number)
        customLabels: {
            docs: "likedComments", // Rename results array to "likedComments"
            totalDocs: "totalLikes", // Rename count to "totalLikes"
        },
    }

    // STEP 6: Execute aggregation with pagination
    // aggregatePaginate runs the pipeline and handles skip/limit automatically
    const result = await like.aggregatePaginate(aggregate, options)

    // STEP 7: Send success response with paginated liked comments
    return res
        .status(200)
        .json(
            new ApiResponse(200, result, "Liked comments fetched successfully")
        )
})

/**
 * GET IS VIDEO LIKED CONTROLLER
 * Checks if the authenticated user has liked a specific video
 *
 * Purpose:
 * - Allow frontend to show correct like status (red thumb vs grey thumb)
 *
 * @route GET /api/v1/likes/status/v/:videoId
 * @access Private
 */
const getIsVideoLiked = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const existingLike = await like.findOne({
        video: videoId,
        likedBy: userId,
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: !!existingLike },
                "Like status fetched successfully"
            )
        )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user._id

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const existingTweet = await Tweet.findById(tweetId)
    if (!existingTweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const existingLike = await like.findOne({
        tweet: tweetId,
        likedBy: userId,
    })

    if (existingLike) {
        await like.deleteOne({ _id: existingLike._id })
        await Tweet.findByIdAndUpdate(tweetId, { $inc: { likes: -1 } })
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { isliked: false },
                    "Like removed successfully"
                )
            )
    } else {
        await like.create({ tweet: tweetId, likedBy: userId })
        await Tweet.findByIdAndUpdate(tweetId, { $inc: { likes: 1 } })
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { isliked: true },
                    "Tweet liked successfully"
                )
            )
    }
})

/**
 * GET IS TWEET LIKED CONTROLLER
 * Checks if the authenticated user has liked a specific tweet
 *
 * Purpose:
 * - Allow frontend to show correct like status (filled heart vs empty heart)
 *
 * @route GET /api/v1/like/status/tweet/:tweetId
 * @access Private
 */
const getIsTweetLiked = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user._id

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const existingLike = await like.findOne({
        tweet: tweetId,
        likedBy: userId,
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: !!existingLike },
                "Like status fetched successfully"
            )
        )
})

// ============================================
// EXPORT CONTROLLERS
// ============================================
export {
    toggleVideoLike, // POST /likes/toggle/v/:videoId - Toggle like on a video
    toggleCommentLike, // POST /likes/toggle/c/:commentId - Toggle like on a comment
    toggleTweetLike, // POST /likes/toggle/t/:tweetId - Toggle like on a tweet
    getLikedVideos, // GET /likes/videos - Get all videos liked by authenticated user
    getLikedComments, // GET /likes/comments - Get all comments liked by authenticated user
    getIsVideoLiked, // GET /likes/status/v/:videoId - Check if video is liked
    getIsTweetLiked, // GET /likes/status/tweet/:tweetId - Check if tweet is liked
}
