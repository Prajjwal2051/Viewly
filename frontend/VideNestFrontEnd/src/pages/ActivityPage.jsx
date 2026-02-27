// ============================================
// ACTIVITY PAGE - NOTIFICATIONS & ACTIVITY
// ============================================
// Show user activity feed, notifications, and latest content from subscriptions

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import { getAllVideos } from "../api/videoApi"
import { getSubscribedChannels } from "../api/subscriptionApi"
import VideoCard from "../components/video/VideoCard"
import TweetList from "../components/tweet/TweetList"
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../api/notificationApi"
import {
    Bell,
    Video as VideoIcon,
    Users,
    Loader2,
    Heart,
    MessageSquare,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import toast from "react-hot-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"

const ActivityPage = () => {
    const { user } = useSelector((state) => state.auth)
    const navigate = useNavigate()
    const location = useLocation()

    const [loading, setLoading] = useState(true)
    const [subscriptionUpdates, setSubscriptionUpdates] = useState([])
    const [recentVideos, setRecentVideos] = useState([])
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    const fetchNotifications = async () => {
        try {
            const response = await getNotifications()
            setNotifications(response.data.notifications || [])
            setUnreadCount(response.data.unreadCount || 0)
        } catch (error) {
            console.error("Failed to load notifications", error)
        }
    }

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markAsRead(notificationId)
            setNotifications((prev) =>
                prev.map((n) =>
                    n._id === notificationId
                        ? { ...n, isRead: true, readAt: new Date() }
                        : n
                )
            )
            setUnreadCount((prev) => Math.max(0, prev - 1))
            toast.success("Marked as read")
        } catch (error) {
            toast.error("Failed to mark as read")
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead()
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
            )
            setUnreadCount(0)
            toast.success("All marked as read")
        } catch (error) {
            toast.error("Failed to mark all as read")
        }
    }

    const handleDeleteNotification = async (notificationId) => {
        try {
            await deleteNotification(notificationId)
            setNotifications((prev) =>
                prev.filter((n) => n._id !== notificationId)
            )
            toast.success("Notification deleted")
        } catch (error) {
            toast.error("Failed to delete notification")
        }
    }

    useEffect(() => {
        const fetchUpdates = async () => {
            if (!user) {
                navigate("/login")
                return
            }

            try {
                setLoading(true)

                // Fetch all videos
                const response = await getAllVideos()
                const allVideos = response.data?.videos || response.videos || []

                // Get subscribed channels (if API available)
                try {
                    const subs = await getSubscribedChannels(user._id)
                    const channelIds = subs
                        .map((s) => s.channel?._id || s.channel)
                        .filter(Boolean)

                    // Filter videos from subscribed channels
                    const subVideos = allVideos.filter((v) =>
                        channelIds.includes(v.owner?._id || v.owner)
                    )

                    setSubscriptionUpdates(subVideos.slice(0, 8))
                } catch (error) {
                    console.log(
                        "Subscriptions not available, showing recent instead"
                    )
                    setSubscriptionUpdates([])
                }

                // Get recent videos (last 10)
                const recent = [...allVideos]
                    .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    .slice(0, 10)

                setRecentVideos(recent)
            } catch (error) {
                console.error("Failed to load updates:", error)
                toast.error("Failed to load updates")
            } finally {
                setLoading(false)
            }
        }

        fetchUpdates()
        fetchNotifications()
    }, [user, navigate])

    return (
        <div className="min-h-screen bg-[#1E2021] text-white pt-6 pb-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Bell className="text-red-500" size={36} />
                        Activity
                    </h1>
                    <p className="text-gray-400">
                        Stay updated with latest activity and new content
                    </p>
                </div>

                {/* Latest from Subscriptions */}
                {subscriptionUpdates.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Users className="text-red-500" size={28} />
                            Latest from Subscriptions
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {subscriptionUpdates.map((video) => (
                                <VideoCard key={video._id} video={video} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Tweets Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <MessageSquare className="text-red-500" size={28} />
                        Recent Tweets
                    </h2>
                    <TweetList limit={5} />
                </div>

                {/* Recent Activity */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <VideoIcon className="text-red-500" size={28} />
                        Recent Uploads
                    </h2>

                    {recentVideos.length > 0 ? (
                        <div className="space-y-4">
                            {recentVideos.map((video) => (
                                <div
                                    key={video._id}
                                    onClick={() =>
                                        navigate(`/video/${video._id}`, {
                                            state: { background: location },
                                        })
                                    }
                                    className="flex gap-4 p-4 bg-[#2A2D2E]/50 rounded-xl border border-[#2A2D2E] hover:bg-[#2A2D2E]/50 transition-colors cursor-pointer"
                                >
                                    {/* Thumbnail Icon Replacement */}
                                    <div className="w-32 sm:w-56 h-20 sm:h-32 bg-[#1E2021] border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <VideoIcon
                                            className="text-red-500"
                                            size={32}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-2 mb-2 break-words">
                                            {video.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-1 flex-wrap">
                                            <span className="truncate max-w-[120px] sm:max-w-none">
                                                {video.owner?.username ||
                                                    "Unknown"}
                                            </span>
                                            <span>•</span>
                                            <span className="whitespace-nowrap">
                                                {video.views || 0} views
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            {formatDistanceToNow(
                                                new Date(video.createdAt),
                                                { addSuffix: true }
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-[#2A2D2E]/30 rounded-xl">
                            <VideoIcon
                                className="mx-auto mb-4 text-gray-500"
                                size={48}
                            />
                            <p className="text-gray-500">No recent activity</p>
                        </div>
                    )}
                </div>

                {/* Notifications Placeholder */}
                {/* Notifications Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Bell className="text-red-500" size={28} />
                            Notifications
                            {unreadCount > 0 && (
                                <span className="text-sm bg-red-600 text-white px-2 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </h2>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {notifications.length > 0 ? (
                        <ScrollArea className="max-h-[600px] pr-2">
                            <div className="space-y-4">
                                {notifications.map((notification) => {
                                    let Icon = Bell
                                    let iconColor = "text-gray-400"
                                    let content = notification.message

                                    switch (notification.type) {
                                        case "LIKE":
                                            Icon = Heart
                                            iconColor = "text-red-500"
                                            break
                                        case "COMMENT":
                                            Icon = MessageSquare
                                            iconColor = "text-blue-500"
                                            break
                                        case "SUBSCRIPTION":
                                            Icon = Users
                                            iconColor = "text-green-500"
                                            break
                                        case "VIDEO_UPLOAD":
                                            Icon = VideoIcon
                                            iconColor = "text-purple-500"
                                            break
                                    }

                                    return (
                                        <div
                                            key={notification._id}
                                            className={`flex gap-4 p-4 rounded-xl border transition-colors ${
                                                notification.isRead
                                                    ? "bg-[#1E2021] border-[#2A2D2E]"
                                                    : "bg-[#2A2D2E]/50 border-red-500/20"
                                            }`}
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-[#2A2D2E] ${iconColor}`}
                                            >
                                                <Icon size={20} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className="text-gray-200 text-sm sm:text-base">
                                                        <span className="font-semibold text-white">
                                                            {notification.sender
                                                                ?.username ||
                                                                "Someone"}
                                                        </span>{" "}
                                                        {content}
                                                    </p>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={() =>
                                                                    handleMarkAsRead(
                                                                        notification._id
                                                                    )
                                                                }
                                                                className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2A2D2E] rounded-lg transition-colors"
                                                                title="Mark as read"
                                                            >
                                                                <span className="text-xs">
                                                                    Read
                                                                </span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteNotification(
                                                                    notification._id
                                                                )
                                                            }
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-[#2A2D2E] rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <span className="text-xs">
                                                                Delete
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Optional related content preview */}
                                                {notification.video && (
                                                    <div className="mt-2 text-sm text-gray-400 bg-[#1E2021] p-2 rounded-lg flex items-center gap-2">
                                                        <VideoIcon size={14} />
                                                        <span className="truncate">
                                                            {
                                                                notification
                                                                    .video.title
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {notification.comment && (
                                                    <div className="mt-2 text-sm text-gray-400 italic border-l-2 border-gray-600 pl-2">
                                                        "
                                                        {
                                                            notification.comment
                                                                .content
                                                        }
                                                        "
                                                    </div>
                                                )}

                                                <p className="text-xs text-gray-500 mt-2">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            notification.createdAt
                                                        ),
                                                        { addSuffix: true }
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="text-center py-12 bg-[#2A2D2E]/30 rounded-xl">
                            <Bell
                                className="mx-auto mb-4 text-gray-500"
                                size={48}
                            />
                            <p className="text-gray-500">
                                No notifications yet
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                                You'll be notified about likes, comments, and
                                new subscribers
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ActivityPage
