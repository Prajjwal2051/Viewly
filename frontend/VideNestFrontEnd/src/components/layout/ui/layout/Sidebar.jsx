// ============================================
// SIDEBAR COMPONENT - LEFT NAVIGATION
// ============================================
// Pinterest-style left sidebar navigation.
// Includes logo and main navigation links.

import { useNavigate, useLocation } from "react-router-dom"
import { Home, Compass, PlusCircle, Heart, User, LogOut } from "lucide-react"
import { useDispatch } from "react-redux"
import { logout } from "../../../../store/slices/authSlice.js"
import { logoutUser } from "../../../../api/authApi"
import toast from "react-hot-toast"

const Sidebar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const navItems = [
        { id: "home", icon: Home, label: "Home", path: "/" },
        { id: "discover", icon: Compass, label: "Explore", path: "/discover" },
        { id: "upload", icon: PlusCircle, label: "Create", path: "/upload" },
        { id: "activity", icon: Heart, label: "Updates", path: "/activity" },
        { id: "profile", icon: User, label: "Profile", path: "/profile" },
    ]

    const isActive = (path) => location.pathname === path

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
        <aside className="fixed left-0 top-0 h-screen w-20 xl:w-64 bg-black border-r border-gray-800 flex flex-col items-center xl:items-start py-6 z-50">
            {/* LOGO */}
            <div
                onClick={() => navigate("/")}
                className="mb-8 px-4 cursor-pointer"
            >
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-600 text-white font-bold text-xl xl:hidden">
                    V
                </div>
                <h1 className="hidden xl:block text-2xl font-bold text-red-600 tracking-tight">
                    VidNest
                </h1>
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
                            className={`w-full flex items-center justify-center xl:justify-start gap-4 p-3 rounded-full transition-all duration-200 group
                                ${active ? "bg-red-600 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white"}
                            `}
                        >
                            <Icon
                                className={`h-6 w-6 ${active ? "stroke-current" : "stroke-current"} transition-transform group-hover:scale-110`}
                                strokeWidth={2.5}
                            />
                            <span
                                className={`hidden xl:block font-semibold text-base ${active ? "text-white" : "text-gray-400 group-hover:text-white"}`}
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
                    className="w-full flex items-center justify-center xl:justify-start gap-4 p-3 rounded-full text-gray-500 hover:bg-gray-900 hover:text-red-500 transition-colors"
                >
                    <LogOut className="h-6 w-6" strokeWidth={2.5} />
                    <span className="hidden xl:block font-semibold text-base">
                        Log out
                    </span>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
