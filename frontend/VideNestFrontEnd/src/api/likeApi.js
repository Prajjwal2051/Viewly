// ============================================
// LIKE API - BACKEND LIKE/UNLIKE OPERATIONS
// ============================================
// Handles all like/unlike functionality for videos, tweets, and comments.
// Uses toggle pattern: liking twice removes the like (like/unlike button).

import apiClient from "./client"

/**
 * TOGGLE VIDEO LIKE
 * 
 * Purpose: Like or unlike a video (toggle behavior)
 * - If not liked: Creates a like record
 * - If already liked: Removes the like record
 * 
 * Backend: POST /api/v1/like/video/:videoId
 * 
 * Use Cases:
 * - Video player page like button
 * - Video cards quick-like action
 * 
 * @param {string} videoId - MongoDB ObjectId of the video
 * @returns {Promise<Object>} { isLiked: boolean } - New like status after toggle
 */
export const toggleVideoLike = async (videoId) => {
    const response = await apiClient.post(`/like/video/${videoId}`)
    return response.data
}

/**
 * GET LIKED VIDEOS
 * 
 * Purpose: Fetch all videos the current user has liked
 * 
 * Backend: GET /api/v1/like/videos
 * 
 * Use Cases:
 * - "Liked Videos" page showing user's favorite videos
 * - Profile page showing liked content
 * 
 * Returns: Array of video objects with owner details
 * 
 * @returns {Promise<Object>} { data: { likedVideos: [...] } }
 */
export const getLikedVideos = async () => {
    const response = await apiClient.get("/like/videos")
    return response.data
}

/**
 * GET VIDEO LIKE STATUS
 * 
 * Purpose: Check if current user has liked a specific video
 * 
 * Backend: GET /api/v1/like/status/video/:videoId
 * 
 * Why needed?
 * - Determines initial like button state (filled red heart vs outline)
 * - Called when VideoCard component mounts
 * 
 * Use Cases:
 * - Video player page initial load
 * - Video cards in feed (to show correct heart icon)
 * 
 * @param {string} videoId - MongoDB ObjectId of the video
 * @returns {Promise<Object>} { isLiked: boolean }
 */
export const getIsVideoLiked = async (videoId) => {
    const response = await apiClient.get(`/like/status/video/${videoId}`)
    return response.data
}

/**
 * GET TWEET LIKE STATUS
 * 
 * Purpose: Check if current user has liked a specific tweet
 * 
 * Backend: GET /api/v1/like/status/tweet/:tweetId
 * 
 * Similar to video like status but for photo posts (tweets)
 * 
 * @param {string} tweetId - MongoDB ObjectId of the tweet
 * @returns {Promise<Object>} { isLiked: boolean }
 */
export const getIsTweetLiked = async (tweetId) => {
    const response = await apiClient.get(`/like/status/tweet/${tweetId}`)
    console.log(`[likeApi] getIsTweetLiked response for ${tweetId}:`, response)
    console.log(`[likeApi] response.data:`, response.data)
    return response.data
}

/**
 * TOGGLE TWEET LIKE
 * 
 * Purpose: Like or unlike a tweet (toggle behavior)
 * 
 * Backend: POST /api/v1/like/tweet/:tweetId
 * 
 * Use Cases:
 * - Tweet cards like button
 * - Tweet detail page like action
 * 
 * @param {string} tweetId - MongoDB ObjectId of the tweet
 * @returns {Promise<Object>} { isLiked: boolean } - New like status after toggle
 */
export const toggleTweetLike = async (tweetId) => {
    const response = await apiClient.post(`/like/tweet/${tweetId}`)
    return response.data
}

/**
 * GET LIKED TWEETS
 * 
 * Purpose: Fetch all tweets (photo posts) the current user has liked
 * 
 * Backend: GET /api/v1/like/tweets
 * 
 * Use Cases:
 * - "Liked Tweets" page showing user's favorite photo posts
 * - Profile page showing liked image content
 * 
 * @returns {Promise<Object>} { data: { likedTweets: [...] } }
 */
export const getLikedTweets = async () => {
    const response = await apiClient.get("/like/tweets")
    return response.data
}

/**
 * GET LIKED COMMENTS
 * 
 * Purpose: Fetch all comments the current user has liked
 * 
 * Backend: GET /api/v1/like/comments
 * 
 * Features:
 * - Supports pagination (page, limit parameters)
 * - Returns comments with associated video/tweet context
 * 
 * Use Cases:
 * - "Liked Comments" page showing user's saved helpful comments
 * - Activity feed showing comments user found interesting
 * 
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Comments per page (default: 20)
 * @returns {Promise<Object>} { data: { likedComments: [...], totalPages, currentPage } }
 */
export const getLikedComments = async ({ page = 1, limit = 20 } = {}) => {
    const response = await apiClient.get("/like/comments", {
        params: { page, limit },
    })
    return response.data
}
