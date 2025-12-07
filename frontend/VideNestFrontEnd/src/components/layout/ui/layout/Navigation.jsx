// ============================================
// NAVIGATION COMPONENT - BOTTOM NAV BAR
// ============================================
// Mobile-first bottom navigation with icon + label buttons.
// Shows active state and handles routing between main pages.

import { useNavigate, useLocation } from "react-router-dom"
import { Home, Search, PlusCircle, Heart, User } from "lucide-react"
import Button from "../Button"

const Navigation = () => {
    const navigate = useNavigate() // Programmatic navigation
    const location = useLocation() // Current route path

    // Navigation items configuration
    // Each item has: unique id, icon component, display label, and route path
    const navItems = [
        { id: "home", icon: Home, label: "Home", path: "/" },
        { id: "discover", icon: Search, label: "Discover", path: "/discover" },
        { id: "upload", icon: PlusCircle, label: "Upload", path: "/upload" },
        { id: "activity", icon: Heart, label: "Activity", path: "/activity" },
        { id: "profile", icon: User, label: "Profile", path: "/profile" },
    ]

    // Checks if current page matches the nav item path
    const isActive = (path) => location.pathname === path

    return (
        // Fixed bottom navigation bar - stays at bottom on scroll
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div className="flex items-center justify-around py-2 px-4">
                {/* Map through nav items to create buttons */}
                {navItems.map((item) => {
                    const Icon = item.icon // Extract icon component
                    const active = isActive(item.path) // Check if this route is active

                    return (
                        <Button
                            key={item.id}
                            variant="ghost"
                            size="sm"
                            // Dynamic styling: blue when active, gray when inactive
                            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 transition-colors ${
                                active ? "text-blue-600" : "text-gray-500"
                            }`}
                            onClick={() => navigate(item.path)}
                        >
                            {/* Icon with fill when active */}
                            <Icon
                                className={`h-6 w-6 ${active ? "fill-blue-600" : ""}`}
                            />
                            <span className="text-xs font-medium">
                                {item.label}
                            </span>
                        </Button>
                    )
                })}
            </div>
        </nav>
    )
}

export default Navigation
