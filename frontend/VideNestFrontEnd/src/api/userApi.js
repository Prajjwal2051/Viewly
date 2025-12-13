// ============================================
// USER API
// ============================================
// Handles user-specific operations: password change, profile updates, account details.
// Routes map to User Controller in backend.

import apiClient from "./client.js"

/**
 * CHANGE PASSWORD
 *
 * Backend: POST /api/v1/users/change-password
 * Requires: oldPassword, newPassword
 */
const changePassword = async (data) => {
    const response = await apiClient.post("/users/change-password", data)
    return response.data
}

/**
 * UPDATE ACCOUNT DETAILS
 *
 * Backend: PATCH /api/v1/users/update-account
 * Requires: fullName, email
 */
const updateAccountDetails = async (data) => {
    const response = await apiClient.patch("/users/update-account", data)
    return response.data
}

/**
 * UPDATE USER AVATAR
 *
 * Backend: PATCH /api/v1/users/avatar
 * Requires: FormData with 'avatar' file
 */
const updateUserAvatar = async (formData) => {
    const response = await apiClient.patch("/users/avatar", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
    return response.data
}

/**
 * UPDATE USER COVER IMAGE
 *
 * Backend: PATCH /api/v1/users/cover-image
 * Requires: FormData with 'coverImage' file
 */
const updateUserCoverImage = async (formData) => {
    const response = await apiClient.patch("/users/cover-image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
    return response.data
}

/**
 * GET USER CHANNEL PROFILE
 *
 * Backend: GET /api/v1/users/c/:username
 * Returns full channel profile with stats
 */
const getUserChannelProfile = async (username) => {
    const response = await apiClient.get(`/users/c/${username}`)
    return response.data
}

export {
    changePassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
}
