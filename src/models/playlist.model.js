// ============================================
// PLAYLIST MODEL - DATABASE SCHEMA
// ============================================
// Defines the structure for playlist documents in MongoDB
// Allows users to organize videos into custom collections

import { mongoose, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

/**
 * PLAYLIST SCHEMA
 * Represents a user-created playlist of videos
 * 
 * Features:
 * - Custom playlist names and descriptions
 * - Collection of videos (array of video IDs)
 * - Public/private visibility control
 * - Ownership tracking
 * 
 * Use Cases:
 * - "Watch Later" playlists
 * - Topic-based collections ("React Tutorials", "Music Videos")
 * - Curated content for sharing
 * - Course/series organization
 * 
 * Used For:
 * - Content organization
 * - Video bookmarking
 * - Sharing collections with others
 * - Building series or courses
 */
const playlistSchema = new mongoose.Schema({
  // Playlist name (e.g., "Watch Later", "Favorites")
  name: {
    type: String,
    required: true,           // Name is mandatory
    trim: true                // Remove leading/trailing spaces
  },

  // Playlist description (optional explanation of playlist purpose)
  description: {
    type: String,
    trim: true                // Optional field
  },

  // Array of video IDs in this playlist
  videos: [{
    type: Schema.Types.ObjectId,
    ref: 'Video'              // Each item links to Video collection
    // Array can be empty (new playlist) or contain multiple videos
  }],

  // User who created this playlist
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',              // Links to User collection
    required: true            // Every playlist must have an owner
  },

  // Visibility control (public vs private)
  isPublic: {
    type: Boolean,
    default: true             // Playlists are public by default
    // false = only owner can view/access
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
})

// Enable pagination for playlist queries (user's playlists, etc.)
playlistSchema.plugin(mongooseAggregatePaginate);

// Export the Playlist model for use in controllers
export const Playlist = mongoose.model("Playlist", playlistSchema)