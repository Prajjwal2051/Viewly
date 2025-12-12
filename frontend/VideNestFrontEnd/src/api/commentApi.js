import apiClient from "./client"

/**
 * GET VIDEO COMMENTS
 * Fetches paginated comments for a video
 * Params: page, limit
 */
export const getVideoComments = async (videoId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/comments/${videoId}`, {
        params: { page, limit },
    })
    return response.data
}

/**
 * GET TWEET COMMENTS
 * Fetches paginated comments for a tweet
 */
export const getTweetComments = async (tweetId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/comments/t/${tweetId}`, {
        params: { page, limit },
    })
    return response.data
}

/**
 * ADD COMMENT
 * Adds a new comment to a video OR tweet
 * - Pass videoId for video comments
 * - Pass tweetId for tweet comments (and null for videoId)
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
 * Updates an existing comment
 */
export const updateComment = async (commentId, content) => {
    const response = await apiClient.patch(`/comments/${commentId}`, {
        content,
    })
    return response.data
}

/**
 * DELETE COMMENT
 * Deletes a comment
 */
export const deleteComment = async (commentId) => {
    const response = await apiClient.delete(`/comments/${commentId}`)
    return response.data
}
