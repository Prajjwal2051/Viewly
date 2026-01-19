// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Notification } from "../models/notofication.model.js"
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
    console.log("\n" + "=".repeat(60));
    console.log(" GET NOTIFICATIONS REQUEST");
    console.log("=".repeat(60));

    // STEP 1: Extract authenticated user ID
    const userId = req.user._id

    console.log("\n[STEP 1]  Extracting Request Data");
    console.log("   User ID:", userId);
    console.log("   User:", req.user?.username);
    console.log("   Page:", req.query.page || 1);
    console.log("   Limit:", req.query.limit || 10);
    console.log("   Filter:", req.query.isRead !== undefined ? (req.query.isRead === 'true' ? 'Read only' : 'Unread only') : 'All notifications');

    console.log("\n[STEP 2] Validating User ID");
    // STEP 2: Validate user ID exists
    // Should always pass due to auth middleware, but we verify for safety
    if (!userId) {
        console.log("   User ID not provided");
        throw new ApiError(400, "User ID not provided")
    }
    console.log("   User ID exists");

    // STEP 3: Validate user ID format
    if (!mongoose.isValidObjectId(userId)) {
        console.log("   Invalid MongoDB ObjectId format");
        throw new ApiError(400, "Invalid User ID provided")
    }
    console.log("   User ID format is valid");

    console.log("\n[STEP 3]  Verifying User Exists");
    // STEP 4: Verify user exists in database
    const userExist = await User.findById(userId)
    if (!userExist) {
        console.log("   User not found in database");
        throw new ApiError(404, "User not found")
    }
    console.log("   User found:", userExist.username);

    console.log("\n[STEP 4]  Calculating Pagination");
    // STEP 5: Extract and parse pagination parameters
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    console.log("   Skip:", skip, "notifications");
    console.log("   Limit:", limit, "per page");

    console.log("\n[STEP 5]  Building Filter Criteria");
    // STEP 6: Build filter object for notifications query
    // Base filter: all notifications for this user
    const filter = {
        recepient: userId,
    }
    console.log("   Base filter: recipient =", userId);

    // STEP 7: Add read/unread filter if provided
    // Allows filtering: ?isRead=true or ?isRead=false
    if (req.query.isRead !== undefined) {
        filter.isRead = req.query.isRead === "true"
        console.log("   Added read filter:", filter.isRead ? "Read only" : "Unread only");
    }

    console.log("\n[STEP 6]  Fetching Notifications from Database...");

    // STEP 8: Fetch paginated notifications with populated details
    // Populates sender info, video details, and comment content
    const notifications = await Notification
        .find(filter)
        .sort({ createdAt: -1 }) // Most recent first
        .skip(skip)
        .limit(limit)
        .populate("sender", "username fullName avatar") // Sender details
        .populate("video", "title thumbnail duration") // Video details
        .populate("comment", "content createdAt") // Comment details

    // STEP 9: Get total notification count for pagination
    const totalNotifications = await Notification.countDocuments(filter)

    // STEP 10: Get unread notification count for badge display
    const unreadCount = await Notification.countDocuments({
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

/**
 * MARK NOTIFICATION AS READ CONTROLLER
 * Marks a specific notification as read for the authenticated user
 *
 * Purpose:
 * - Update notification status from unread to read
 * - Track when notification was read
 * - Enforce privacy (users can only mark their own notifications)
 *
 * Process Flow:
 * 1. Validate notification ID and user ID
 * 2. Verify notification exists
 * 3. Check user ownership
 * 4. Check if already read
 * 5. Update notification status
 * 6. Return updated notification
 *
 * @route PATCH /api/v1/notifications/:notificationId/read
 * @access Private (requires authentication)
 * @param {string} notificationId - MongoDB ObjectId of the notification
 * @returns {Object} ApiResponse with updated notification
 */
const markAsRead = asyncHandler(async (req, res) => {
    // STEP 1: Extract notification ID and user ID
    const { notificationId } = req.params
    const userId = req.user._id

    // STEP 2: Validate notification ID is provided
    if (!notificationId) {
        throw new ApiError(400, "Notification ID not provided")
    }

    // STEP 3: Validate user ID exists
    if (!userId) {
        throw new ApiError(400, "User ID not provided")
    }

    // STEP 4: Validate notification ID format
    if (!mongoose.isValidObjectId(notificationId)) {
        throw new ApiError(400, "Invalid Notification ID")
    }

    // STEP 5: Validate user ID format
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID provided")
    }

    // STEP 6: Fetch and verify notification exists
    const existingNotification = await Notification.findById(notificationId)
    if (!existingNotification) {
        throw new ApiError(404, "Notification does not exist")
    }

    // STEP 7: Check ownership - only recipient can mark as read
    if (existingNotification.recepient.toString() !== userId.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to access this notification"
        )
    }

    // STEP 8: Check if notification is already marked as read
    if (existingNotification.isRead === true) {
        throw new ApiError(400, "Notification already marked as read")
    }

    // STEP 9: Update notification to mark as read with timestamp
    const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        {
            isRead: true,
            readAt: new Date(), // Track when it was read
        },
        {
            new: true, // Return updated document
        }
    )

    // STEP 10: Verify update was successful
    if (!updatedNotification) {
        throw new ApiError(500, "Failed to mark notification as read")
    }

    // STEP 11: Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedNotification,
                "Notification marked as read successfully"
            )
        )
})

/**
 * MARK ALL AS READ CONTROLLER
 * Marks all unread notifications as read for the authenticated user
 *
 * Purpose:
 * - Bulk update all unread notifications to read status
 * - Provide "Mark all as read" functionality
 * - Track when notifications were read
 * - Return count of updated notifications
 *
 * Process Flow:
 * 1. Validate user ID
 * 2. Build filter for unread notifications
 * 3. Update all matching notifications
 * 4. Verify update success
 * 5. Return count of updated notifications
 *
 * @route PATCH /api/v1/notifications/read-all
 * @access Private (requires authentication)
 * @returns {Object} ApiResponse with update statistics
 */
const markAllAsRead = asyncHandler(async (req, res) => {
    // STEP 1: Extract authenticated user ID
    const userId = req.user._id

    // STEP 2: Validate user ID exists
    if (!userId) {
        throw new ApiError(400, "User ID not provided")
    }

    // STEP 3: Validate user ID format
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID provided")
    }

    // STEP 4: Build filter for unread notifications only
    // Only updates notifications that are currently unread
    const filter = {
        recepient: userId,
        isRead: false,
    }

    // STEP 5: Update all unread notifications to read status
    // Uses updateMany to bulk update all matching documents
    const result = await Notification.updateMany(filter, {
        $set: {
            isRead: true,
            readAt: new Date(), // Track when they were read
        },
    })

    // STEP 6: Verify operation was acknowledged by database
    if (!result.acknowledged) {
        throw new ApiError(500, "Failed to mark all notifications as read")
    }

    // STEP 7: Check if any notifications were found and updated
    if (result.modifiedCount === 0) {
        throw new ApiError(404, "No unread notifications found")
    }

    // STEP 8: Build response with update statistics
    const updateStats = {
        matchedCount: result.matchedCount, // Number of notifications found
        modifiedCount: result.modifiedCount, // Number of notifications updated
    }

    // STEP 9: Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updateStats,
                "All notifications marked as read successfully"
            )
        )
})

/**
 * DELETE NOTIFICATION CONTROLLER
 * Permanently deletes a specific notification for the authenticated user
 * 
 * Purpose:
 * - Allow users to remove individual notifications
 * - Clean up notification list
 * - Enforce ownership permissions
 * 
 * Process Flow:
 * 1. Validate notification ID
 * 2. Verify notification exists
 * 3. Check user ownership
 * 4. Delete notification from database
 * 5. Return success confirmation
 * 
 * @route DELETE /api/v1/notifications/:notificationId
 * @access Private (requires authentication)
 * @param {string} notificationId - MongoDB ObjectId of the notification
 * @returns {Object} ApiResponse with deletion confirmation
 */
const deleteNotification = asyncHandler(async (req, res) => {
    // STEP 1: Extract notification ID and user ID
    const { notificationId } = req.params
    const userId = req.user._id

    // STEP 2: Validate notification ID is provided
    if (!notificationId) {
        throw new ApiError(400, "Notification ID not provided")
    }

    // STEP 3: Validate notification ID format
    if (!mongoose.isValidObjectId(notificationId)) {
        throw new ApiError(400, "Invalid Notification ID")
    }

    // STEP 4: Fetch and verify notification exists
    const existingNotification = await Notification.findById(notificationId)
    if (!existingNotification) {
        throw new ApiError(404, "Notification not found")
    }

    // STEP 5: Check ownership - only recipient can delete their notification
    if (existingNotification.recepient.toString() !== userId.toString()) {
        throw new ApiError(403, "You don't have permission to delete this notification")
    }

    // STEP 6: Delete the notification from database
    await Notification.findByIdAndDelete(notificationId)

    // STEP 7: Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { deletedNotificationId: notificationId },
                "Notification deleted successfully"
            )
        )
})

// ============================================
// EXPORT CONTROLLERS
// ============================================
export {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
}
