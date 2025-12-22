// ============================================
// NOTIFICATIONS PAGE
// ============================================
// Full-page view of all notifications with filtering and pagination

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import {
    Bell,
    Heart,
    MessageCircle,
    UserPlus,
    Video,
    Check,
    Trash2,
    Filter,
} from "lucide-react"
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "../api/notificationApi"
import toast from "react-hot-toast"
import {
    sanitizeVideoTitle,
    sanitizeComment,
    sanitizeDisplayName,
} from "../utils/sanitize"

const NotificationsPage = () => {
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("all") // 'all', 'unread', 'read'
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalNotifications: 0,
    })
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        fetchNotifications()
    }, [filter, pagination.currentPage])

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const params = {
                page: pagination.currentPage,
                limit: 20,
            }

            if (filter === "unread") {
                params.isRead = false
            } else if (filter === "read") {
                params.isRead = true
            }

            const data = await getNotifications(params)
            setNotifications(data.data.notifications || [])
            setPagination(data.data.pagination || {})
            setUnreadCount(data.data.unreadCount || 0)
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
            toast.error("Failed to load notifications")
        } finally {
            setLoading(false)
        }
    }

    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read if not already
            if (!notification.isRead) {
                await markNotificationAsRead(notification._id)
                fetchNotifications()
            }

            // Navigate to content
            if (notification.video) {
                navigate(`/video/${notification.video._id}`)
            }
        } catch (error) {
            console.error("Failed to handle notification click:", error)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead()
            toast.success("All notifications marked as read")
            fetchNotifications()
        } catch (error) {
            console.error("Failed to mark all as read:", error)
            toast.error("Failed to mark all as read")
        }
    }

    const handleDeleteNotification = async (e, notificationId) => {
        e.stopPropagation()
        try {
            await deleteNotification(notificationId)
            toast.success("Notification deleted")
            fetchNotifications()
        } catch (error) {
            console.error("Failed to delete notification:", error)
            toast.error("Failed to delete")
        }
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case "like":
                return <Heart size={20} className="text-red-500" />
            case "comment":
                return <MessageCircle size={20} className="text-blue-500" />
            case "subscribe":
                return <UserPlus size={20} className="text-green-500" />
            case "upload":
                return <Video size={20} className="text-purple-500" />
            default:
                return <Check size={20} className="text-gray-500" />
        }
    }

    const getNotificationMessage = (notification) => {
        const senderName = sanitizeDisplayName(
            notification.sender?.fullName ||
                notification.sender?.username ||
                "Someone"
        )

        switch (notification.type) {
            case "like":
                return `${senderName} liked your video`
            case "comment":
                return `${senderName} commented on your video`
            case "subscribe":
                return `${senderName} subscribed to your channel`
            case "upload":
                return `${senderName} uploaded a new video`
            default:
                return notification.message || "New notification"
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Bell size={32} className="text-white" />
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Notifications
                        </h1>
                        {unreadCount > 0 && (
                            <p className="text-sm text-gray-400">
                                {unreadCount} unread
                            </p>
                        )}
                    </div>
                </div>

                {notifications.length > 0 && unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-700">
                {["all", "unread", "read"].map((filterType) => (
                    <button
                        key={filterType}
                        onClick={() => {
                            setFilter(filterType)
                            setPagination({ ...pagination, currentPage: 1 })
                        }}
                        className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                            filter === filterType
                                ? "text-white border-red-600"
                                : "text-gray-400 border-transparent hover:text-white"
                        }`}
                    >
                        {filterType}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Bell size={64} className="mb-4 opacity-50" />
                    <p className="text-lg">No notifications yet</p>
                    <p className="text-sm mt-2">
                        {filter === "unread" &&
                            "You have no unread notifications"}
                        {filter === "read" && "You have no read notifications"}
                        {filter === "all" &&
                            "We'll notify you when something happens"}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() =>
                                handleNotificationClick(notification)
                            }
                            className={`flex items-start gap-4 p-4 bg-[#1E2021] hover:bg-[#252829] rounded-lg cursor-pointer transition-all group ${
                                !notification.isRead
                                    ? "border-l-4 border-blue-500"
                                    : ""
                            }`}
                        >
                            {/* Icon */}
                            <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                            </div>

                            {/* Avatar */}
                            {notification.sender?.avatar && (
                                <img
                                    src={notification.sender.avatar}
                                    alt={notification.sender.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p
                                    className={`text-base ${!notification.isRead ? "text-white font-medium" : "text-gray-300"}`}
                                >
                                    {getNotificationMessage(notification)}
                                </p>

                                {notification.video && (
                                    <p className="text-sm text-gray-500 mt-1 truncate">
                                        {sanitizeVideoTitle(
                                            notification.video.title
                                        )}
                                    </p>
                                )}

                                {notification.comment && (
                                    <p className="text-sm text-gray-400 mt-2 italic">
                                        "
                                        {sanitizeComment(
                                            notification.comment.content
                                        )}
                                        "
                                    </p>
                                )}

                                <p className="text-sm text-gray-500 mt-2">
                                    {formatDistanceToNow(
                                        new Date(notification.createdAt),
                                        { addSuffix: true }
                                    )}
                                </p>
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={(e) =>
                                    handleDeleteNotification(
                                        e,
                                        notification._id
                                    )
                                }
                                className="flex-shrink-0 p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                                title="Delete notification"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() =>
                            setPagination({
                                ...pagination,
                                currentPage: pagination.currentPage - 1,
                            })
                        }
                        disabled={!pagination.hasPrevPage}
                        className="px-4 py-2 bg-[#1E2021] text-white rounded-lg hover:bg-[#252829] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <span className="text-gray-400">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <button
                        onClick={() =>
                            setPagination({
                                ...pagination,
                                currentPage: pagination.currentPage + 1,
                            })
                        }
                        disabled={!pagination.hasNextPage}
                        className="px-4 py-2 bg-[#1E2021] text-white rounded-lg hover:bg-[#252829] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

export default NotificationsPage
