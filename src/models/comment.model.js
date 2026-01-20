// ============================================
// COMMENT MODEL - DATABASE SCHEMA
// ============================================
// Defines the structure for comment documents in MongoDB
// Supports comments on both videos and tweets with nested replies

import mongoose, { mongo, Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

/**
 * COMMENT SCHEMA
 * Represents a user comment on a video or tweet
 * 
 * Features:
 * - Comment on videos or tweets (polymorphic relationship)
 * - Nested comments (replies to comments)
 * - Character limits (1-500 characters)
 * - Like count tracking
 * - Ownership tracking (who posted the comment)
 * 
 * Used For:
 * - User engagement and feedback
 * - Discussions on videos/tweets
 * - Building community interaction
 * - Threaded conversations (via parentComment)
 */
const commentSchema = new mongoose.Schema(
    {
        // Comment text content (what the user wrote)
        content: {
            type: String,
            required: true,       // Cannot post empty comment
            trim: true,           // Remove leading/trailing whitespace
            minlength: 1,         // At least 1 character
            maxlength: 500,       // Maximum 500 characters
        },

        // Reference to video (if commenting on a video)
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",         // Links to Video collection
            // Optional - either video OR tweet must be set
        },

        // Reference to tweet (if commenting on a tweet)
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",         // Links to Tweet collection
            // Optional - either video OR tweet must be set
        },

        // User who posted this comment
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",          // Links to User collection
            required: true,       // Every comment must have an owner
        },

        // Parent comment ID for nested replies (threaded comments)
        parentComment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",       // Links to parent Comment
            default: null,        // null = top-level comment, not a reply
        },

        // Total number of likes on this comment
        likes: {
            type: Number,
            default: 0,           // Starts at 0
        },
    },
    {
        // Automatically add createdAt and updatedAt timestamps
        timestamps: true,
    }
)

// Enable pagination for comment listings (paginated replies, etc.)
commentSchema.plugin(mongooseAggregatePaginate)

// Export the Comment model for use in controllers
export const Comment = mongoose.model("Comment", commentSchema)
