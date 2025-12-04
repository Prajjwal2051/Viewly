// ============================================
// GLOBAL CONSTANTS
// ============================================
// Centralized constants prevent typos and make updates easier.
// Change a route in one place, and it updates everywhere it's used.

/**
 * API_BASE_URL - Backend server address
 * 
 * Why import.meta.env?
 * - Vite uses import.meta.env (not process.env like CRA)
 * - VITE_ prefix required for exposure to client-side code
 * - Defined in .env file: VITE_API_BASE_URL=http://localhost:8000/api/v1
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * ROUTES - Application route paths
 * 
 * Why define routes as constants?
 * - Prevents typos: use ROUTES.HOME instead of typing "/" everywhere
 * - Easy refactoring: change route once, updates in all components
 * - Auto-complete: IDE suggests available routes
 * 
 * Dynamic segments (with colons):
 * - :videoID - Extracted in component via useParams() → const { videoID } = useParams()
 * - :username - Used for channel pages → /channel/johndoe
 */
export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    VIDEO: "/video/:videoID",        // Dynamic: /video/abc123
    CHANNEL: "/channel/:username",   // Dynamic: /channel/johndoe
    DASHBOARD: "/dashboard",
}
