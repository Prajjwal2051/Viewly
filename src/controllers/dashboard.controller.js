// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { like } from "../models/like.model.js"
import { video } from "../models/video.model.js"
import { comment } from "../models/comment.model.js"
import mongoose from "mongoose"
import { subscription } from "../models/subscription.model.js"

// ============================================
// CONTROLLER FUNCTIONS
// ============================================

/**
 * GET CHANNEL STATISTICS CONTROLLER
 * Retrieves comprehensive analytics and statistics for a channel
 * 
 * Purpose:
 * - Provide channel owners with detailed performance metrics
 * - Display total counts (videos, views, likes, subscribers, comments)
 * - Show growth trends over time (monthly views and subscribers)
 * - Calculate engagement metrics and performance indicators
 * 
 * Features:
 * - Total statistics (videos, views, likes, subscribers, comments)
 * - Growth metrics by month
 * - 30-day growth comparison with percentage change
 * - Average views per video
 * - Engagement rate calculation
 * - Most popular video identification
 * 
 * Process Flow:
 * 1. Validate channel ID and ownership
 * 2. Calculate total statistics
 * 3. Compute growth metrics
 * 4. Calculate additional performance indicators
 * 5. Return comprehensive dashboard data
 * 
 * @route GET /api/v1/dashboard/stats/:channelId
 * @access Private (only channel owner can view)
 * @param {string} channelId - MongoDB ObjectId of the channel
 * @returns {Object} ApiResponse with comprehensive channel statistics
 */
const getChannelStats = asyncHandler(async (req, res) => {
    // STEP 1: Extract channel ID and authenticated user ID
    const { channelId } = req.params
    const userId = req.user._id

    // STEP 2: Validate user ID exists
    if (!userId) {
        throw new ApiError(400, "User ID not provided")
    }
    
    // STEP 3: Validate user ID format
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID provided")
    }
    
    // STEP 4: Verify channel exists
    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel does not exist")
    }
    
    // STEP 5: Check authorization - only channel owner can view stats
    if (channelId !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to view stats of this channel")
    }

    // ============================================
    // BASIC STATISTICS
    // ============================================
    
    // STEP 6: Count total published videos
    const totalVideos = await video.countDocuments({
        owner: channelId,
        isPublished: true,
    })

    // STEP 7: Calculate total views across all published videos
    // Uses aggregation to sum all view counts
    const totalViewsResult = await video.aggregate([
        // Filter: Only published videos owned by this channel
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId),
                isPublished: true,
            },
        },
        // Group: Sum all views into a single total
        {
            $group: {
                _id: null,                    // Group all documents together
                totalViews: { $sum: "$views" }, // Sum the views field
            },
        },
    ])
    const totalViews = totalViewsResult[0]?.totalViews || 0

    // STEP 8: Calculate total likes across all videos
    // Joins like collection with video collection to filter by channel owner
    const totalLikesResult = await like.aggregate([
        // Lookup: Join likes with videos to get video details
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
            },
        },
        // Unwind: Convert videoDetails array to object
        {
            $unwind: "$videoDetails",
        },
        // Match: Filter for videos owned by this channel
        {
            $match: {
                "videoDetails.owner": new mongoose.Types.ObjectId(channelId),
                likedBy: { $exists: true },
            },
        },
        // Count: Get total number of likes
        {
            $count: "totalLikes",
        },
    ])
    const totalLikes = totalLikesResult[0]?.totalLikes || 0

    // STEP 9: Count total subscribers
    const totalSubscribers = await subscription.countDocuments({
        channel: channelId,
    })

    // ============================================
    // GROWTH METRICS
    // ============================================
    
    // STEP 10: Calculate views growth by month for historical trends
    // Groups videos by month and sums their views
    const viewsGrowth = await video.aggregate([
        // Match: Filter published videos for this channel
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId),
                isPublished: true,
            },
        },
        // Group: Organize by month (YYYY-MM format)
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                totalViews: { $sum: "$views" },     // Total views in that month
                videoCount: { $sum: 1 },            // Count of videos in that month
            },
        },
        // Sort: Order by month chronologically
        {
            $sort: { _id: 1 },
        },
    ])

    // STEP 11: Set up date ranges for 30-day comparison
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    // STEP 12: Calculate views from videos created in last 30 days
    const last30DaysViews = await video.aggregate([
        // Match: Videos created in last 30 days
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId),
                isPublished: true,
                createdAt: { $gte: thirtyDaysAgo },
            },
        },
        // Group: Sum all views together
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
            },
        },
    ])

    // STEP 13: Calculate views from videos created 30-60 days ago
    const previous30DaysViews = await video.aggregate([
        // Match: Videos created between 30-60 days ago
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId),
                isPublished: true,
                createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
            },
        },
        // Group: Sum all views together
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
            },
        },
    ])

    // STEP 14: Calculate percentage change in views
    const currentPeriodViews = last30DaysViews[0]?.totalViews || 0
    const previousPeriodViews = previous30DaysViews[0]?.totalViews || 0
    const viewsGrowthPercentage =
        previousPeriodViews > 0
            ? ((currentPeriodViews - previousPeriodViews) / previousPeriodViews) * 100
            : 0

    // STEP 15: Calculate subscribers growth by month
    // Shows how many new subscribers joined each month
    const subscribersGrowth = await subscription.aggregate([
        // Match: All subscriptions to this channel
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        // Group: Count subscribers by month
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                newSubscribers: { $sum: 1 },  // Count subscriptions in that month
            },
        },
        // Sort: Order by month chronologically
        {
            $sort: { _id: 1 },
        },
    ])

    // STEP 16: Count new subscribers in last 30 days
    const newSubscribersLast30Days = await subscription.countDocuments({
        channel: channelId,
        createdAt: { $gte: thirtyDaysAgo },
    })

    // STEP 17: Count new subscribers in previous 30 days
    const newSubscribersPrevious30Days = await subscription.countDocuments({
        channel: channelId,
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    })

    // STEP 18: Calculate percentage change in subscribers
    const subscriberGrowthPercentage =
        newSubscribersPrevious30Days > 0
            ? ((newSubscribersLast30Days - newSubscribersPrevious30Days) /
                  newSubscribersPrevious30Days) * 100
            : 0

    // ============================================
    // ADDITIONAL METRICS
    // ============================================
    
    // STEP 19: Calculate average views per video
    const averageViewsPerVideo = totalVideos > 0 ? totalViews / totalVideos : 0

    // STEP 20: Calculate engagement rate (likes to views ratio)
    const engagementRate = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0

    // STEP 21: Count total comments on all channel videos
    // Joins comments with videos to filter by channel owner
    const totalCommentsResult = await comment.aggregate([
        // Lookup: Join comments with videos collection
        {
            $lookup: {
                from: "videos",
                localField: "video",          // Comment's video reference
                foreignField: "_id",          // Video's ID
                as: "videoDetails",
            },
        },
        // Unwind: Convert videoDetails array to object
        {
            $unwind: "$videoDetails",
        },
        // Match: Filter for videos owned by this channel
        {
            $match: {
                "videoDetails.owner": new mongoose.Types.ObjectId(channelId),
            },
        },
        // Count: Get total number of comments
        {
            $count: "totalComments",
        },
    ])
    const totalComments = totalCommentsResult[0]?.totalComments || 0

    // STEP 22: Find most popular video by view count
    const mostPopularVideo = await video.findOne({
        owner: channelId,
        isPublished: true,
    })
        .sort({ views: -1 })
        .select("title thumbnail views createdAt")
        .limit(1)

    // STEP 23: Send comprehensive statistics response
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                channelStats: {
                    totalVideos,
                    totalViews,
                    totalLikes,
                    totalSubscribers,
                    totalComments,
                },
                growthMetrics: {
                    viewsGrowth,
                    subscribersGrowth,
                    last30Days: {
                        views: currentPeriodViews,
                        viewsGrowthPercentage: viewsGrowthPercentage.toFixed(2),
                        newSubscribers: newSubscribersLast30Days,
                        subscriberGrowthPercentage: subscriberGrowthPercentage.toFixed(2),
                    },
                },
                additionalMetrics: {
                    averageViewsPerVideo: averageViewsPerVideo.toFixed(2),
                    engagementRate: engagementRate.toFixed(2) + "%",
                    mostPopularVideo,
                },
            },
            "Channel statistics fetched successfully"
        )
    )
})

/**
 * GET CHANNEL VIDEOS CONTROLLER
 * Retrieves paginated list of videos for a specific channel
 * 
 * Purpose:
 * - Display all videos from a channel
 * - Support pagination and sorting options
 * - Show published videos for public viewing
 * - Show all videos (including unpublished) for channel owner
 * 
 * Features:
 * - Pagination (default: 10 videos per page)
 * - Sorting by views, creation date, or likes
 * - Ascending/descending sort order
 * - Privacy filtering (only published videos for non-owners)
 * - Populated owner details
 * 
 * Process Flow:
 * 1. Validate channel ID
 * 2. Parse pagination and sorting parameters
 * 3. Verify channel exists
 * 4. Check ownership for privacy filtering
 * 5. Fetch paginated videos with sorting
 * 6. Return formatted video list
 * 
 * @route GET /api/v1/dashboard/videos/:channelId
 * @access Public (with privacy filtering)
 * @param {string} channelId - MongoDB ObjectId of the channel
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Videos per page (default: 10)
 * @query {string} sortBy - Sort field: views, createdAt, likes (default: createdAt)
 * @query {string} sortOrder - Sort direction: asc or desc (default: desc)
 * @returns {Object} ApiResponse with paginated video list
 */
const getChannelVideos = asyncHandler(async (req, res) => {
    // STEP 1: Extract channel ID from URL parameters
    const { channelId } = req.params
    
    // STEP 2: Extract and parse pagination parameters
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    
    // STEP 3: Extract sorting parameters
    const sortBy = req.query.sortBy || 'createdAt'  // Field to sort by
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1  // Sort direction
    
    // STEP 4: Validate channel ID is provided
    if (!channelId) {
        throw new ApiError(400, "Channel ID not provided")
    }
    
    // STEP 5: Validate channel ID format
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID")
    }
    
    // STEP 6: Verify channel exists in database
    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }
    
    // STEP 7: Check if user is viewing their own channel
    // Owner can see all videos (including unpublished)
    const isOwnChannel = req.user && channelId === req.user._id.toString()
    
    // STEP 8: Build filter object based on ownership
    const filter = { owner: channelId }
    
    // STEP 9: Add privacy filter for non-owners
    // Only show published videos if not the channel owner
    if (!isOwnChannel) {
        filter.isPublished = true
    }
    
    // STEP 10: Create sort object dynamically
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder
    
    // STEP 11: Fetch videos with pagination, sorting, and population
    const videos = await video.find(filter)
        .sort(sortOptions)                    // Apply sorting
        .skip(skip)                            // Skip for pagination
        .limit(limit)                          // Limit results per page
        .select('title description thumbnail duration views createdAt isPublished')
        .populate('owner', 'username fullName avatar')  // Populate owner details
    
    // STEP 12: Get total count for pagination metadata
    const totalVideos = await video.countDocuments(filter)
    const totalPages = Math.ceil(totalVideos / limit)
    
    // STEP 13: Send success response with videos and pagination
    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            pagination: {
                currentPage: page,
                totalPages,
                totalVideos,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        }, "Channel videos fetched successfully")
    )
})


// ============================================
// EXPORT CONTROLLERS
// ============================================
export {
    getChannelStats,
    getChannelVideos
}
