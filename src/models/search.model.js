// ============================================
// SEARCH MODEL - DATABASE SCHEMA
// ============================================
// Defines the structure for search history documents in MongoDB
// Tracks user search queries for analytics and recommendations

import mongoose, { mongo, Schema } from "mongoose"

/**
 * SEARCH SCHEMA
 * Represents a search query performed by a user
 * 
 * Features:
 * - Track what users are searching for
 * - Store result counts for each search
 * - Timestamp when search was performed
 * - Link searches to specific users
 * 
 * Purpose:
 * - Search history for users ("Recent Searches")
 * - Analytics on popular search terms
 * - Improve search recommendations
 * - Understand user interests and behavior
 * 
 * Used For:
 * - Building "Recent Searches" feature
 * - Generating search suggestions/autocomplete
 * - Analytics dashboard (trending searches)
 * - Improving search algorithm
 * - Personalizing content recommendations
 */
const searchSchema = new mongoose.Schema(
    {
        // The search term/query entered by user
        query: {
            type: String,
            required: true,       // Must have a search term
            trim: true,           // Remove leading/trailing spaces
            // Example: "react tutorial", "funny cats", "cooking recipes"
        },

        // User who performed this search
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",          // Links to User collection
            required: true,       // Every search is linked to a user
        },

        // Number of results found for this search
        resulsCount: {
            type: Number,
            default: 0,           // Stores how many videos matched
            // Note: There's a typo "resulsCount" - should be "resultsCount"
        },

        // Timestamp when search was performed
        searchAt: {
            type: Date,
            default: Date.now,    // Automatically set to current time
            // Used for sorting recent searches
        },
    },
    {
        // Automatically add createdAt and updatedAt timestamps
        timestamps: true
    }
)

/**
 * INDEX FOR SEARCH QUERIES
 * Optimizes queries for:
 * 1. Finding searches by query term (query: 1)
 * 2. Sorting by most recent first (searchAt: -1)
 * 
 * This makes "Recent Searches" and "Popular Searches" queries faster
 */
searchSchema.index({ query: 1, searchAt: -1 })

// Export the Search model for use in controllers
export const Search = mongoose.model("Search", searchSchema)
