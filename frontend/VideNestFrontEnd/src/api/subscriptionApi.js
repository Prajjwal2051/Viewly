import apiClient from "./client"

/**
 * TOGGLE SUBSCRIPTION
 * Toggles subscription status for a channel
 * Returns: { subscribed: boolean }
 */
export const toggleSubscription = async (channelId) => {
    console.log("🔄 Toggling subscription for channel:", channelId)
    const response = await apiClient.post(`/subscription/c/${channelId}`)
    console.log("✅ Toggle subscription response:", response.data)
    return response.data
}

/**
 * GET SUBSCRIBED CHANNELS
 * Fetches list of channels the current user is subscribed to
 */
export const getSubscribedChannels = async (subscriberId) => {
    // Note: The backend route is /subscription/c/:channelId/subscribers to get who SUBSCRIBED to a channel.
    // To get who a user IS SUBSCRIBED TO, the route is /subscription/subscribed
    const response = await apiClient.get("/subscription/subscribed")
    return response.data
}

/**
 * GET SUBSCRIBERS
 * Fetches list of users who subscribed to a channel
 */
export const getUserChannelSubscribers = async (channelId) => {
    const response = await apiClient.get(
        `/subscription/c/${channelId}/subscribers`
    )
    return response.data
}

/**
 * GET SUBSCRIPTION STATUS
 * Checks if current user is subscribed to a specific channel
 * Note: There's no dedicated status endpoint, so we check if the channel
 * exists in the user's subscribed channels list
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
