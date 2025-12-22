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

/**
 * GET TWEET LIKE STATUS
 * Checks if current user liked a specific tweet
 */
export const getIsTweetLiked = async (tweetId) => {
    const response = await apiClient.get(`/like/status/tweet/${tweetId}`)
    console.log(`[likeApi] getIsTweetLiked response for ${tweetId}:`, response)
    console.log(`[likeApi] response.data:`, response.data)
    return response.data
}

/**
 * TOGGLE TWEET LIKE
 * Toggles like status for a tweet
 * Returns: { isLiked: boolean }
 */
export const toggleTweetLike = async (tweetId) => {
    const response = await apiClient.post(`/like/tweet/${tweetId}`)
    return response.data
}

/**
 * GET LIKED TWEETS
 * Fetches all tweets liked by the current user
 */
export const getLikedTweets = async () => {
    const response = await apiClient.get("/like/tweets")
    return response.data
}

/**
 * GET LIKED COMMENTS
 * Fetches all comments liked by the current user
 * Supports pagination with page and limit parameters
 */
export const getLikedComments = async ({ page = 1, limit = 20 } = {}) => {
    const response = await apiClient.get("/like/comments", {
        params: { page, limit },
    })
    return response.data
}
