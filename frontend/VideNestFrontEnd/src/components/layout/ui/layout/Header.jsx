// ============================================
// HEADER COMPONENT - NAVIGATION BAR
// ============================================
// Sticky top navigation with search, notifications, and user menu.
// Responsive design: mobile menu + search, desktop full layout.

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { Search, Bell } from "lucide-react" // Icon library
import Button from "../Button" // Goes up from layout/ to ui/, then Button.jsx
import Input from "../Input" // Goes up from layout/ to ui/, then Input.jsx
import { logout } from "../../../../store/slices/authSlice.js" // Goes up to src/, then into store/
import { logoutUser } from "../../../../api/authApi" // Goes up to src/, then into api/
import toast from "react-hot-toast"

const Header = () => {
    // State management
    const [showUserMenu, setShowUserMenu] = useState(false) // Toggles user dropdown
    const [searchQuery, setSearchQuery] = useState("") // Stores search input

    // Hooks
    const navigate = useNavigate() // Programmatic navigation (e.g., navigate("/home"))
    const location = useLocation() // Current URL path
    const dispatch = useDispatch() // Dispatches Redux actions
    const { user } = useSelector((state) => state.auth) // Gets logged-in user from Redux

    // Conditionally show search bar on specific pages
    const showSearchBar =
        ["/", "/discover", "/search"].some((path) =>
            location.pathname.startsWith(path)
        ) || location.pathname.startsWith("/video/")

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
        // Sticky header: stays at top while scrolling, minimal float
        <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800 py-3">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    {/* SEARCH BAR - Main focus area */}
                    <div className="flex-1 max-w-3xl">
                        {showSearchBar ? (
                            <form onSubmit={handleSearch} className="w-full">
                                <div className="relative w-full group">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-gray-800 rounded-full focus:bg-black focus:border-red-600 focus:ring-1 focus:ring-red-600 text-white placeholder-gray-500 transition-all duration-200 hover:bg-[#1a1a1a]"
                                    />
                                </div>
                            </form>
                        ) : (
                            <div className="h-12"></div> // Spacer to keep layout stable
                        )}
                    </div>

                    {/* HEADER ACTIONS - Right side icons */}
                    <div className="flex items-center gap-3">
                        {/* Notification bell */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/activity")}
                            className="relative hover:bg-gray-900 rounded-full h-12 w-12"
                        >
                            <Bell className="h-6 w-6 text-gray-400 hover:text-white" />
                            <span className="absolute top-3 right-3 h-2 w-2 bg-red-600 rounded-full border-2 border-black"></span>
                        </Button>

                        {/* USER MENU - Avatar with click dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-900 focus:outline-none transition-all"
                            >
                                <img
                                    src={
                                        user?.avatar ||
                                        "https://via.placeholder.com/40"
                                    }
                                    alt={user?.username}
                                    className="h-10 w-10 rounded-full object-cover border border-gray-800"
                                />
                            </button>

                            {/* Dropdown menu - shown on click */}
                            {showUserMenu && (
                                <>
                                    {/* Invisible overlay to close menu when clicking outside */}
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowUserMenu(false)}
                                    ></div>

                                    <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] border border-gray-800 py-2 z-20">
                                        <div className="px-4 py-4 border-b border-gray-800">
                                            <p className="font-bold text-white truncate text-lg">
                                                {user?.fullName}
                                            </p>
                                            <p className="text-sm text-gray-400 truncate">
                                                @{user?.username}
                                            </p>
                                        </div>

                                        <div className="p-2">
                                            <button
                                                onClick={() => {
                                                    navigate(
                                                        `/channel/${user?.username}`
                                                    )
                                                    setShowUserMenu(false)
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded-xl font-medium text-gray-300 hover:text-white transition-colors"
                                            >
                                                Your Channel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigate("/dashboard")
                                                    setShowUserMenu(false)
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded-xl font-medium text-gray-300 hover:text-white transition-colors"
                                            >
                                                Studio Dashboard
                                            </button>
                                        </div>

                                        <div className="border-t border-gray-800 p-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-3 hover:bg-red-900/20 rounded-xl font-medium text-red-500 hover:text-red-400 transition-colors"
                                            >
                                                Log out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
