// ============================================
// SIDEBAR COMPONENT - RESPONSIVE NAVIGATION MENU
// ============================================
// Adaptive navigation that changes layout based on screen size.
// Mobile: Bottom horizontal navigation bar with icons
// Desktop: Left vertical sidebar with icons and labels

import { useNavigate, useLocation } from "react-router-dom"
import {
    Home,
    Compass,
    PlusCircle,
    Bell,
    User,
    LogOut,
    ListVideo,
} from "lucide-react"
import { useDispatch } from "react-redux"
import { logout } from "../../../../store/slices/authSlice.js"
import { logoutUser } from "../../../../api/authApi"
import toast from "react-hot-toast"
import logo from "../../../../assets/logo.png"

/**
 * SIDEBAR COMPONENT
 *
 * Purpose:
 * - Provide consistent navigation across all pages
 * - Adapt layout based on screen size (mobile vs desktop)
 * - Highlight current page with visual indicators
 *
 * Responsive Behavior:
 * - Mobile (<768px): Bottom bar, icons only, 5 items
 * - Tablet (768-1280px): Left sidebar, icons only, compact
 * - Desktop (>1280px): Left sidebar, icons + labels, expanded
 *
 * Navigation Items:
 * - Home: Video feed and discover
 * - Discover: Trending and categories
 * - Playlists: Organized video collections
 * - Create: Upload videos or tweets
 * - Activity: Notifications and subscriptions
 * - Profile: User account and settings
 *
 * Active State Indicators:
 * - Mobile: Red pulse line at top of icon
 * - Desktop: Red background, bouncing icon
 *
 * Design Pattern:
 * - Bottom bar on mobile (easier thumb reach)
 * - Left sidebar on desktop (standard convention)
 * - Smooth transitions and hover effects
 * - Fixed positioning (always visible)
 */

const Sidebar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const navItems = [
        { id: "home", icon: Home, label: "Home", path: "/" },
        { id: "discover", icon: Compass, label: "Discover", path: "/discover" },
        {
            id: "playlists",
            icon: ListVideo,
            label: "Playlists",
            path: "/playlists",
        },
        { id: "upload", icon: PlusCircle, label: "Create", path: "/upload" },
        { id: "activity", icon: Bell, label: "Activity", path: "/activity" },
        { id: "profile", icon: User, label: "Profile", path: "/profile" },
    ]

    const isActive = (path) => location.pathname === path

    const handleLogout = async () => {
        try {
            await logoutUser()
            // localStorage.removeItem("accessToken") removing cuz we will use the cookies only
            dispatch(logout())
            toast.success("Logged out successfully")
            navigate("/login")
        } catch (error) {
            toast.error("Logout failed")
        }
    }

    return (
        <>
            {/* MOBILE NAVIGATION - Bottom Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1E2021] border-t border-[#2A2D2E] flex items-center justify-around px-2 z-50 shadow-lg backdrop-blur-sm">
                {navItems
                    .filter((item) => item.id !== "playlists") // Exclude playlists from mobile nav (it's in header)
                    .map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.path)

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                                    active ? "text-red-600" : "text-gray-400"
                                }`}
                            >
                                {/* Active Indicator */}
                                {active && (
                                    <div className="absolute -top-1 inset-x-0 mx-auto w-10 h-1 bg-red-600 rounded-full animate-pulse" />
                                )}
                                <Icon
                                    className={`h-6 w-6 transition-all duration-300 ${active ? "animate-bounce" : ""}`}
                                    strokeWidth={active ? 2.5 : 2}
                                />
                                <span
                                    className={`text-[10px] font-medium transition-all duration-300 ${active ? "text-red-600 font-semibold" : "text-gray-400"}`}
                                >
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
            </nav>

            {/* DESKTOP NAVIGATION - Left Sidebar */}
            <aside className="hidden md:flex fixed left-0 top-0 h-screen w-20 xl:w-64 bg-[#1E2021] border-r border-[#2A2D2E] flex-col items-center xl:items-start py-6 z-50 shadow-sm">
                {/* LOGO */}
                <div
                    onClick={() => navigate("/")}
                    className="mb-8 pl-0 xl:pl-6 pr-0 xl:pr-4 cursor-pointer group w-full flex justify-center xl:justify-start"
                >
                    {/* Mobile/Tablet Logo (Icon Only) */}
                    <div className="xl:hidden transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 rounded-full overflow-hidden">
                        <img
                            src={logo}
                            alt="Viewly"
                            className="h-10 w-10 object-cover rounded-full"
                        />
                    </div>

                    {/* Desktop Logo (Icon + Text) */}
                    <div className="hidden xl:flex items-center gap-2 transition-all duration-300 group-hover:scale-105">
                        <img
                            src={logo}
                            alt="Viewly"
                            className="h-8 w-8 object-cover rounded-full"
                        />
                        <h1 className="text-2xl font-bold text-red-600 tracking-tight">
                            Viewly
                        </h1>
                    </div>
                </div>

                {/* NAVIGATION LINKS */}
                <nav className="flex-1 w-full px-3 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.path)

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`relative w-full flex items-center justify-center xl:justify-start gap-4 p-3 rounded-full transition-all duration-300 group transform hover:scale-105 active:scale-95
                                    ${active ? "bg-red-600 text-white shadow-lg shadow-red-500/30" : "text-gray-500 hover:bg-[#2A2D2E] hover:text-white"}
                                `}
                            >
                                <Icon
                                    className={`h-6 w-6 transition-all duration-300 ${active ? "scale-110" : "group-hover:scale-125 group-hover:rotate-12"}`}
                                    strokeWidth={2.5}
                                />
                                <span
                                    className={`hidden xl:block font-semibold text-base transition-all duration-300 ${active ? "text-white" : "text-gray-500 group-hover:text-white"}`}
                                >
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
                </nav>

                {/* BOTTOM ACTIONS */}
                <div className="w-full px-3 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center xl:justify-start gap-4 p-3 rounded-full text-gray-400 hover:bg-red-600/10 hover:text-red-600 transition-all duration-300 group transform hover:scale-105 active:scale-95"
                    >
                        <LogOut
                            className="h-6 w-6 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110"
                            strokeWidth={2.5}
                        />
                        <span className="hidden xl:block font-semibold text-base transition-all duration-300">
                            Log out
                        </span>
                    </button>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
