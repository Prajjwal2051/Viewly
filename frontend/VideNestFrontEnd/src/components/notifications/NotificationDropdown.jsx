// ============================================
// NOTIFICATION DROPDOWN COMPONENT
// ============================================
// Displays recent notifications in a dropdown menu

import { useNavigate } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle, UserPlus, Video, Check, X } from "lucide-react"
import {
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "../../api/notificationApi"
import toast from "react-hot-toast"

const NotificationDropdown = ({ notifications, onClose, onUpdate }) => {
    const navigate = useNavigate()

    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read if not already
            if (!notification.isRead) {
                await markNotificationAsRead(notification._id)
                onUpdate()
            }

            // Navigate to content based on notification type
            if (notification.video) {
                navigate(`/video/${notification.video._id}`)
            } else if (notification.comment) {
                // Navigate to the video/tweet with comment
                if (notification.video) {
                    navigate(`/video/${notification.video._id}`)
                }
            }

            onClose()
        } catch (error) {
            console.error("Failed to handle notification click:", error)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead()
            toast.success("All notifications marked as read")
            onUpdate()
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
            onUpdate()
        } catch (error) {
            console.error("Failed to delete notification:", error)
            toast.error("Failed to delete")
        }
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case "like":
                return <Heart size={18} className="text-red-500" />
            case "comment":
                return <MessageCircle size={18} className="text-blue-500" />
            case "subscribe":
                return <UserPlus size={18} className="text-green-500" />
            case "upload":
                return <Video size={18} className="text-purple-500" />
            default:
                return <Check size={18} className="text-gray-500" />
        }
    }

    const getNotificationMessage = (notification) => {
        const senderName =
            notification.sender?.fullName ||
            notification.sender?.username ||
            "Someone"

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
        <div className="absolute right-0 mt-2 w-96 bg-[#1E2021] border border-gray-700 rounded-lg shadow-2xl z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">
                    Notifications
                </h3>
                {notifications.length > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Check size={48} className="mb-2 opacity-50" />
                        <p>No notifications</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() =>
                                handleNotificationClick(notification)
                            }
                            className={`flex items-start gap-3 p-4 border-b border-gray-800 hover:bg-white/5 cursor-pointer transition-colors group ${
                                !notification.isRead ? "bg-blue-500/5" : ""
                            }`}
                        >
                            {/* Icon */}
                            <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p
                                    className={`text-sm ${!notification.isRead ? "text-white font-medium" : "text-gray-300"}`}
                                >
                                    {getNotificationMessage(notification)}
                                </p>

                                {notification.video && (
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                        {notification.video.title}
                                    </p>
                                )}

                                <p className="text-xs text-gray-500 mt-1">
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
                                className="flex-shrink-0 p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete notification"
                            >
                                <X size={16} />
                            </button>

                            {/* Unread Indicator */}
                            {!notification.isRead && (
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-700 text-center">
                    <button
                        onClick={() => {
                            navigate("/notifications")
                            onClose()
                        }}
                        className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
                    >
                        View all notifications
                    </button>
                </div>
            )}
        </div>
    )
}

export default NotificationDropdown
