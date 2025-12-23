// ============================================
// NOTIFICATION BELL COMPONENT
// ============================================
// Displays notification bell icon with unread count badge and dropdown

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import { useSelector } from "react-redux"
import { getNotifications } from "../../api/notificationApi"
import NotificationDropdown from "./NotificationDropdown"

const NotificationBell = () => {
    const { user } = useSelector((state) => state.auth)
    const [unreadCount, setUnreadCount] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)
    const [notifications, setNotifications] = useState([])
    const dropdownRef = useRef(null)

    // Fetch initial notification count
    useEffect(() => {
        if (user) {
            fetchNotificationCount()

            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotificationCount, 30000)

            return () => clearInterval(interval)
        }
    }, [user])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false)
            }
        }

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showDropdown])

    const fetchNotificationCount = async () => {
        try {
            const data = await getNotifications({ page: 1, limit: 5 })
            setUnreadCount(data?.data?.unreadCount || 0)
            setNotifications(data?.data?.notifications || [])
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
        }
    }

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown)
    }

    const handleNotificationUpdate = () => {
        // Refresh notifications when one is marked as read
        fetchNotificationCount()
    }

    if (!user) return null

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-full hover:bg-white/10"
                aria-label="Notifications"
            >
                <Bell size={24} />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full transform translate-x-1/4 -translate-y-1/4">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <NotificationDropdown
                    notifications={notifications}
                    onClose={() => setShowDropdown(false)}
                    onUpdate={handleNotificationUpdate}
                />
            )}
        </div>
    )
}

export default NotificationBell
