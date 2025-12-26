// ============================================
// TWEET MODEL - DATABASE SCHEMA
// ============================================
// Defines the structure for tweet/post documents in MongoDB
// Similar to Twitter posts - short messages with optional images

import mongoose, { Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

/**
 * TWEET SCHEMA
 * Represents a social media post (like Twitter tweet)
 * 
 * Features:
 * - Text content (caption/message)
 * - Optional image attachment
 * - Like count tracking
 * - User ownership
 * 
 * Purpose:
 * - Social networking feature
 * - Allow users to post updates without uploading videos
 * - Build community engagement
 * - Share thoughts, announcements, or images
 * 
 * Used For:
 * - User feed/timeline
 * - Profile posts section
 * - Social interaction between users
 * - Community building
 */
const tweetSchema = new Schema(
    {
        // Tweet text content (what the user wants to say)
        content: {
            type: String,
            required: true,       // Content is mandatory (can't post empty tweet)
            // Can be a caption for image or standalone message
        },

        // User who posted this tweet
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",          // Links to User collection
            // Every tweet has an owner
        },

        // Optional image URL from Cloudinary
        image: {
            type: String,         // Cloudinary URL of uploaded image
            required: false,      // Image is optional - text-only tweets allowed
            // If present, displays image with tweet
        },

        // Total number of likes on this tweet
        likes: {
            type: Number,
            default: 0,           // Starts at 0, incremented when liked
        },
    },
    {
        // Automatically add createdAt and updatedAt timestamps
        timestamps: true
    }
)

// Enable pagination for tweet feeds and user tweet lists
tweetSchema.plugin(mongooseAggregatePaginate)

// Export the Tweet model for use in controllers
export const Tweet = mongoose.model("Tweet", tweetSchema)
