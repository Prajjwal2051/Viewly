import apiClient from "./client"

/**
 * TOGGLE SUBSCRIPTION
 * Toggles subscription status for a channel
 * Returns: { subscribed: boolean }
 */
export const toggleSubscription = async (channelId) => {
    const response = await apiClient.post(`/subscription/c/${channelId}`)
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
