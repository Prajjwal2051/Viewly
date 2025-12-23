// ============================================
// VIDEO API - BACKEND VIDEO OPERATIONS
// ============================================
// Handles all video-related API calls: fetch, upload, update, delete.
// Uses apiClient for authenticated requests with automatic token handling.

import apiClient from "./client"

/**
 * GET ALL VIDEOS
 * Fetches paginated video list with optional filters
 *
 * Params:
 * - page: Page number (default: 1)
 * - limit: Videos per page (default: 10)
 * - search: Search query for title/description
 * - category: Filter by category
 * - tags: Filter by tags
 *
 * Returns: { videos: [], totalPages, currentPage, totalVideos }
 */
const getAllVideos = async (params = {}) => {
    const {
        page = 1,
        limit = 10,
        search = "",
        category = "",
        tags = "",
    } = params
    const response = await apiClient.get("/videos", {
        params: { page, limit, search, category, tags },
    })
    return response.data
}

/**
 * GET VIDEO BY ID
 * Fetches single video details with owner info, comments, likes
 *
 * Params:
 * - videoId: MongoDB ObjectId of the video
 *
 * Returns: { video: {...}, owner: {...}, likes, views }
 */
const getVideoById = async (videoId) => {
    const response = await apiClient.get(`/videos/${videoId}`)
    return response.data
}

/**
 * GET VIDEO CATEGORIES
 * Fetches list of all unique categories from published videos
 *
 * Returns: { data: ["Category1", "Category2", ...], message: "..." }
 */
const getVideoCategories = async () => {
    const response = await apiClient.get("/videos/categories")
    return response.data
}

/**
 * UPLOAD VIDEO
 * Uploads new video with file and metadata
 *
 * Params:
 * - formData: FormData object containing:
 *   - videoFile: Video file (mp4, webm, etc.)
 *   - thumbnail: Thumbnail image
 *   - title, description, category, tags
 *
 * Returns: { video: {...}, message: "Upload successful" }
 */
const uploadVideo = async (formData) => {
    const response = await apiClient.post("/videos", formData, {
        headers: {
            "Content-Type": "multipart/form-data", // Required for file uploads
        },
    })
    return response.data
}

/**
 * UPDATE VIDEO
 * Updates video metadata (title, description, thumbnail, etc.)
 *
 * Params:
 * - videoId: MongoDB ObjectId of the video
 * - data: Object with fields to update (title, description, category, tags, etc.)
 *
 * Returns: { video: {...}, message: "Updated successfully" }
 */
const updateVideo = async (videoId, data) => {
    const response = await apiClient.patch(`/videos/${videoId}`, data)
    return response.data
}

/**
 * DELETE VIDEO
 * Permanently deletes video and associated data
 *
 * Params:
 * - videoId: MongoDB ObjectId of the video
 *
 * Returns: { message: "Video deleted successfully" }
 */
const deleteVideo = async (videoId) => {
    const response = await apiClient.delete(`/videos/${videoId}`)
    return response.data
}

/**
 * SEARCH VIDEOS
 * Advanced search with multiple filters
 *
 * Params object keys:
 * - query: Search text
 * - category: Filter category
 * - minDuration, maxDuration: Duration range in seconds
 * - sortBy: Sort order (relevance, views, date, likes)
 * - startDate, endDate: Date range
 * - page, limit: Pagination
 */
const searchVideos = async (params) => {
    const response = await apiClient.get("/search", { params })
    return response.data
}

export {
    deleteVideo,
    updateVideo,
    uploadVideo,
    getAllVideos,
    getVideoById,
    getVideoCategories,
    searchVideos,
}
