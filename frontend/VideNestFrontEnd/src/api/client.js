// ============================================
// API CLIENT - AXIOS CONFIGURATION
// ============================================
// Centralized HTTP client for all backend communication.
// Handles authentication tokens, errors, and response formatting automatically.

import axios from "axios"
import { API_BASE_URL } from "../utils/constants.js"

/**
 * CREATE AXIOS INSTANCE
 *
 * Why create an instance instead of using axios directly?
 * - Reusable configuration (baseURL, headers, credentials)
 * - All API calls share same settings
 * - Interceptors apply to all requests/responses
 *
 * Configuration explained:
 * - baseURL: Prepended to all requests (e.g., '/users/login' → 'http://localhost:8000/api/v1/users/login')
 * - withCredentials: Sends cookies with requests (needed for refreshToken cookie from backend)
 * - headers: Default Content-Type for JSON requests
 */
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // CRITICAL: Enables cookie transmission (refresh token)
    headers: {
        "Content-Type": "application/json",
    },
})

/**
 * REQUEST INTERCEPTOR
 *
 * What are interceptors?
 * - Functions that run BEFORE every request is sent
 * - Think of them as middleware for HTTP requests
 *
 * Purpose:
 * - Automatically attach JWT accessToken to protected API calls
 * - Backend's verifyJWT middleware expects "Authorization: Bearer <token>" header
 *
 * Flow:
 * 1. User calls API (e.g., apiClient.get('/videos'))
 * 2. Interceptor runs → checks localStorage for token
 * 3. If token exists → adds to Authorization header
 * 4. Request sent to backend with token
 * 5. Backend verifies token and responds
 */
apiClient.interceptors.request.use(
    (config) => {
        // Retrieve accessToken from localStorage (stored during login)
        const token = localStorage.getItem("acessToken") // Note: Fix typo → "accessToken" later

        // If token exists, attach it to request headers
        if (token) {
            // Backend expects: "Authorization: Bearer <token>"
            config.headers.Authorization = `Bearer ${token}`
        }

        // Return modified config (request proceeds with token)
        return config
    },
    (error) => {
        // If request setup fails (rare), reject the promise
        return Promise.reject(error)
    }
)

/**
 * RESPONSE INTERCEPTOR
 *
 * What are response interceptors?
 * - Functions that run AFTER backend responds, BEFORE your component receives data
 * - Process or transform responses globally
 *
 * Purpose:
 * - Unwrap backend response (return just .data instead of full Axios response)
 * - Handle errors globally (401 → auto logout, network errors → friendly message)
 *
 * Flow:
 * 1. Backend responds: { statusCode: 200, data: {...}, message: "Success", success: true }
 * 2. Interceptor unwraps → returns just {...} to your component
 * 3. Components get clean data without manual extraction
 */
apiClient.interceptors.response.use(
    (response) => {
        // SUCCESS: Return only the data object
        // Without this: response.data.data.videos
        // With this: response.data.videos ✅
        return response.data // ApiResponse { statusCode, data, message, success }
    },
    (error) => {
        // ERROR HANDLING
        if (error.response) {
            // Backend responded with error (4xx, 5xx status codes)
            const { status, data } = error.response

            // 401 Unauthorized: Token expired or invalid
            if (status === 401) {
                console.log("Token expired, redirecting to login...")
                // Clear invalid token and force re-login
                localStorage.removeItem("accessToken")
                window.location.href = "/login"
            }

            // Return backend error (ApiError { statusCode, message, success: false })
            return Promise.reject(data)
        }

        // NETWORK ERROR: Backend unreachable (server down, no internet)
        return Promise.reject({
            message: "Network error. Please check your connection.",
        })
    }
)

export default apiClient
