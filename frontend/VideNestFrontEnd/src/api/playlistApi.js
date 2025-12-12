// ============================================
// PLAYLIST API - API CALLS FOR PLAYLIST MANAGEMENT
// ============================================
// Handles all playlist-related API requests

import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"

// ============================================
// PLAYLIST CRUD OPERATIONS
// ============================================

/**
 * CREATE PLAYLIST
 * Creates a new playlist for the authenticated user
 * @param {Object} data - Playlist data
 * @param {string} data.name - Playlist name (required, max 100 chars)
 * @param {string} data.description - Playlist description (optional, max 500 chars)
 * @param {boolean} data.isPublic - Visibility setting (default: true)
 * @returns {Promise} Created playlist with owner details
 */
export const createPlaylist = async ({
    name,
    description = "",
    isPublic = true,
}) => {
    try {
        const response = await axios.post(
            `${API_URL}/playlists`,
            { name, description, isPublic },
            { withCredentials: true }
        )
        return response.data
    } catch (error) {
        console.error("Error creating playlist:", error)
        throw error.response?.data || error
    }
}

/**
 * GET USER PLAYLISTS
 * Retrieves paginated list of playlists created by a specific user
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} limit - Number of playlists per page (default: 10)
 * @returns {Promise} Paginated playlist list with metadata
 */
export const getUserPlaylists = async (userId, page = 1, limit = 10) => {
    try {
        const response = await axios.get(
            `${API_URL}/playlists/user/${userId}`,
            {
                params: { page, limit },
                withCredentials: true,
            }
        )
        return response.data
    } catch (error) {
        console.error("Error fetching user playlists:", error)
        throw error.response?.data || error
    }
}

/**
 * GET PLAYLIST BY ID
 * Retrieves detailed information about a specific playlist including all videos
 * @param {string} playlistId - MongoDB ObjectId of the playlist
 * @returns {Promise} Complete playlist data with videos and owner details
 */
export const getPlaylistById = async (playlistId) => {
    try {
        const response = await axios.get(`${API_URL}/playlists/${playlistId}`, {
            withCredentials: true,
        })
        return response.data
    } catch (error) {
        console.error("Error fetching playlist:", error)
        throw error.response?.data || error
    }
}

/**
 * ADD VIDEO TO PLAYLIST
 * Adds a video to an existing playlist
 * @param {string} playlistId - MongoDB ObjectId of the playlist
 * @param {string} videoId - MongoDB ObjectId of the video to add
 * @returns {Promise} Updated playlist data
 */
export const addVideoToPlaylist = async (playlistId, videoId) => {
    try {
        const response = await axios.patch(
            `${API_URL}/playlists/add/${playlistId}/${videoId}`,
            {},
            { withCredentials: true }
        )
        return response.data
    } catch (error) {
        console.error("Error adding video to playlist:", error)
        throw error.response?.data || error
    }
}

/**
 * REMOVE VIDEO FROM PLAYLIST
 * Removes a specific video from an existing playlist
 * @param {string} playlistId - MongoDB ObjectId of the playlist
 * @param {string} videoId - MongoDB ObjectId of the video to remove
 * @returns {Promise} Updated playlist data
 */
export const removeVideoFromPlaylist = async (playlistId, videoId) => {
    try {
        const response = await axios.patch(
            `${API_URL}/playlists/remove/${playlistId}/${videoId}`,
            {},
            { withCredentials: true }
        )
        return response.data
    } catch (error) {
        console.error("Error removing video from playlist:", error)
        throw error.response?.data || error
    }
}

/**
 * UPDATE PLAYLIST
 * Updates playlist name, description, and privacy settings
 * @param {string} playlistId - MongoDB ObjectId of the playlist
 * @param {Object} data - Update data
 * @param {string} data.name - New playlist name (optional, max 100 chars)
 * @param {string} data.description - New description (optional, max 500 chars)
 * @param {boolean} data.isPublic - New visibility setting (optional)
 * @returns {Promise} Updated playlist data
 */
export const updatePlaylist = async (playlistId, data) => {
    try {
        const response = await axios.patch(
            `${API_URL}/playlists/${playlistId}`,
            data,
            { withCredentials: true }
        )
        return response.data
    } catch (error) {
        console.error("Error updating playlist:", error)
        throw error.response?.data || error
    }
}

/**
 * DELETE PLAYLIST
 * Permanently deletes a playlist from the database
 * @param {string} playlistId - MongoDB ObjectId of the playlist to delete
 * @returns {Promise} Deletion confirmation
 */
export const deletePlaylist = async (playlistId) => {
    try {
        const response = await axios.delete(
            `${API_URL}/playlists/${playlistId}`,
            { withCredentials: true }
        )
        return response.data
    } catch (error) {
        console.error("Error deleting playlist:", error)
        throw error.response?.data || error
    }
}
