// ============================================
// HEADER COMPONENT - NAVIGATION BAR
// ============================================
// Sticky top navigation with search, notifications, and user menu.
// Responsive design: mobile menu + search, desktop full layout.

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { Search, Bell, Menu, X } from "lucide-react" // Icon library
import Button from "../Button"
import Input from "../Input"
import { logout } from "../../store/slices/authSlice.js"
import { logoutUser } from "../../api/authApi"
import toast from "react-hot-toast"

const Header = () => {
    // State management
    const [showMobileMenu, setShowMobileMenu] = useState(false) // Toggles mobile menu
    const [searchQuery, setSearchQuery] = useState("") // Stores search input

    // Hooks
    const navigate = useNavigate() // Programmatic navigation (e.g., navigate("/home"))
    const location = useLocation() // Current URL path
    const dispatch = useDispatch() // Dispatches Redux actions
    const { user } = useSelector((state) => state.auth) // Gets logged-in user from Redux

    // Conditionally show search bar only on specific pages
    const showSearchBar = ["/", "/discover", "/search"].some(
        (path) => location.pathname === path
    )
}

/**
 * SEARCH HANDLER
 * Submits search query and navigates to /search?q=<query>
 * encodeURIComponent prevents special characters from breaking the URL
 */
const handleSearch = (e) => {
    e.preventDefault() // Prevents page reload on form submit
    if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
}

/**
 * LOGOUT HANDLER
 * Multi-step logout process:
 * 1. Call backend API to invalidate session/tokens
 * 2. Remove access token from browser storage
 * 3. Update Redux state (user = null, isAuthenticated = false)
 * 4. Redirect to login page
 */
const handleLogout = async () => {
    try {
        await logoutUser() // Backend API call
        localStorage.removeItem("accessToken")
        dispatch(logout()) // Updates Redux state
        toast.success("Logged out successfully")
        navigate("/login")
    } catch (error) {
        toast.error("Logout failed")
    }
}

return (
    // Sticky header: stays at top while scrolling, semi-transparent with blur effect
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
                {/* LOGO & MOBILE MENU TOGGLE */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                    >
                        {showMobileMenu ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>

                    <h1
                        onClick={() => navigate("/")}
                        className="text-xl sm:text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer select-none"
                    >
                        VidNest
                    </h1>
                </div>

                {/* SEARCH BAR - Hidden on mobile, shown on md (768px+) screens */}
                {showSearchBar && (
                    <form
                        onSubmit={handleSearch}
                        className="hidden md:flex flex-1 max-w-2xl"
                    >
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search videos, channels, or playlists..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4"
                            />
                        </div>
                    </form>
                )}

                {/* HEADER ACTIONS - Right side icons */}
                <div className="flex items-center gap-2">
                    {/* Mobile search icon - only shows on small screens */}
                    {showSearchBar && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/search")}
                            className="md:hidden"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    )}

                    {/* Notification bell with red dot indicator */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/notifications")}
                        className="relative"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </Button>

                    {/* USER MENU - Avatar with hover dropdown (CSS-only, no JS state) */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100">
                            <img
                                src={
                                    user?.avatar ||
                                    "https://via.placeholder.com/40"
                                }
                                alt={user?.username}
                                className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                            />
                        </button>

                        {/* Dropdown menu - shown on hover via Tailwind's group-hover */}
                        <div className="hidden group-hover:block absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="font-semibold text-sm truncate">
                                    {user?.fullName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    @{user?.username}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    navigate(`/channel/${user?.username}`)
                                }
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                            >
                                Your Channel
                            </button>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => navigate("/settings")}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                            >
                                Settings
                            </button>

                            <hr className="my-2" />

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE SEARCH BAR - Shows below header on small screens */}
            {showSearchBar && (
                <form onSubmit={handleSearch} className="md:hidden mt-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </form>
            )}
        </div>
    </header>
)

export default Header
