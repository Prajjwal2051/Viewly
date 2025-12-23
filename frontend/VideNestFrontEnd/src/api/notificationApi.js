import apiClient from "./client"

// Get user notifications
export const getNotifications = async (page = 1, limit = 10, isRead) => {
    const params = { page, limit }
    if (isRead !== undefined) {
        params.isRead = isRead
    }
    // apiClient unwraps response.data, so we just return the result
    return apiClient.get("/notifications", { params })
}

// Mark a single notification as read
export const markAsRead = async (notificationId) => {
    return apiClient.patch(`/notifications/${notificationId}/read`)
}

// Mark all notifications as read
export const markAllAsRead = async () => {
    return apiClient.patch("/notifications/read-all")
}

// Delete a notification
export const deleteNotification = async (notificationId) => {
    return apiClient.delete(`/notifications/${notificationId}`)
}
