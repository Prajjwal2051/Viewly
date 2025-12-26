// ============================================
// SUBSCRIPTION API - CHANNEL SUBSCRIPTION OPERATIONS
// ============================================
// Handles all subscription-related API calls (subscribe/unsubscribe to channels).
// Subscriptions allow users to follow their favorite creators and get updates.

import apiClient from "./client"

/**
 * TOGGLE SUBSCRIPTION
 * 
 * Purpose: Subscribe or unsubscribe from a channel (toggle behavior)
 * - If not subscribed: Creates subscription record
 * - If already subscribed: Removes subscription record
 * 
 * Backend: POST /api/v1/subscription/c/:channelId
 * 
 * What happens when you subscribe?
 * - Creator's subscriber count increases
 * - Subscribed channel appears in your "Subscriptions" list
 * - You see notifications when creator posts new videos
 * 
 * Use Cases:
 * - Channel page "Subscribe" button
 * - Video player page quick-subscribe action
 * 
 * @param {string} channelId - MongoDB ObjectId of the channel (user) to subscribe to
 * @returns {Promise<Object>} { subscribed: boolean } - New subscription status after toggle
 */
export const toggleSubscription = async (channelId) => {
    console.log("🔄 Toggling subscription for channel:", channelId)
    const response = await apiClient.post(`/subscription/c/${channelId}`)
    console.log("✅ Toggle subscription response:", response.data)
    return response.data
}

/**
 * GET SUBSCRIBED CHANNELS
 * 
 * Purpose: Fetch list of all channels the current user is subscribed to
 * 
 * Backend: GET /api/v1/subscription/subscribed
 * 
 * Important: Route naming can be confusing
 * - /subscription/subscribed → Who YOU are subscribed to (channels you follow)
 * - /subscription/c/:channelId/subscribers → Who is subscribed TO you (your fans)
 * 
 * Use Cases:
 * - "Subscriptions" page showing channels you follow
 * - Subscription feed showing latest videos from subscribed channels
 * - Checking subscription status for "Subscribe" button
 * 
 * Returns:
 * - Array of channel objects with user details
 * - Each includes: username, avatar, subscriber count
 * 
 * @param {string} subscriberId - Not used (endpoint uses current logged-in user)
 * @returns {Promise<Object>} { data: { subscribedChannels: [...] } }
 */
export const getSubscribedChannels = async (subscriberId) => {
    // Note: The backend route is /subscription/c/:channelId/subscribers to get who SUBSCRIBED to a channel.
    // To get who a user IS SUBSCRIBED TO, the route is /subscription/subscribed
    const response = await apiClient.get("/subscription/subscribed")
    return response.data
}

/**
 * GET SUBSCRIBERS
 * 
 * Purpose: Fetch list of users who are subscribed to a specific channel
 * 
 * Backend: GET /api/v1/subscription/c/:channelId/subscribers
 * 
 * Use Cases:
 * - Channel owner viewing their subscriber list
 * - "Subscribers" page showing who follows the channel
 * - Display subscriber count on channel page
 * 
 * Returns:
 * - Array of subscriber objects (users who subscribed)
 * - Each includes: username, avatar, subscription date
 * 
 * @param {string} channelId - MongoDB ObjectId of the channel
 * @returns {Promise<Object>} { data: { subscribers: [...] } }
 */
export const getUserChannelSubscribers = async (channelId) => {
    const response = await apiClient.get(
        `/subscription/c/${channelId}/subscribers`
    )
    return response.data
}

/**
 * GET SUBSCRIPTION STATUS
 * 
 * Purpose: Check if current user is subscribed to a specific channel
 * 
 * Why no dedicated endpoint?
 * - Backend doesn't have GET /subscription/status/:channelId
 * - Instead, we fetch all subscribed channels and search for the target channel
 * - This is less efficient but works for now
 * 
 * How it works:
 * 1. Fetch all channels the user is subscribed to
 * 2. Loop through list and check if channelId matches
 * 3. Return true if found, false otherwise
 * 
 * Use Cases:
 * - Determining initial "Subscribe" button state (subscribed vs unsubscribed)
 * - Video player page showing correct subscribe button color
 * 
 * Future Optimization:
 * - Add backend route: GET /api/v1/subscription/status/:channelId
 * - Would avoid fetching entire subscription list just to check one channel
 * 
 * @param {string} channelId - MongoDB ObjectId of the channel to check
 * @returns {Promise<Object>} { isSubscribed: boolean }
 */
export const getSubscriptionStatus = async (channelId) => {
    try {
        console.log("🔍 Checking subscription status for channel:", channelId)

        // Fetch all subscribed channels
        const response = await getSubscribedChannels()
        console.log("📦 Full subscription response:", response)

        // API returns: { data: { data: { subscribedChannels: [...] } } }
        const data = response.data || response
        const subscribedChannels =
            data.data?.subscribedChannels || data.subscribedChannels || []
        console.log("📋 Subscribed channels count:", subscribedChannels.length)
        if (subscribedChannels.length > 0) {
            console.log("📋 First channel example:", subscribedChannels[0])
        }

        // Check if channelId exists in the list
        const isSubscribed = subscribedChannels.some((sub) => {
            const subChannelId =
                sub.subscribedChannelDetails?._id ||
                sub.channel?._id ||
                sub.channel
            // Compare as strings to handle ObjectId vs string
            return String(subChannelId) === String(channelId)
        })

        console.log(`✅ Subscription status for ${channelId}:`, isSubscribed)
        return { isSubscribed }
    } catch (error) {
        console.error("❌ Error checking subscription status:", error)
        return { isSubscribed: false }
    }
}
