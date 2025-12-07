// ============================================
// APP.JSX - MAIN APPLICATION ROUTER
// ============================================
// Central routing hub that controls which pages users can see.
// Protects routes requiring login and manages navigation flow.

import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Toaster } from "react-hot-toast"

// Page Components
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
// Placeholder imports - create these pages as needed
import DiscoverPage from "./pages/DiscoverPage"
import UploadPage from "./pages/UploadPage"
import ActivityPage from "./pages/ActivityPage"
import ProfilePage from "./pages/ProfilePage"

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
    return (
        <BrowserRouter>
            {/* Toast notifications - displays success/error messages globally */}
            <Toaster position="top-right" />

            <Routes>
                {/* PUBLIC ROUTES - No login required */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

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

                Additional protected routes - uncomment when pages are created
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
                    path="/activity"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <ActivityPage />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
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
               

                {/* CATCH-ALL ROUTE - Handles invalid URLs (404 errors) */}
                <Route path="*" element={<div>404- Page Not Found</div>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
