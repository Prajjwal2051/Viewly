// ============================================
// DASHBOARD API
// ============================================
// Handles fetching channel statistics and analytics

import apiClient from "./client"

/**
 * Get channel statistics for dashboard
 * @param {string} channelId - Channel ID to fetch stats for
 * @returns {Promise<Object>} Channel statistics and growth metrics
 */
export const getChannelStats = async (channelId) => {
    // If channelId is provided, use it, otherwise call without it (if backend supports user context)
    const url = channelId ? `/dashboard/stats/${channelId}` : "/dashboard/stats"
    const response = await apiClient.get(url)
    return response.data
}

/**
 * Get channel videos with detailed stats
 * @param {string} channelId - Channel ID
 * @returns {Promise<Object>} List of videos with stats
 */
export const getChannelVideos = async (channelId) => {
    const response = await apiClient.get(`/dashboard/videos/${channelId}`)
    return response.data
}
