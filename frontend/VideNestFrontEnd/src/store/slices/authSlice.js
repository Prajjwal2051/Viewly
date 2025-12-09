// ============================================
// AUTH SLICE - REDUX STATE MANAGEMENT
// ============================================
// Manages authentication state across the entire app.
// Any component can access: Is user logged in? Who is the user? Is login in progress?
//
// Why Redux instead of passing props?
// - Avoids "prop drilling" (passing data through 10+ components)
// - Single source of truth: one place stores auth state
// - Any component can read/update state without passing through parents

import { createSlice } from "@reduxjs/toolkit"

/**
 * INITIAL STATE
 *
 * This is the default state when app first loads.
 * Think of it as an empty form that gets filled in when user logs in.
 *
 * Fields explained:
 * - user: Stores user object from backend (username, email, avatar, etc.)
 * - isAuthenticated: Quick boolean check for "is someone logged in?"
 * - loading: Shows spinner while waiting for login/register API response
 * - error: Stores error message if login fails (wrong password, network error, etc.)
 */
const initialState = {
    user: null, // null = no one logged in, object = logged in user data
    isAuthenticated: false, // false = show login page, true = show protected content
    loading: false, // false = idle, true = API call in progress
    error: null, // null = no errors, string = error message to display
}

/**
 * AUTH SLICE
 *
 * What is createSlice?
 * - Redux Toolkit function that bundles state + actions + reducers together
 * - Old Redux required 100+ lines, createSlice does it in 30 lines
 *
 * What it creates:
 * 1. State container (initialState above)
 * 2. Actions (loginStart, loginSuccess, etc.) - dispatched from components
 * 3. Reducers (functions that update state) - run automatically when actions dispatched
 *
 * How it works:
 * Component → dispatch(loginStart()) → reducer runs → state.loading = true → component re-renders
 */
const authSlice = createSlice({
    name: "auth", // Namespace for this slice (shows in Redux DevTools as "auth/loginStart")
    initialState,
    reducers: {
        /**
         * LOGIN START
         *
         * When: User clicks "Login" button, before API call
         * Purpose: Show loading spinner, clear previous errors
         *
         * Flow:
         * 1. User submits login form
         * 2. Component dispatches: dispatch(loginStart())
         * 3. This reducer runs, sets loading = true
         * 4. Component re-renders, shows spinner
         * 5. API call happens (in component or thunk)
         */
        loginStart: (state) => {
            state.loading = true
            state.error = null // Clear old errors
        },

        /**
         * LOGIN SUCCESS
         *
         * When: Backend responds with user data + token
         * Purpose: Store user, mark as authenticated, hide spinner
         *
         * Flow:
         * 1. API returns: { data: { user, accessToken } }
         * 2. Component stores token in localStorage
         * 3. Component dispatches: dispatch(loginSuccess(user))
         * 4. This reducer runs, saves user to state
         * 5. isAuthenticated = true → ProtectedRoute allows access
         * 6. Navbar re-renders with user avatar
         *
         * @param {Object} action.payload - User object from backend
         */
        loginSuccess: (state, action) => {
            state.loading = false
            state.isAuthenticated = true
            state.user = action.payload // Save user data (username, email, avatar, etc.)
            state.error = null
        },

        /**
         * LOGIN FAILURE
         *
         * When: Backend returns error (wrong password, network error)
         * Purpose: Show error message, stop loading
         *
         * Flow:
         * 1. API returns 401 or network fails
         * 2. Component dispatches: dispatch(loginFailure("Invalid password"))
         * 3. This reducer runs, stores error message
         * 4. Component re-renders, shows error below form
         *
         * @param {Object} action.payload - Error message string
         */
        loginFailure: (state, action) => {
            ;((state.loading = false),
                (state.isAuthenticated = false),
                (state.error = action.payload)) // Error message to display to user
        },

        /**
         * LOGOUT
         *
         * When: User clicks "Logout" button or token expires (401 error)
         * Purpose: Clear all user data, reset to initial state
         *
         * Flow:
         * 1. User clicks logout or 401 interceptor triggers
         * 2. Component calls logoutUser() API (clears backend refreshToken)
         * 3. Component clears localStorage.removeItem("accessToken")
         * 4. Component dispatches: dispatch(logout())
         * 5. This reducer runs, resets state
         * 6. ProtectedRoute redirects to /login
         *
         * Note: Must reset ALL fields to prevent data leaks between users
         */
        logout: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.loading = false
            state.error = null
        },
    },
})

// ============================================
// EXPORTS
// ============================================

/**
 * ACTION CREATORS
 *
 * These are automatically generated by createSlice.
 * Import these in components to dispatch actions.
 *
 * Usage in component:
 * import { loginStart, loginSuccess } from './store/slices/authSlice'
 * dispatch(loginStart())                    // Start loading
 * dispatch(loginSuccess(userData))          // Save user data
 *
 * Redux flow:
 * dispatch(action) → Redux finds matching reducer → reducer updates state → components re-render
 */
export const { loginStart, loginSuccess, loginFailure, logout } =
    authSlice.actions

/**
 * REDUCER
 *
 * This is the main reducer function that Redux uses.
 * It gets added to the store in store/index.js
 *
 * Don't use this directly in components - use actions above instead.
 * Redux calls this automatically when actions are dispatched.
 */
export default authSlice.reducer
