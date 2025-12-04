// ============================================
// REDUX STORE CONFIGURATION
// ============================================
// This is the central Redux store - the "single source of truth" for all global state.
// Think of it as a supermarket where each aisle (slice) contains related products (state).
//
// Why configureStore (Redux Toolkit) instead of createStore (old Redux)?
// - Auto-includes Redux DevTools (time-travel debugging)
// - Auto-includes middleware (thunk for async actions)
// - Simpler setup (no manual middleware/enhancer configuration)

import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice.js"

/**
 * CONFIGURE STORE
 *
 * What happens here?
 * - Combines all slice reducers into one root reducer
 * - Each slice gets its own namespace in the state tree
 * - Components access via: state.auth.user, state.auth.isAuthenticated, etc.
 *
 * Adding more slices:
 * reducer: {
 *   auth: authReducer,           // state.auth
 *   videos: videoReducer,         // state.videos
 *   notifications: notifReducer,  // state.notifications
 * }
 *
 * State structure this creates:
 * {
 *   auth: {
 *     user: null,
 *     isAuthenticated: false,
 *     loading: false,
 *     error: null
 *   }
 *   // Future slices appear here as you add them
 * }
 */
const store = configureStore({
    reducer: {
        // Auth slice manages: login, logout, user data, authentication status
        // Access in components: useSelector(state => state.auth.user)
        auth: authReducer,
    },
})

// ============================================
// EXPORT STORE
// ============================================
// This store is wrapped around the app in main.jsx:
// <Provider store={store}>
//   <App />
// </Provider>
//
// Now ANY component in the app can:
// - Read state: useSelector(state => state.auth.isAuthenticated)
// - Update state: dispatch(loginSuccess(userData))
export default store
