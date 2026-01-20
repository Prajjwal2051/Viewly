// ============================================
// NOTIFICATION BELL COMPONENT - NOTIFICATION CENTER TRIGGER
// ============================================
// Displays notification bell icon with unread count badge and dropdown.
// Auto-polls for new notifications every 30 seconds.

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import { useSelector } from "react-redux"
import { getNotifications } from "../../api/notificationApi"
import NotificationDropdown from "./NotificationDropdown"

/**
 * NOTIFICATION BELL COMPONENT
 * 
 * Purpose:
 * - Show notification bell in header
 * - Display unread notification count badge
 * - Open dropdown on click to view notifications
 * 
 * Key Features:
 * - Auto-polling: Checks for new notifications every 30 seconds
 * - Real-time updates: Badge updates when new notifications arrive
 * - Click-outside-to-close: Dropdown closes when clicking elsewhere
 * - Red badge: Shows unread count (only when > 0)
 * 
 * How Auto-Polling Works:
 * 1. Component mounts
 * 2. Fetch initial notification count
 * 3. Set interval to fetch every 30 seconds
 * 4. Update badge when new notifications found
 * 5. Clear interval on unmount (prevent memory leak)
 * 
 * Why Auto-Poll Instead of WebSockets?
 * - Simpler to implement
 * - Works with any backend setup
 * - Less server resources
 * - Good enough for notifications (30s delay acceptable)
 * 
 * UX Design:
 * - Bell icon is always visible in header
 * - Red badge appears when unread notifications exist
 * - Badge shows number (1-9) or "9+" for many
 * - Clicking bell opens dropdown with recent notifications
 */

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
