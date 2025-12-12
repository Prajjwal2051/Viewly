import apiClient from "./client"

// Create a new tweet (photo post)
export const createTweet = async (data) => {
    try {
        const formData = new FormData()
        formData.append("content", data.content)
        if (data.image) {
            formData.append("image", data.image)
        }

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
        const response = await apiClient.post(`/likes/tweet/${tweetId}`)
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
