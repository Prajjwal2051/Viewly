// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { notification } from "../models/notofication.model.js"
import mongoose from "mongoose"
import { User } from "../models/user.model.js"

// ============================================
// CONTROLLER FUNCTIONS
// ============================================

/**
 * GET NOTIFICATIONS CONTROLLER
 * Retrieves paginated list of notifications for authenticated user
 *
 * Purpose:
 * - Display user's notifications (likes, comments, subscriptions, video uploads)
 * - Support filtering by read/unread status
 * - Provide pagination for better performance
 * - Show unread notification count for badges
 *
 * Features:
 * - Pagination (default: 10 notifications per page)
 * - Filter by read/unread status
 * - Sorted by most recent first
 * - Populates sender, video, and comment details
 * - Returns total unread count
 *
 * Process Flow:
 * 1. Extract and validate user ID
 * 2. Parse pagination and filter parameters
 * 3. Build filter object for query
 * 4. Fetch paginated notifications
 * 5. Calculate total counts and pagination metadata
 * 6. Return formatted response
 *
 * @route GET /api/v1/notifications
 * @access Private (requires authentication)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 10)
 * @query {boolean} isRead - Filter by read status (optional)
 * @returns {Object} ApiResponse with notifications and metadata
 */
const getNotifications = asyncHandler(async (req, res) => {
    // STEP 1: Extract authenticated user ID
    const userId = req.user._id

    // STEP 2: Validate user ID exists
    // Should always pass due to auth middleware, but we verify for safety
    if (!userId) {
        throw new ApiError(400, "User ID not provided")
    }

    // STEP 3: Validate user ID format
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID provided")
    }

    // STEP 4: Verify user exists in database
    const userExist = await User.findById(userId)
    if (!userExist) {
        throw new ApiError(404, "User not found")
    }

    // STEP 5: Extract and parse pagination parameters
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // STEP 6: Build filter object for notifications query
    // Base filter: all notifications for this user
    const filter = {
        recepient: userId,
    }

    // STEP 7: Add read/unread filter if provided
    // Allows filtering: ?isRead=true or ?isRead=false
    if (req.query.isRead !== undefined) {
        filter.isRead = req.query.isRead === "true"
    }

    // STEP 8: Fetch paginated notifications with populated details
    // Populates sender info, video details, and comment content
    const notifications = await notification
        .find(filter)
        .sort({ createdAt: -1 }) // Most recent first
        .skip(skip)
        .limit(limit)
        .populate("sender", "username fullName avatar") // Sender details
        .populate("video", "title thumbnail duration") // Video details
        .populate("comment", "content createdAt") // Comment details

    // STEP 9: Get total notification count for pagination
    const totalNotifications = await notification.countDocuments(filter)

    // STEP 10: Get unread notification count for badge display
    const unreadCount = await notification.countDocuments({
        recepient: userId,
        isRead: false,
    })

    // STEP 11: Calculate total pages
    const totalPages = Math.ceil(totalNotifications / limit)

    // STEP 12: Send success response with notifications and metadata
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                notifications,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalNotifications,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
                unreadCount,
            },
            "Notifications fetched successfully"
        )
    )
})

// ============================================
// EXPORT CONTROLLERS
// ============================================
export { getNotifications }
