// ============================================
// NOTIFICATION API - NOTIFICATION OPERATIONS
// ============================================
// Handles all notification-related API calls
// Manages user notifications, read status, and deletion

import apiClient from "./client"

/**
 * GET USER NOTIFICATIONS
 * Fetches paginated list of notifications for current user
 * 
 * Purpose:
 * - Retrieve user's notifications (likes, comments, subscriptions, uploads)
 * - Support pagination for performance
 * - Filter by read/unread status
 * 
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Notifications per page (default: 10)
 * @param {boolean} isRead - Filter by read status (undefined = all, true = read only, false = unread only)
 * @returns {Promise<Object>} Response with notifications array and pagination info
 * 
 * Response format:
 * {
 *   data: {
 *     notifications: [...],
 *     pagination: { currentPage, totalPages, totalNotifications },
 *     unreadCount: 5
 *   }
 * }
 */
export const getNotifications = async (page = 1, limit = 10, isRead) => {
    const params = { page, limit }
    if (isRead !== undefined) {
        params.isRead = isRead  // Add filter if specified
    }
    // apiClient automatically unwraps response.data
    return apiClient.get("/notifications", { params })
}

/**
 * MARK NOTIFICATION AS READ
 * Updates a single notification's read status
 * 
 * Purpose:
 * - Mark notification as read when user clicks on it
 * - Update unread count in UI
 * - Track user engagement with notifications
 * 
 * @param {string} notificationId - MongoDB ObjectId of notification
 * @returns {Promise<Object>} Updated notification object
 */
export const markAsRead = async (notificationId) => {
    return apiClient.patch(`/notifications/${notificationId}/read`)
}

/**
 * MARK ALL NOTIFICATIONS AS READ
 * Bulk updates all unread notifications to read status
 * 
 * Purpose:
 * - Clear all unread notifications at once
 * - "Mark all as read" button functionality
 * - Reset notification badge count to 0
 * 
 * @returns {Promise<Object>} Success message with count of updated notifications
 */
export const markAllAsRead = async () => {
    return apiClient.patch("/notifications/read-all")
}

/**
 * DELETE NOTIFICATION
 * Permanently removes a notification from user's list
 * 
 * Purpose:
 * - Allow users to dismiss/remove notifications
 * - Clean up notification list
 * - Remove irrelevant or old notifications
 * 
 * @param {string} notificationId - MongoDB ObjectId of notification to delete
 * @returns {Promise<Object>} Success message confirming deletion
 */
export const deleteNotification = async (notificationId) => {
    return apiClient.delete(`/notifications/${notificationId}`)
}
