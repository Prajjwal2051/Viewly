// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
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
    console.log("\n" + "=".repeat(60));
    console.log("💬 ADD COMMENT REQUEST");
    console.log("=".repeat(60));

    // STEP 1: Extract comment data from request body
    const { content, videoId } = req.body

    console.log("\n[STEP 1] 📝 Extracting Comment Data");
    console.log("   ➜ Video ID:", videoId || "(not provided)");
    console.log("   ➜ Comment Content:", content ? `"${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"` : "(not provided)");
    console.log("   ➜ Content Length:", content ? content.length : 0, "characters");
    console.log("   ➜ User:", req.user?.username || "Unknown");

    console.log("\n[STEP 2] ✅ Validating Comment Content");
    // STEP 2: Validate comment content - must not be empty and within character limit
    if (!content || content.trim() === "") {
        console.log("   ❌ Validation Failed: Comment content is empty");
        throw new ApiError(400, "Comment not Provided")
    }
    console.log("   ✓ Content is not empty");

    if (content.trim().length > 500) {
        console.log("   ❌ Validation Failed: Comment exceeds 500 character limit (", content.trim().length, "characters)");
        throw new ApiError(400, "Comment cannot be longer than 500 characters")
    }
    console.log("   ✓ Content length within limit");

    console.log("\n[STEP 3] ✅ Validating Video ID");
    // STEP 3: Validate video ID - must be provided and valid MongoDB ObjectId
    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        console.log("   ❌ Invalid or missing Video ID");
        throw new ApiError(400, "Valid Video ID required")
    }
    console.log("   ✓ Video ID format is valid");

    console.log("\n[STEP 4] 🎬 Verifying Video Exists");
    // STEP 4: Verify video exists in database and is published
    // Users can only comment on published videos
    const videoExists = await Video.findById(videoId)
    if (!videoExists) {
        console.log("   ❌ Video not found in database");
        throw new ApiError(404, "Video not found")
    }
    console.log("   ✓ Video found:", videoExists.title);

    if (!videoExists.isPublished) {
        console.log("   ❌ Video is not published - comments not allowed");
        throw new ApiError(403, "Cannot comment on unpublished video")
    }
    console.log("   ✓ Video is published - comments allowed");

    console.log("\n[STEP 5] 💾 Creating Comment in Database");
    // STEP 5: Create comment document in database
    // owner comes from req.user._id (added by auth middleware)
    // parentComment is null for top-level comments (not replies)
    const newComment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id,
        likes: 0,
        parentComment: null,
    })

    // STEP 6: Validate comment creation was successful
    if (!newComment) {
        console.log("   ❌ Failed to create comment document");
        throw new ApiError(500, "Failed to create comment")
    }
    console.log("   ✓ Comment created successfully");
    console.log("   ➜ Comment ID:", newComment._id);

    console.log("\n[STEP 6] 🔄 Fetching Complete Comment Details");
    // STEP 7: Fetch created comment with populated owner details
    // Populate owner field with username, fullname, and avatar for response
    const createdComment = await Comment
        .findById(newComment._id)
        .populate("owner", "username fullname avatar")
    console.log("   ✓ Owner details populated");

    console.log("\n" + "=".repeat(60));
    console.log("✅ COMMENT ADDED SUCCESSFULLY");
    console.log("=".repeat(60));
    console.log("   💬 Comment ID:", newComment._id);
    console.log("   👤 User:", req.user.username);
    console.log("   🎬 Video:", videoExists.title);
    console.log("   📏 Length:", content.trim().length, "characters");
    console.log("=".repeat(60) + "\n");

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
    console.log("\n" + "=".repeat(60));
    console.log("📋 GET ALL COMMENTS REQUEST");
    console.log("=".repeat(60));

    // STEP 1: Extract video ID from URL parameters and pagination from query
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    console.log("\n[STEP 1] 📄 Processing Request Parameters");
    console.log("   ➜ Video ID:", videoId);
    console.log("   ➜ Page:", page);
    console.log("   ➜ Limit:", limit);

    console.log("\n[STEP 2] ✅ Validating Video ID");
    // STEP 2: Validate video ID - must be provided and valid MongoDB ObjectId
    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        console.log("   ❌ Invalid or missing Video ID");
        throw new ApiError(400, "Valid Video ID required")
    }
    console.log("   ✓ Video ID format is valid");

    console.log("\n[STEP 3] 🎬 Verifying Video Exists");
    // STEP 3: Verify video exists in database
    const videoExists = await Video.findById(videoId)
    if (!videoExists) {
        console.log("   ❌ Video not found in database");
        throw new ApiError(404, "Video not found")
    }
    console.log("   ✓ Video found:", videoExists.title);

    // STEP 4: Build MongoDB aggregation pipeline
    // This efficiently fetches comments with owner details in a single query
    const aggregate = Comment.aggregate([
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
    const comments = await Comment.aggregatePaginate(aggregate, options)

    // STEP 7: Send success response with paginated comments
    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

/**
 * UPDATE COMMENT CONTROLLER
 * Allows authenticated users to update their own comments
 * 
 * Purpose:
 * - Enable users to edit comment content after posting
 * - Maintain comment ownership security
 * - Preserve comment metadata (likes, timestamps)
 * 
 * Features:
 * - Validates comment content (1-500 characters)
 * - Verifies comment ownership (only author can edit)
 * - Updates content while preserving other fields
 * - Returns updated comment with owner details
 * 
 * Security:
 * - Only comment owner can update their comment
 * - Validates user authentication via middleware
 * - Prevents unauthorized modifications
 * 
 * Process:
 * 1. Extract comment ID from URL and new content from body
 * 2. Validate comment ID format and content requirements
 * 3. Verify comment exists in database
 * 4. Check user owns the comment (authorization)
 * 5. Update comment in database
 * 6. Return updated comment with owner details
 * 
 * @route PATCH /api/v1/comments/:commentId
 * @access Private (requires authentication and ownership)
 */
const updateComment = asyncHandler(async (req, res) => {
    // STEP 1: Extract comment ID from URL parameters and new content from body
    const { commentId } = req.params
    const { content } = req.body

    // STEP 2: Validate comment ID - must be provided and valid MongoDB ObjectId
    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Valid Comment ID required")
    }

    // STEP 3: Validate new comment content - must not be empty and within character limit
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content required")
    }
    if (content.trim().length < 1) {
        throw new ApiError(400, "Comment must have at least 1 character")
    }
    if (content.trim().length > 500) {
        throw new ApiError(400, "Comment cannot exceed 500 characters")
    }

    // STEP 4: Verify comment exists in database
    const existingComment = await Comment.findById(commentId)
    if (!existingComment) {
        throw new ApiError(404, "Comment not found")
    }

    // STEP 5: Check comment ownership - only author can update their comment
    // This prevents users from editing other people's comments
    if (existingComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment")
    }

    // STEP 6: Update comment in database with new content
    // Uses findByIdAndUpdate for atomic operation
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content.trim(),    // Update only the content field
            },
        },
        {
            new: true,              // Return updated document
            runValidators: true,    // Run schema validations
        }
    )

    // STEP 7: Validate update was successful
    if (!updatedComment) {
        throw new ApiError(500, "Failed to update comment")
    }

    // STEP 8: Fetch updated comment with populated owner details
    // Populate owner field with username, fullname, and avatar for response
    const commentWithOwner = await Comment
        .findById(updatedComment._id)
        .populate("owner", "username fullname avatar")

    // STEP 9: Send success response with updated comment data
    return res
        .status(200)
        .json(new ApiResponse(200, commentWithOwner, "Comment updated successfully"))
})

/**
 * DELETE COMMENT CONTROLLER
 * Allows authenticated users to delete their own comments
 * 
 * Purpose:
 * - Enable users to remove their comments from videos
 * - Maintain comment ownership security
 * - Permanently remove comment from database
 * 
 * Features:
 * - Validates comment ID format
 * - Verifies comment ownership (only author can delete)
 * - Removes comment permanently from database
 * - Returns success confirmation with deleted comment ID
 * 
 * Security:
 * - Only comment owner can delete their comment
 * - Validates user authentication via middleware
 * - Prevents unauthorized deletions
 * 
 * Process:
 * 1. Extract comment ID from URL parameters
 * 2. Validate comment ID format
 * 3. Verify comment exists in database
 * 4. Check user owns the comment (authorization)
 * 5. Delete comment from database
 * 6. Return success response
 * 
 * @route DELETE /api/v1/comments/:commentId
 * @access Private (requires authentication and ownership)
 */
const deleteComment = asyncHandler(async (req, res) => {
    // STEP 1: Extract comment ID from URL parameters
    const { commentId } = req.params

    // STEP 2: Validate comment ID is provided
    if (!commentId) {
        console.log("comment id not provided")
        throw new ApiError(400, "comment id is not provided")
    }

    // STEP 3: Validate comment ID is a valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(commentId)) {
        console.log("please peovide a valid comment id")
        throw new ApiError(400, "Provide a valid comment id")
    }

    // STEP 4: Verify comment exists in database
    const existingComment = await Comment.findById(commentId)
    if (!existingComment) {
        console.log("comment does not exists")
        throw new ApiError(404, "comment not found for deletion")
    }

    // STEP 5: Check comment ownership - only author can delete their comment
    // This prevents users from deleting other people's comments
    if (existingComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

    // STEP 6: Delete comment from database
    const deletedComment = await Comment.findByIdAndDelete(commentId)

    // STEP 7: Validate deletion was successful
    if (!deletedComment) {
        console.log("comment unable to delete")
        throw new ApiError(500, "Comment unable to delete from DB")
    }

    // STEP 8: Send success response with deleted comment ID
    return res
        .status(200)
        .json(new ApiResponse(200, commentId, "Comment sucessfully deleted"))
})

// ============================================
// EXPORT CONTROLLERS
// ============================================
export {
    addComment,         // POST /comments - Add comment to a video
    getAllComment,      // GET /comments/:videoId - Get all comments for a video (paginated)
    updateComment,      // PATCH /comments/:commentId - Update user's own comment
    deleteComment,      // DELETE /comments/:commentId - Delete user's own comment
}
