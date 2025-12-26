// ============================================
// APP.JSX - MAIN APPLICATION ROUTER
// ============================================
// Central routing hub that controls which pages users can see.
// Protects routes requiring login and manages navigation flow.

import { useState, useEffect, lazy, Suspense } from "react"
import {
    Routes,
    Route,
    Navigate,
    useLocation,
    useNavigate,
} from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { Toaster } from "react-hot-toast"
import { loginSuccess, logout } from "./store/slices/authSlice"
import { getCurrentUser } from "./api/authApi"
import { Loader2 } from "lucide-react"

// Lazy load all page components for code splitting
const HomePage = lazy(() => import("./pages/HomePage"))
const LoginPage = lazy(() => import("./pages/LoginPage"))
const RegisterPage = lazy(() => import("./pages/RegisterPage"))
const SettingsPage = lazy(() => import("./pages/SettingsPage"))
const UploadPage = lazy(() => import("./pages/UploadPage"))
const ProfilePage = lazy(() => import("./pages/ProfilePage"))
const VideoPlayerPage = lazy(() => import("./pages/VideoPlayerPage"))
const DashboardPage = lazy(() => import("./pages/DashboardPage"))
const SearchPage = lazy(() => import("./pages/SearchPage"))
const DiscoverPage = lazy(() => import("./pages/DiscoverPage"))
const ActivityPage = lazy(() => import("./pages/ActivityPage"))
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"))
const TweetPage = lazy(() => import("./pages/TweetPage"))
const PlaylistsPage = lazy(() => import("./pages/PlaylistsPage"))
const PlaylistDetailPage = lazy(() => import("./pages/PlaylistDetailPage"))
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"))
const SubscriptionsPage = lazy(() => import("./pages/SubscriptionsPage"))
const SubscribersPage = lazy(() => import("./pages/SubscribersPage"))
const LikedCommentsPage = lazy(() => import("./pages/LikedCommentsPage"))
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"))
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"))

// Loading component for Suspense fallback
const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen bg-[#1E2021]">
        <Loader2 className="w-12 h-12 animate-spin text-red-600" />
    </div>
)

// Context
import { ThemeProvider } from "./context/ThemeContext"

// Layout wrapper for protected pages
import MainLayout from "./components/layout/MainLayout"

/**
 * PROTECTED ROUTE WRAPPER
 *
 * What it does:
 * - Checks if user is logged in before showing protected content
 * - Redirects to /login if not authenticated
 *
 * How it works:
 * - useSelector reads isAuthenticated from Redux store
 * - If true → renders children (HomePage, etc.)
 * - If false → <Navigate> redirects to /login
 *
 * Usage: <ProtectedRoute><HomePage /></ProtectedRoute>
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth)
    return isAuthenticated ? children : <Navigate to="/login" />
}

/**
 * MAIN APP COMPONENT
 *
 * Router Structure:
 * 1. BrowserRouter - Enables navigation (uses browser's URL bar)
 * 2. Routes - Container for all route definitions
 * 3. Route - Maps URL paths to components
 *
 * Route Types:
 * - Public: /login, /register (accessible without login)
 * - Protected: All other routes (wrapped in ProtectedRoute + MainLayout)
 * - Fallback: * (catches invalid URLs, shows 404)
 */
function App() {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const background = location.state && location.state.background
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("accessToken")
            if (token) {
                try {
                    const response = await getCurrentUser()
                    const user = response.data || response // Adjust based on API response structure
                    if (user) {
                        dispatch(loginSuccess(user))
                    } else {
                        dispatch(logout())
                    }
                } catch (error) {
                    console.error("Auth check failed:", error)
                    dispatch(logout())
                }
            } else {
                dispatch(logout())
            }
            setLoading(false)
        }

        checkAuth()
    }, [dispatch])

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#1E2021]">
                <Loader2 className="h-10 w-10 animate-spin text-red-600" />
            </div>
        )
    }

    return (
        <ThemeProvider>
            {/* Toast notifications - displays success/error messages globally */}
            <Toaster position="top-right" />

            {/* Suspense wrapper for lazy-loaded routes */}
            <Suspense fallback={<LoadingSpinner />}>
                <Routes location={background || location}>
                    {/* PUBLIC ROUTES - No login required */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPasswordPage />}
                    />
                    <Route
                        path="/reset-password/:token"
                        element={<ResetPasswordPage />}
                    />

                    {/* PROTECTED ROUTES - All require authentication
                Each route wraps its page in ProtectedRoute → MainLayout → Page */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <HomePage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <SettingsPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/upload"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <UploadPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/video/:videoId"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <VideoPlayerPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* DISCOVER PAGE - Content Discovery */}
                    <Route
                        path="/discover"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <DiscoverPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* ACTIVITY PAGE - Notifications & Activity */}
                    <Route
                        path="/activity"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <ActivityPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* PLAYLISTS PAGE - User's playlists */}
                    <Route
                        path="/playlists"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <PlaylistsPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* PLAYLIST DETAIL PAGE - Single playlist view */}
                    <Route
                        path="/playlists/:playlistId"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <PlaylistDetailPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* NOTIFICATIONS PAGE - User notifications */}
                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <NotificationsPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* SUBSCRIPTIONS PAGE - Following/Subscribed channels */}
                    <Route
                        path="/subscriptions"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <SubscriptionsPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* SUBSCRIBERS PAGE - Channel followers */}
                    <Route
                        path="/channel/:username/subscribers"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <SubscribersPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* LIKED COMMENTS PAGE - User's liked comments */}
                    <Route
                        path="/liked/comments"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <LikedCommentsPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* TWEET PAGE - Detail view for tweets */}
                    <Route
                        path="/tweet/:tweetId"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <TweetPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* USER PROFILE PAGE */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <ProfilePage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* DASHBOARD PAGE - Creator Stats & Video Management */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <DashboardPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* SEARCH PAGE - Video Search Results */}
                    <Route
                        path="/search"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <SearchPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* CHANNEL PAGE (Public Profile) */}
                    <Route
                        path="/channel/:username"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <ProfilePage />{" "}
                                    {/* Reusing ProfilePage for now, ideally ChannelPage */}
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* CATCH-ALL ROUTE - Handles invalid URLs (404 errors) */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>

            {/* MODAL ROUTES - Rendered on top of everything when background exists */}
            {background && (
                <Suspense fallback={null}>
                    <Routes>
                        <Route
                            path="/tweet/:tweetId"
                            element={
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                    <div
                                        className="absolute inset-0"
                                        onClick={() => navigate(-1)}
                                    />
                                    <div className="relative z-10 w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
                                        <TweetPage isModal={true} />
                                    </div>
                                </div>
                            }
                        />

                        <Route
                            path="/video/:videoId"
                            element={
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                    <div
                                        className="absolute inset-0"
                                        onClick={() => navigate(-1)}
                                    />
                                    <div className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl bg-[#1E2021]">
                                        <VideoPlayerPage isModal={true} />
                                    </div>
                                </div>
                            }
                        />
                    </Routes>
                </Suspense>
            )}
        </ThemeProvider>
    )
}

export default App
