// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Video } from "../models/video.model.js"

// ============================================
// CONTROLLER FUNCTIONS
// ============================================

/**
 * SEARCH VIDEOS CONTROLLER
 * Advanced video search with filtering, sorting, and pagination
 * 
 * Features:
 * - Full-text search across video content
 * - Filter by category, date range, and duration
 * - Multiple sort options (relevance, views, date, likes)
 * - Pagination support for large result sets
 * - Returns video metadata with owner details
 * 
 * Process:
 * 1. Extract and parse query parameters
 * 2. Build search filter with multiple criteria
 * 3. Apply sorting based on user preference
 * 4. Execute aggregation pipeline with pagination
 * 5. Return paginated results with metadata
 * 
 * @route GET /api/v1/search
 * @access Public
 * @query {string} query - Search text (optional)
 * @query {string} category - Filter by video category (optional)
 * @query {string} startDate - Filter videos from this date (optional)
 * @query {string} endDate - Filter videos until this date (optional)
 * @query {number} minDuration - Minimum video duration in seconds (optional)
 * @query {number} maxDuration - Maximum video duration in seconds (optional)
 * @query {string} sortBy - Sort option: relevance|views|date|likes (default: relevance)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Results per page (default: 10)
 * @returns {Object} ApiResponse with paginated video results and metadata
 */
const searchVideos = asyncHandler(async (req, res) => {
    console.log("\n" + "=".repeat(60));
    console.log(" SEARCH VIDEOS REQUEST");
    console.log("=".repeat(60));

    // STEP 1: Extract search parameters from query string with defaults
    const {
        query = "",
        category,
        startDate,
        endDate,
        minDuration,
        maxDuration,
        sortBy = "relevance",
        page = 1,
        limit = 10,
    } = req.query

    console.log("\n[STEP 1]  Processing Search Parameters");
    console.log("   Search Query:", query || "(none - showing all videos)");
    console.log("   Category:", category || "(all categories)");
    console.log("   Date Range:", startDate || endDate ? `${startDate || 'any'} to ${endDate || 'now'}` : "(all time)");
    console.log("   Duration:", minDuration || maxDuration ? `${minDuration || 0}s to ${maxDuration || '∞'}s` : "(any length)");
    console.log("   Sort By:", sortBy);
    console.log("   Page:", page);
    console.log("   Limit:", limit);

    console.log("\n[STEP 2]  Building Search Filter");
    // STEP 2: Initialize base search filter
    // Only search through published videos for public access
    const searchFilter = {
        isPublished: true,
    }
    console.log("   Base filter: isPublished = true");

    // STEP 3: Add full-text search if query is provided
    // Uses MongoDB text index for efficient text search across title, description, tags
    if (query.trim()) {
        searchFilter.$text = { $search: query }
        console.log("   Added text search for:", `"${query}"`);
    }

    // STEP 4: Add category filter if specified
    // Filters videos by specific category (e.g., "Education", "Entertainment")
    if (category) {
        searchFilter.category = category
        console.log("   Added category filter:", category);
    }

    // STEP 5: Add date range filter if start or end date provided
    // Allows filtering videos created within a specific time period
    if (startDate || endDate) {
        searchFilter.createdAt = {}
        if (startDate) {
            searchFilter.createdAt.$gte = new Date(startDate)
        }
        if (endDate) {
            searchFilter.createdAt.$lte = new Date(endDate)
        }
    }

    // STEP 6: Add duration filter if min or max duration provided
    // Filters videos by length (in seconds)
    if (minDuration || maxDuration) {
        searchFilter.duration = {}
        if (minDuration) {
            searchFilter.duration.$gte = Number(minDuration)
        }
        if (maxDuration) {
            searchFilter.duration.$lte = Number(maxDuration)
        }
    }

    // STEP 7: Determine sort options based on sortBy parameter
    let sortOptions = {}
    switch (sortBy) {
        case "views":
            // Sort by view count (most viewed first)
            sortOptions = { views: -1 }
            break
        case "date":
            // Sort by upload date (newest first)
            sortOptions = { createdAt: -1 }
            break
        case "likes":
            // Sort by like count (most liked first)
            sortOptions = { likes: -1 }
            break
        case "relevance":
        default:
            // Sort by text search relevance score if query exists
            // Otherwise, sort by newest first
            if (query.trim()) {
                sortOptions = { score: { $meta: "textScore" } }
            } else {
                sortOptions = { createdAt: -1 }
            }
            break
    }

    // STEP 8: Build MongoDB aggregation pipeline
    const aggregateQuery = Video.aggregate([
        // Match videos based on search filter
        { $match: searchFilter },

        // Add text search score field if query exists (for relevance sorting)
        ...(query.trim() ? [{ $addFields: { score: { $meta: "textScore" } } }] : []),

        // Apply sorting
        { $sort: sortOptions },

        // Lookup and populate owner (user) details
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        // Only include necessary user fields to reduce response size
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },

        // Convert owner array to single object
        { $unwind: "$owner" },

        // Project final fields to include in response
        {
            $project: {
                videoFile: 1,
                thumbNail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                likes: 1,
                category: 1,
                tags: 1,
                createdAt: 1,
                owner: 1,
                // Include relevance score only if text search was performed
                ...(query.trim() ? { score: 1 } : {})
            }
        }
    ])

    // STEP 9: Configure pagination options
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    // STEP 10: Execute aggregation with pagination
    const videos = await Video.aggregatePaginate(aggregateQuery, options)

    // STEP 11: Send successful response with paginated results and metadata
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos: videos.docs,
                totalResults: videos.totalDocs,
                totalPages: videos.totalPages,
                currentPage: videos.page,
                hasNextPage: videos.hasNextPage,
                hasPrevPage: videos.hasPrevPage
            },
            "Videos fetched successfully"
        )
    )

})

export { searchVideos }
