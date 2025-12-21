// ============================================
// NOTIFICATION API
// ============================================
// Handles all notification-related API calls

import apiClient from "./client"

/**
 * Get user notifications with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {boolean} params.isRead - Filter by read status (optional)
 * @returns {Promise<Object>} Notifications data with pagination info
 */
export const getNotifications = async (params = {}) => {
    const { page = 1, limit = 10, isRead } = params

    const queryParams = {
        page,
        limit,
    }

    // Only add isRead if explicitly provided
    if (isRead !== undefined) {
        queryParams.isRead = isRead
    }

    const response = await apiClient.get("/notifications", {
        params: queryParams,
    })
    return response.data
}

/**
 * Mark a specific notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificationAsRead = async (notificationId) => {
    const response = await apiClient.patch(
        `/notifications/${notificationId}/read`
    )
    return response.data
}

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Update statistics
 */
export const markAllNotificationsAsRead = async () => {
    const response = await apiClient.patch("/notifications/read-all")
    return response.data
}

/**
 * Delete a specific notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteNotification = async (notificationId) => {
    const response = await apiClient.delete(`/notifications/${notificationId}`)
    return response.data
}
