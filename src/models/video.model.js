// ============================================
// VIDEO MODEL - DATABASE SCHEMA
// ============================================
// Defines the structure for video documents in MongoDB
// Stores video metadata, file URLs, analytics, and relationships

import mongoose, { mongo, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

/**
 * VIDEO SCHEMA
 * Represents a video uploaded to the platform
 * 
 * Features:
 * - Video file storage (Cloudinary URL)
 * - Thumbnail and metadata (title, description, duration)
 * - Analytics (views, likes, dislikes)
 * - Categorization (category, tags for search/filter)
 * - Publishing control (public/draft videos)
 * - Ownership tracking (relationship to User model)
 * 
 * Used For:
 * - Storing uploaded video information
 * - Video discovery and search
 * - Analytics and statistics
 * - User content management
 */
const videoSchema = new mongoose.Schema({
    // Video file URL from Cloudinary storage
    videoFile: {
        type: String,
        require: true,        // Every video must have a file
        unique: true,         // No duplicate video URLs
        index: true           // Fast lookups by video URL
    },

    // Thumbnail image URL (preview image for video)
    thumbNail: {
        type: String,         // Optional - auto-generated if not provided
    },

    // Reference to the user who uploaded this video
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"          // Links to User collection
    },

    // Video title (displayed in listings and player)
    title: {
        type: String,
        require: true,        // Title is mandatory
    },

    // Video description (detailed information about video)
    description: {
        type: String,         // Optional - can be empty
    },

    // Video length in seconds (calculated during upload)
    duration: {
        type: Number,         // Stored as seconds (e.g., 125 = 2:05)
    },

    // Total number of times video has been watched
    views: {
        type: Number,
        default: 0            // Starts at 0, incremented on each view
    },

    // Publishing status (public vs draft)
    isPublished: {
        type: Boolean,
        require: true,
        default: true         // Videos are public by default
    },

    // Tags for search and discovery (comma-separated)
    tags: {
        type: String,
        index: true           // Indexed for fast tag-based searches
    },

    // Video category (e.g., "Education", "Entertainment", "Music")
    category: {
        type: String,
        required: true,       // Every video must have a category
        index: true           // Indexed for category filtering
    },

    // Total likes count (for sorting popular videos)
    likes: {
        type: Number,
        default: 0
    },

    // Total dislikes count (optional feedback metric)
    dislikes: {
        type: Number,
        default: 0
    }

}, {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
})

// Enable pagination support for aggregation queries
// Allows paginated video listings with filters and sorting
videoSchema.plugin(mongooseAggregatePaginate)

// Export the Video model for use in controllers
export const Video = mongoose.model("Video", videoSchema)
