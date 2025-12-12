// ============================================
// ACTIVITY PAGE - NOTIFICATIONS & ACTIVITY
// ============================================
// Show user activity feed, notifications, and latest content from subscriptions

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { getAllVideos } from "../api/videoApi"
import { getSubscribedChannels } from "../api/subscriptionApi"
import VideoCard from "../components/video/VideoCard"
import TweetList from "../components/tweet/TweetList"
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

const ActivityPage = () => {
    const { user } = useSelector((state) => state.auth)
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [subscriptionUpdates, setSubscriptionUpdates] = useState([])
    const [recentVideos, setRecentVideos] = useState([])

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
    }, [user, navigate])

    return (
        <div className="min-h-screen bg-black text-white pt-6 pb-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Bell className="text-blue-500" size={36} />
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
                            <Users className="text-purple-500" size={28} />
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
                        <MessageSquare className="text-purple-500" size={28} />
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
                                        navigate(`/video/${video._id}`)
                                    }
                                    className="flex gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
                                >
                                    {/* Thumbnail */}
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-40 h-24 object-cover rounded-lg flex-shrink-0"
                                    />

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white line-clamp-2 mb-2">
                                            {video.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                                            <span>
                                                {video.owner?.username ||
                                                    "Unknown"}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                {video.views || 0} views
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
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
                        <div className="text-center py-12 bg-gray-900/30 rounded-xl">
                            <VideoIcon
                                className="mx-auto mb-4 text-gray-700"
                                size={48}
                            />
                            <p className="text-gray-500">No recent activity</p>
                        </div>
                    )}
                </div>

                {/* Notifications Placeholder */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Bell className="text-yellow-500" size={28} />
                        Notifications
                    </h2>
                    <div className="text-center py-12 bg-gray-900/30 rounded-xl">
                        <Bell
                            className="mx-auto mb-4 text-gray-700"
                            size={48}
                        />
                        <p className="text-gray-500">
                            Notification system coming soon!
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            You'll be notified about likes, comments, and new
                            subscribers
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ActivityPage
