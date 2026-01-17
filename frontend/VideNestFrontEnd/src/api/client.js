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
 * 2. Interceptor runs → checks localStorage for token ( with Credientals:true this is not needed as browser automatically handles it from)
 * 3. If token exists → adds to Authorization header
 * 4. Request sent to backend with token
 * 5. Backend verifies token and responds
 */
apiClient.interceptors.request.use(
    (config) => {
        // Retrieve accessToken from localStorage (stored during login)

        // this is commented out because browser automatically includes cookies with withCredentials:true
        // const token = localStorage.getItem("accessToken") // Note: Fix typo → "accessToken" later

        // // If token exists, attach it to request headers
        // if (token) {
        //     // Backend expects: "Authorization: Bearer <token>"
        //     config.headers.Authorization = `Bearer ${token}`
        // }

        // just adding a request Id for debugging
        config.headers["X-Request=Id"] =
            `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

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
 * - Handle errors globally (401 → auto logout, 429 → rate limit toast, network errors → friendly message)
 *
 * Flow:
 * 1. Backend responds: { statusCode: 200, data: {...}, message: "Success", success: true }
 * 2. Interceptor unwraps → returns just {...} to your component
 * 3. Components get clean data without manual extraction
 */

// Import toast for notifications
import toast from "react-hot-toast"
import { Thermometer } from "lucide-react"

apiClient.interceptors.response.use(
    (response) => {
        // SUCCESS: Return only the data object
        // Without this: response.data.data.videos
        // With this: response.data.videos ✅
        return response.data // ApiResponse { statusCode, data, message, success }
    },
    async (error) => {
        const originalRequest = error.config

        console.error("[API Client] Request error:", {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message,
        })

        // Handle 401 Unauthorized - Token expired

        if (error.response?.status === 401) {
            const currentPath = window.location.pathname

            //if the user is already in auth pages then we should not redirect them
            if (
                currentPath !== "/login" &&
                currentPath !== "/register" &&
                currentPath !== "/forgot-password"
            ) {
                if (originalRequest.url?.includes("/users/refresh-token")) {
                    // token refresh failed - session truly expired
                    toast.error("Session expired. Please login again", {
                        id: "session-expired",
                        duration: 4000,
                    })
                    // now i have to redirect it to the login page
                    setTimeout(() => {
                        window.location.href = "/login?sessionExpired=true"
                    }, 1000)
                } else {
                    try {
                        // again we will attempt the refresing token automtically
                        await axios.post(
                            `${API_BASE_URL}/users/refresh-token`,
                            {},
                            {
                                withCredentials: true,
                            }
                        )
                        return apiClient(originalRequest)
                    } catch (refreshError) {
                        toast.error("Session expired. Please login again", {
                            id: "session-expired",
                            duration: 4000,
                        })
                        // now i have to redirect it to the login page
                        setTimeout(() => {
                            window.location.href = "/login?sessionExpired=true"
                        }, 1000)
                    }
                }
            }
        }

        // if (error.response?.status === 401) {
        //     const currentPath = window.location.pathname
        //     // Only redirect if not already on login/register page
        //     if (currentPath !== "/login" && currentPath !== "/register") {
        //         // Clear tokens
        //         localStorage.removeItem("accessToken")
        //         localStorage.removeItem("refreshToken")

        //         // Show error message
        //         toast.error("Session expired. Please login again.")

        //         // Redirect to login
        //         window.location.href = "/login"
        //     }
        // }

        // Handle 429 Too Many Requests - Rate limit exceeded
        if (error.response?.status === 429) {
            const message =
                error.response?.data?.message ||
                "Too many requests. Please try again later."

            // Show user-friendly toast notification
            toast.error(message, {
                duration: 5000,
                icon: "⏱️",
            })

            // Log rate limit headers for debugging
            const retryAfter = error.response?.headers["retry-after"]
            const rateLimit = error.response?.headers["ratelimit-limit"]
            const rateLimitRemaining =
                error.response?.headers["ratelimit-remaining"]

            console.warn("[Rate Limit] Exceeded:", {
                message,
                retryAfter,
                limit: rateLimit,
                remaining: rateLimitRemaining,
            })
        }

        // ERROR HANDLING
        if (error.response) {
            // Backend responded with error (4xx, 5xx status codes)
            const { data } = error.response

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
