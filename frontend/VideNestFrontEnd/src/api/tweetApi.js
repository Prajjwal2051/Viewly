import apiClient from "./client"

// Create a new tweet (photo post)
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

// Get tweets for a specific user
export const getUserTweets = async (userId) => {
    try {
        const response = await apiClient.get(`/tweets/user/${userId}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

// Toggle like on a tweet
export const toggleTweetLike = async (tweetId) => {
    try {
        const response = await apiClient.post(`/like/tweet/${tweetId}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

// Get all tweets (Feed)
export const getAllTweets = async () => {
    try {
        const response = await apiClient.get("/tweets")
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

// Get single tweet by ID
export const getTweetById = async (tweetId) => {
    try {
        const response = await apiClient.get(`/tweets/${tweetId}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

// Update a tweet
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

// Delete a tweet
export const deleteTweet = async (tweetId) => {
    try {
        const response = await apiClient.delete(`/tweets/${tweetId}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}
