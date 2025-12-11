import apiClient from "./client"

/**
 * TOGGLE VIDEO LIKE
 * Toggles like status for a video
 * Returns: { isLiked: boolean }
 */
export const toggleVideoLike = async (videoId) => {
    const response = await apiClient.post(`/like/video/${videoId}`)
    return response.data
}

/**
 * GET LIKED VIDEOS
 * Fetches all videos liked by the current user
 */
export const getLikedVideos = async () => {
    const response = await apiClient.get("/like/videos")
    return response.data
}

/**
 * GET LIKE STATUS
 * Checks if current user liked a specific video
 */
export const getIsVideoLiked = async (videoId) => {
    const response = await apiClient.get(`/like/status/video/${videoId}`)
    return response.data
}
