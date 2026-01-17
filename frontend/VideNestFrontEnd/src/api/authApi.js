// ============================================
// AUTHENTICATION API
// ============================================
// Handles all user authentication operations: register, login, logout, token refresh.
// Each function maps directly to a backend endpoint.

import apiClient from "./client.js"

/**
 * REGISTER NEW USER
 *
 * Backend: POST /api/v1/users/register
 *
 * What is FormData?
 * - Special object for sending files + text data together
 * - Required when uploading images (avatar, coverImage)
 * - Browser automatically sets correct Content-Type with boundary
 *
 * Flow:
 * 1. User fills registration form (username, email, password, avatar, coverImage)
 * 2. Form creates FormData object
 * 3. This function sends to backend
 * 4. Backend uploads files to Cloudinary, creates user in MongoDB
 * 5. Returns user object + tokens
 *
 * @param {FormData} formData - Contains username, email, password, fullName, avatar, coverImage
 * @returns {Promise<Object>} User object with accessToken
 */
const registerUser = async (formData) => {
    const response = await apiClient.post("/users/register", formData, {
        headers: {
            // Override default JSON header for file uploads
            "Content-Type": "multipart/form-data",
        },
    })

    // Response interceptor already unwrapped response.data
    // So response.data is actually response.data.data from backend
    return response.data
}

/**
 * LOGIN USER
 *
 * Backend: POST /api/v1/users/login
 *
 * What happens during login?
 * 1. Sends username/email + password to backend
 * 2. Backend validates credentials with bcrypt
 * 3. Backend generates accessToken (JWT) and refreshToken
 * 4. accessToken sent in response body
 * 5. refreshToken sent in HTTP-only cookie (automatically stored by browser)
 *
 * Why two tokens?
 * ( from now we will be using cookies and not storing tokens in the local storage:) )
 * - accessToken: Short-lived (1 day), stored in localStorage ( from now we will be using cookies and not storing in the local storage:) ), sent with every request
 * - refreshToken: Long-lived (10 days), in cookie, used to get new accessToken when it expires
 *
 * @param {Object} credentials - { username/email, password }
 * @returns {Promise<Object>} { user, accessToken }
 */
const loginUser = async (credentials) => {
    const response = await apiClient.post("/users/login", credentials)
    return response.data
}

/**
 * LOGOUT USER
 *
 * Backend: POST /api/v1/users/logout
 *
 * What happens?
 * 1. Backend clears refreshToken from cookie
 * 2. Backend removes refreshToken from user document in DB
 * 3. Frontend must clear accessToken from localStorage (done in component) // update it as we are using cookies
 *
 * Security note:
 * - Must send request to backend (can't just clear localStorage)
 * - Ensures refreshToken is invalidated server-side
 *
 * @returns {Promise<Object>} Success message
 */
const logoutUser = async () => {
    const response = await apiClient.post("/users/logout")
    return response.data
}

/**
 * GET CURRENT USER
 *
 * Backend: GET /api/v1/users/current-user
 *
 * When to use?
 * - On app load: Check if user is still logged in
 * - After page refresh: Restore user state
 * - Update navbar with user info (avatar, username)
 *
 * How does backend know which user?
 * - Request interceptor attaches accessToken to Authorization header
 * - Backend's verifyJWT middleware decodes token → extracts user ID
 * - Backend fetches user from database
 *
 * @returns {Promise<Object>} User object (without password)
 */
const getCurrentUser = async () => {
    const response = await apiClient.get("/users/current-user") // Note: Check if endpoint is correct
    return response.data
}

/**
 * REFRESH ACCESS TOKEN
 *
 * Backend: POST /api/v1/users/refresh-token
 *
 * Why do we need this?
 * - accessToken expires after 1 day
 * - Instead of forcing user to login again, we silently get a new one
 * - Uses refreshToken (from cookie) to generate new accessToken
 *
 * When to call?
 * - When API returns 401 Unauthorized
 * - Before token expires (proactive refresh)
 * - On app load if accessToken is missing but refreshToken cookie exists
 *
 * Flow:
 * 1. Frontend calls this function (no params needed, refreshToken is in cookie)
 * 2. Backend validates refreshToken from cookie
 * 3. Backend generates new accessToken
 * 4. Frontend stores new accessToken in localStorage
 *
 * @returns {Promise<Object>} { accessToken }
 */
const refreshAccessToken = async () => {
    const response = await apiClient.post("/users/refresh-token")
    return response.data // Contains new accessToken
}

/**
 * REQUEST PASSWORD RESET
 * Sends email with reset link to user
 *
 * Backend: POST /api/v1/users/forgot-password
 *
 * What happens?
 * 1. User provides email address
 * 2. Backend generates reset token and sends email
 * 3. User receives email with reset link (15 min expiry)
 *
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Success message
 */
const forgotPassword = async (email) => {
    const response = await apiClient.post("/users/forgot-password", { email })
    return response.data
}

/**
 * RESET PASSWORD
 * Updates password using reset token from email
 *
 * Backend: POST /api/v1/users/reset-password/:token
 *
 * What happens?
 * 1. User submits new password with token from URL
 * 2. Backend validates token and expiry
 * 3. Backend updates password and clears token
 * 4. User can login with new password
 *
 * @param {string} token - Reset token from URL
 * @param {Object} data - { password, confirmPassword }
 * @returns {Promise<Object>} Success message
 */
const resetPassword = async (token, data) => {
    const response = await apiClient.post(
        `/users/reset-password/${token}`,
        data
    )
    return response.data
}

// ============================================
// EXPORTS
// ============================================
// Export all functions for use in components and Redux actions
export {
    registerUser, // User registration with file uploads
    loginUser, // User authentication
    logoutUser, // End user session
    getCurrentUser, // Fetch logged-in user data
    refreshAccessToken, // Renew expired accessToken
    forgotPassword, // Request password reset
    resetPassword, // Reset password with token
}
