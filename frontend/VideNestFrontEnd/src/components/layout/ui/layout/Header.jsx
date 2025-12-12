// ============================================
// HEADER COMPONENT - NAVIGATION BAR
// ============================================
// Sticky top navigation with search, notifications, and user menu.
// Pinterest Theme: White background, Pinterest red accents

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { Search, Bell } from "lucide-react"
import Button from "../Button"
import Input from "../Input"
import { logout } from "../../../../store/slices/authSlice.js"
import { logoutUser } from "../../../../api/authApi"
import toast from "react-hot-toast"

const Header = () => {
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    const showSearchBar =
        ["/", "/discover", "/search"].some((path) =>
            location.pathname.startsWith(path)
        ) || location.pathname.startsWith("/video/")

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    const handleLogout = async () => {
        try {
            await logoutUser()
            localStorage.removeItem("accessToken")
            dispatch(logout())
            toast.success("Logged out successfully")
            navigate("/login")
        } catch (error) {
            toast.error("Logout failed")
        }
    }

    return (
        <header className="sticky top-0 z-40 bg-[#1E2021] border-b border-[#2A2D2E] py-3 shadow-sm">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    {/* SEARCH BAR */}
                    <div className="flex-1 max-w-3xl">
                        {showSearchBar ? (
                            <form onSubmit={handleSearch} className="w-full">
                                <div className="relative w-full group">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-red-600 transition-all duration-300 group-hover:scale-110" />
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="w-full pl-12 pr-4 py-3 bg-[#2A2D2E] border border-[#2A2D2E] rounded-full focus:bg-[#1E2021] focus:border-red-600 focus:ring-2 focus:ring-red-500/20 text-white placeholder-gray-500 transition-all duration-300 hover:bg-[#2A2D2E] focus:scale-105"
                                    />
                                </div>
                            </form>
                        ) : (
                            <div className="h-12"></div>
                        )}
                    </div>

                    {/* HEADER ACTIONS */}
                    <div className="flex items-center gap-3">
                        {/* Notification bell */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/activity")}
                            className="relative hover:bg-[#2A2D2E] rounded-full h-12 w-12 group transition-all duration-300 hover:scale-110 active:scale-95"
                        >
                            <Bell className="h-6 w-6 text-gray-500 group-hover:text-red-600 transition-all duration-300 group-hover:animate-pulse" />
                            <span className="absolute top-3 right-3 h-2 w-2 bg-red-600 rounded-full border-2 border-[#1E2021] animate-pulse"></span>
                        </Button>

                        {/* USER MENU */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 p-1 rounded-full hover:bg-[#2A2D2E] focus:outline-none transition-all duration-300 group"
                            >
                                <img
                                    src={
                                        user?.avatar ||
                                        "https://via.placeholder.com/40"
                                    }
                                    alt={user?.username}
                                    className="h-10 w-10 rounded-full object-cover border-2 border-[#2A2D2E] transition-all duration-300 group-hover:scale-110 group-hover:border-red-600 group-hover:rotate-6"
                                />
                            </button>

                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowUserMenu(false)}
                                    ></div>

                                    <div className="absolute right-0 mt-2 w-64 bg-[#1E2021] rounded-2xl shadow-xl border border-[#2A2D2E] py-2 z-20 animate-in slide-in-from-top-2 duration-300">
                                        <div className="px-4 py-4 border-b border-[#2A2D2E]">
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
                                                className="w-full text-left px-4 py-3 hover:bg-[#2A2D2E] rounded-xl font-medium text-gray-500 hover:text-white transition-all duration-300 transform hover:scale-105 hover:translate-x-1"
                                            >
                                                Your Channel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigate("/dashboard")
                                                    setShowUserMenu(false)
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-[#2A2D2E] rounded-xl font-medium text-gray-500 hover:text-white transition-all duration-300 transform hover:scale-105 hover:translate-x-1"
                                            >
                                                Studio Dashboard
                                            </button>
                                        </div>

                                        <div className="border-t border-[#2A2D2E] p-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-3 hover:bg-red-600/10 rounded-xl font-medium text-red-600 hover:text-red-500 transition-all duration-300 transform hover:scale-105 hover:translate-x-1"
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
