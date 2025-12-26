// ============================================
// LIKE MODEL - DATABASE SCHEMA
// ============================================
// Defines the structure for like documents in MongoDB
// Tracks user likes on videos, comments, and tweets

import mongoose, { Mongoose, mongo, Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import { Comment } from "./comment.model.js"

/**
 * LIKE SCHEMA
 * Represents a user's like on a video, comment, or tweet
 * 
 * Features:
 * - Polymorphic likes (can like video, comment, OR tweet)
 * - One like per user per item (enforced by unique indexes)
 * - Track which user liked what content
 * - Support for "liked videos" and "liked comments" lists
 * 
 * Database Design:
 * - Uses partial indexes to ensure uniqueness per content type
 * - Prevents duplicate likes from same user on same item
 * - Allows efficient queries for "all likes by user" or "all likes on video"
 * 
 * Used For:
 * - Like/unlike functionality
 * - Displaying liked content lists
 * - Calculating total likes per item
 * - User engagement analytics
 */
const likeSchema = new mongoose.Schema(
    {
        // Reference to video being liked (if liking a video)
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",         // Links to Video collection
            // Optional - only ONE of video/comment/tweet should be set
        },

        // Reference to comment being liked (if liking a comment)
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",       // Links to Comment collection
            // Optional - only ONE of video/comment/tweet should be set
        },

        // Reference to tweet being liked (if liking a tweet)
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",         // Links to Tweet collection
            // Optional - only ONE of video/comment/tweet should be set
        },

        // User who performed the like action
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",          // Links to User collection
            required: true,       // Every like must have a user
        },
    },
    {
        // Automatically track when like was created/updated
        timestamps: true,
    }
)

// Enable pagination for liked content listings
likeSchema.plugin(mongooseAggregatePaginate)

/**
 * UNIQUE INDEXES FOR LIKE CONSTRAINTS
 * Ensures a user can only like the same item once
 * 
 * Why Partial Indexes?
 * - Normal unique index would fail when fields are null
 * - Partial index only enforces uniqueness when field EXISTS
 * - This allows same user to like video, comment, AND tweet separately
 * 
 * Example:
 * ✅ User A likes Video 1 (creates: {video: V1, likedBy: A})
 * ❌ User A likes Video 1 again (duplicate - blocked by index)
 * ✅ User A likes Comment 1 (creates: {comment: C1, likedBy: A})
 */

// Prevent duplicate likes on videos (one like per user per video)
likeSchema.index(
    { video: 1, likedBy: 1 },
    {
        unique: true,         // Enforce uniqueness
        partialFilterExpression: { video: { $type: "objectId" } }  // Only when video field exists
    }
)

// Prevent duplicate likes on comments (one like per user per comment)
likeSchema.index(
    { comment: 1, likedBy: 1 },
    {
        unique: true,         // Enforce uniqueness
        partialFilterExpression: { comment: { $type: "objectId" } },  // Only when comment field exists
    }
)

// Prevent duplicate likes on tweets (one like per user per tweet)
likeSchema.index(
    { tweet: 1, likedBy: 1 },
    {
        unique: true,         // Enforce uniqueness
        partialFilterExpression: { tweet: { $type: "objectId" } }  // Only when tweet field exists
    }
)

// Export the Like model for use in controllers
export const like = mongoose.model("Like", likeSchema)
