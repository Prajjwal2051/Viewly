// ============================================
// COMMENT API - BACKEND COMMENT OPERATIONS
// ============================================
// Handles all comment-related API calls for videos and tweets.
// Comments enable users to engage with content through text discussions.

import apiClient from "./client"

/**
 * GET VIDEO COMMENTS
 *
 * Purpose: Fetch paginated list of comments for a specific video
 *
 * Backend: GET /api/v1/comments/:videoId
 *
 * Features:
 * - Returns comments sorted by newest first
 * - Includes commenter details (username, avatar)
 * - Pagination support to handle videos with 1000+ comments
 *
 * Use Cases:
 * - Video player page comment section
 * - Displaying discussion thread below video
 *
 * @param {string} videoId - MongoDB ObjectId of the video
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Comments per page (default: 10)
 * @returns {Promise<Object>} { comments: [...], totalComments, currentPage, totalPages }
 */
export const getVideoComments = async (videoId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/comments/${videoId}`, {
        params: { page, limit },
    })
    return response.data
}

/**
 * GET TWEET COMMENTS
 *
 * Purpose: Fetch paginated list of comments for a specific tweet (photo post)
 *
 * Backend: GET /api/v1/comments/t/:tweetId
 *
 * Similar to video comments but for image posts
 * Note the different endpoint pattern: /comments/t/:tweetId vs /comments/:videoId
 *
 * @param {string} tweetId - MongoDB ObjectId of the tweet
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Comments per page (default: 10)
 * @returns {Promise<Object>} { comments: [...], totalComments, currentPage, totalPages }
 */
export const getTweetComments = async (tweetId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/comments/t/${tweetId}`, {
        params: { page, limit },
    })
    return response.data
}

/**
 * ADD COMMENT
 *
 * Purpose: Create a new comment on either a video or tweet
 *
 * Backend: POST /api/v1/comments
 *
 * How it works:
 * - For video comments: Pass videoId, tweetId stays null
 * - For tweet comments: Pass tweetId, videoId stays null
 * - Backend validates that exactly ONE of these IDs is provided
 *
 * Process:
 * 1. User types comment in CommentSection component
 * 2. This function sends comment text + target ID to backend
 * 3. Backend creates Comment document with reference to video/tweet
 * 4. New comment appears in comment list instantly
 *
 * @param {string} content - Comment text (max 500 characters)
 * @param {string} videoId - MongoDB ObjectId of video (null for tweets)
 * @param {string} tweetId - MongoDB ObjectId of tweet (null for videos)
 * @returns {Promise<Object>} { data: { comment: {...} } } - Newly created comment
 */
export const addComment = async (content, videoId, tweetId = null) => {
    const payload = { content }
    if (videoId) payload.videoId = videoId
    if (tweetId) payload.tweetId = tweetId

    const response = await apiClient.post("/comments", payload)
    return response.data
}

/**
 * UPDATE COMMENT
 *
 * Purpose: Edit an existing comment's text content
 *
 * Backend: PATCH /api/v1/comments/:commentId
 *
 * Security:
 * - Only comment owner can update their comment (verified in backend)
 * - Shows "Edited" badge after update
 *
 * Use Cases:
 * - User wants to fix typo in their comment
 * - User wants to add additional context to comment
 *
 * @param {string} commentId - MongoDB ObjectId of the comment
 * @param {string} content - Updated comment text
 * @returns {Promise<Object>} { data: { comment: {...} } } - Updated comment
 */
export const updateComment = async (commentId, content) => {
    const response = await apiClient.patch(`/comments/${commentId}`, {
        content,
    })
    return response.data
}

/**
 * DELETE COMMENT
 *
 * Purpose: Permanently remove a comment
 *
 * Backend: DELETE /api/v1/comments/:commentId
 *
 * Security:
 * - Only comment owner or video/tweet owner can delete
 * - Cascade delete: Likes on the comment are also removed
 *
 * Use Cases:
 * - User regrets posting a comment
 * - Content owner wants to remove spam/offensive comments
 *
 * @param {string} commentId - MongoDB ObjectId of the comment
 * @returns {Promise<Object>} { success: true, message: "Comment deleted" }
 */
export const deleteComment = async (commentId) => {
    const response = await apiClient.delete(`/comments/${commentId}`)
    return response.data
}

/**
 * GET USER COMMENTS
 *
 * Purpose: Fetch all comments made by the authenticated user
 *
 * Backend: GET /api/v1/comments/user/me
 *
 * Features:
 * - Returns comments across videos and tweets
 * - Includes video/tweet context for each comment
 * - Paginated results
 *
 * Use Cases:
 * - Dashboard "My Comments" tab
 * - User comment history
 *
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Comments per page (default: 20)
 * @returns {Promise<Object>} { comments: [...], currentPage, totalPages, totalComments }
 */
export const getUserComments = async (page = 1, limit = 20) => {
    const response = await apiClient.get("/comments/user/me", {
        params: { page, limit },
    })
    return response.data
}
