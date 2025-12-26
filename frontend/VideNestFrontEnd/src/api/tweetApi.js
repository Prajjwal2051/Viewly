// ============================================
// TWEET API - PHOTO POST OPERATIONS
// ============================================
// Handles all tweet (photo post) related API calls.
// "Tweets" in VidNest are image posts with text, similar to Instagram/Twitter posts.

import apiClient from "./client"

/**
 * CREATE TWEET
 * 
 * Purpose: Post a new photo with optional text caption
 * 
 * Backend: POST /api/v1/tweets
 * 
 * File Upload Process:
 * 1. User selects image file from their device
 * 2. Frontend creates FormData object with image + content
 * 3. Multer middleware saves image temporarily to ./public/temp/
 * 4. Cloudinary uploads image to cloud storage
 * 5. Tweet document saved to MongoDB with Cloudinary URL
 * 6. Temporary local file deleted
 * 
 * What is FormData?
 * - Special JavaScript object for sending files over HTTP
 * - Required for file uploads (can't send files as JSON)
 * - Browser automatically sets Content-Type: multipart/form-data
 * 
 * @param {FormData} formData - Contains: image (File), content (string)
 * @returns {Promise<Object>} { data: { tweet: {...} } } - Newly created tweet
 */
export const createTweet = async (formData) => {
    try {
        // formData is already a FormData object from UploadPage
        const response = await apiClient.post("/tweets", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

/**
 * GET USER TWEETS
 * 
 * Purpose: Fetch all tweets posted by a specific user
 * 
 * Backend: GET /api/v1/tweets/user/:userId
 * 
 * Use Cases:
 * - User profile page showing their photo gallery
 * - Filtering feed by specific creator
 * 
 * Returns:
 * - Array of tweets sorted by newest first
 * - Each tweet includes: image URL, content, likes, comments count
 * 
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {Promise<Object>} { data: { tweets: [...] } }
 */
export const getUserTweets = async (userId) => {
    try {
        const response = await apiClient.get(`/tweets/user/${userId}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

/**
 * TOGGLE TWEET LIKE
 * 
 * Purpose: Like or unlike a tweet (toggle behavior)
 * 
 * Backend: POST /api/v1/like/tweet/:tweetId
 * 
 * Note: This function exists for convenience but duplicates likeApi.toggleTweetLike
 * Consider importing from likeApi instead to avoid duplication
 * 
 * @param {string} tweetId - MongoDB ObjectId of the tweet
 * @returns {Promise<Object>} { isLiked: boolean }
 */
export const toggleTweetLike = async (tweetId) => {
    try {
        const response = await apiClient.post(`/like/tweet/${tweetId}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

/**
 * GET ALL TWEETS
 * 
 * Purpose: Fetch public feed of all tweets (photo posts)
 * 
 * Backend: GET /api/v1/tweets
 * 
 * Features:
 * - Shows tweets from all users (public feed)
 * - Sorted by newest first (chronological timeline)
 * - Includes user details (username, avatar)
 * 
 * Use Cases:
 * - Home page mixed feed (videos + tweets)
 * - Discover page photo gallery
 * 
 * @returns {Promise<Object>} { data: { tweets: [...] } }
 */
export const getAllTweets = async () => {
    try {
        const response = await apiClient.get("/tweets")
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

/**
 * GET TWEET BY ID
 * 
 * Purpose: Fetch detailed view of a single tweet
 * 
 * Backend: GET /api/v1/tweets/:tweetId
 * 
 * Returns:
 * - Tweet details (image, content, timestamp)
 * - Owner information (username, avatar)
 * - Like and comment counts
 * 
 * Use Cases:
 * - Tweet detail page (when clicking on a tweet)
 * - Direct tweet links (sharing feature)
 * - Viewing comments on a specific tweet
 * 
 * @param {string} tweetId - MongoDB ObjectId of the tweet
 * @returns {Promise<Object>} { data: { tweet: {...} } }
 */
export const getTweetById = async (tweetId) => {
    try {
        const response = await apiClient.get(`/tweets/${tweetId}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

/**
 * UPDATE TWEET
 * 
 * Purpose: Edit tweet content (text caption only, not image)
 * 
 * Backend: PATCH /api/v1/tweets/:tweetId
 * 
 * Limitations:
 * - Can only update text content, NOT the image
 * - Image is permanent once uploaded (by design)
 * - Only tweet owner can update (verified in backend)
 * 
 * @param {string} tweetId - MongoDB ObjectId of the tweet
 * @param {string} content - Updated tweet text content
 * @returns {Promise<Object>} { data: { tweet: {...} } } - Updated tweet
 */
export const updateTweet = async (tweetId, content) => {
    try {
        const response = await apiClient.patch(`/tweets/${tweetId}`, {
            content,
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

/**
 * DELETE TWEET
 * 
 * Purpose: Permanently remove a tweet and its image from cloud storage
 * 
 * Backend: DELETE /api/v1/tweets/:tweetId
 * 
 * Deletion Process:
 * 1. Backend verifies user owns the tweet
 * 2. Deletes image from Cloudinary
 * 3. Removes tweet document from MongoDB
 * 4. Cascade deletes: All likes and comments on tweet are also removed
 * 
 * Security:
 * - Only tweet owner can delete (enforced in backend)
 * 
 * @param {string} tweetId - MongoDB ObjectId of the tweet
 * @returns {Promise<Object>} { success: true, message: "Tweet deleted" }
 */
export const deleteTweet = async (tweetId) => {
    try {
        const response = await apiClient.delete(`/tweets/${tweetId}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}
