// ============================================
// DASHBOARD PAGE - CREATOR VIDEO MANAGEMENT
// ============================================
// Allows creators to view and manage their uploaded videos
// Features:
// - Channel statistics (Total Views, Videos, Subscribers)
// - Video management table with edit/delete actions
// - Visual stats cards with icons

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { getAllVideos, deleteVideo, updateVideo } from "../api/videoApi"
import { getUserTweets, deleteTweet, updateTweet } from "../api/tweetApi"
import { getLikedVideos, getLikedTweets } from "../api/likeApi"
import { getChannelStats } from "../api/dashboardApi"
import { getUserChannelProfile } from "../api/userApi"
import {
    getUserChannelSubscribers,
    getSubscribedChannels,
} from "../api/subscriptionApi"
import AnalyticsCharts from "../components/dashboard/AnalyticsCharts"
import GrowthMetrics from "../components/dashboard/GrowthMetrics"
import TopVideoCard from "../components/dashboard/TopVideoCard"
import CountUp from "../components/common/CountUp" // Added import
import {
    BarChart3,
    Video as VideoIcon,
    Users,
    Eye,
    Heart,
    MessageSquare,
    Trash2,
    Edit,
    Loader2,
    X,
    Upload,
} from "lucide-react"
import toast from "react-hot-toast"

const DashboardPage = () => {
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)

    const [stats, setStats] = useState({
        totalVideos: 0,
        totalViews: 0,
        totalSubscribers: 0,
        totalTweets: 0,
    })
    const [videos, setVideos] = useState([])
    const [tweets, setTweets] = useState([])
    const [likedVideos, setLikedVideos] = useState([])
    const [likedTweets, setLikedTweets] = useState([])
    const [subscribers, setSubscribers] = useState([])
    const [subscribedTo, setSubscribedTo] = useState([])
    const [analyticsData, setAnalyticsData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)
    const [editingItem, setEditingItem] = useState(null) // { type: 'video'|'tweet', data: ... }
    const [activeTab, setActiveTab] = useState("myVideos") // 'myVideos', 'myTweets', 'likedVideos', 'likedTweets'

    useEffect(() => {
        if (!user) {
            navigate("/login")
            return
        }
        fetchDashboardData()
    }, [user, navigate])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch all videos and filter by current user
            const response = await getAllVideos()
            const allVideos = response.data?.videos || response.videos || []

            // Filter user's videos
            const userVideos = allVideos.filter(
                (v) => v.owner?._id === user._id || v.owner === user._id
            )

            setVideos(userVideos)

            // Calculate stats
            const totalViews = userVideos.reduce(
                (sum, video) => sum + (video.views || 0),
                0
            )

            // Fetch user channel profile for fresh subscriber count
            const channelProfile = await getUserChannelProfile(user.username)
            const subscriberCount =
                channelProfile.data?.subscribersCount ||
                channelProfile.subscribersCount ||
                user.subscribersCount ||
                0

            // Fetch user tweets
            const tweetsResponse = await getUserTweets(user._id)
            const userTweets = tweetsResponse.data || tweetsResponse || []
            setTweets(userTweets)

            setStats({
                totalVideos: userVideos.length,
                totalViews,
                totalSubscribers: subscriberCount,
                totalTweets: userTweets.length,
            })

            // Fetch subscribers
            try {
                const subscribersResponse = await getUserChannelSubscribers(
                    user._id
                )
                setSubscribers(
                    subscribersResponse?.data?.subscribers ||
                        subscribersResponse?.subscribers ||
                        []
                )
            } catch (error) {
                console.error("Failed to fetch subscribers:", error)
            }

            // Fetch subscribed channels
            try {
                const subscribedToResponse = await getSubscribedChannels(
                    user._id
                )
                const subscribedList =
                    subscribedToResponse?.data?.subscribedChannels ||
                    subscribedToResponse?.subscribedChannels ||
                    []
                setSubscribedTo(subscribedList)
            } catch (error) {
                console.error("Failed to fetch subscribed channels:", error)
            }

            // Fetch liked videos
            try {
                const likedVideosResponse = await getLikedVideos()
                console.log("Liked videos response:", likedVideosResponse)
                // Backend returns paginated response: { data: { likedVideos: [...] } }
                const videos =
                    likedVideosResponse?.data?.likedVideos ||
                    likedVideosResponse?.likedVideos ||
                    []
                console.log("Extracted liked videos:", videos)
                setLikedVideos(videos)
            } catch (error) {
                console.error("Failed to fetch liked videos:", error)
                setLikedVideos([])
            }

            // Fetch liked tweets
            try {
                const likedTweetsResponse = await getLikedTweets()
                console.log("Liked tweets response:", likedTweetsResponse)
                // Backend returns paginated response: { data: { likedTweets: [...] } }
                const tweets =
                    likedTweetsResponse?.data?.likedTweets ||
                    likedTweetsResponse?.likedTweets ||
                    []
                console.log("Extracted liked tweets:", tweets)
                setLikedTweets(tweets)
            } catch (error) {
                console.error("Failed to fetch liked tweets:", error)
                setLikedTweets([])
            }

            // Fetch detailed analytics
            try {
                const analyticsResponse = await getChannelStats()
                setAnalyticsData(analyticsResponse.data || analyticsResponse)
            } catch (error) {
                console.error("Failed to fetch analytics:", error)
                // Don't block dashboard load on analytics failure
            }
        } catch (error) {
            console.error("Failed to load dashboard data:", error)
            toast.error("Failed to load dashboard")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (videoId) => {
        if (!window.confirm("Are you sure you want to delete this video?")) {
            return
        }

        setDeleting(videoId)
        try {
            await deleteVideo(videoId)
            setVideos((prev) => prev.filter((v) => v._id !== videoId))
            setStats((prev) => ({
                ...prev,
                totalVideos: prev.totalVideos - 1,
            }))
            toast.success("Video deleted successfully")
        } catch (error) {
            toast.error("Failed to delete video")
        } finally {
            setDeleting(null)
        }
    }

    const handleDeleteTweet = async (tweetId) => {
        if (!window.confirm("Are you sure you want to delete this tweet?")) {
            return
        }

        setDeleting(tweetId)
        try {
            await deleteTweet(tweetId)
            setTweets((prev) => prev.filter((t) => t._id !== tweetId))
            setStats((prev) => ({
                ...prev,
                totalTweets: prev.totalTweets - 1,
            }))
            toast.success("Tweet deleted successfully")
        } catch (error) {
            toast.error("Failed to delete tweet")
        } finally {
            setDeleting(null)
        }
    }

    const handleEdit = (video) => {
        setEditingItem({ type: "video", data: video })
    }

    const handleEditTweet = (tweet) => {
        setEditingItem({ type: "tweet", data: tweet })
    }

    const handleUpdateSuccess = () => {
        setEditingItem(null)
        fetchDashboardData() // Refresh data
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#1E2021]">
                <Loader2 className="w-12 h-12 animate-spin text-red-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1E2021] text-white pt-6 pb-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        Channel Dashboard
                    </h1>
                    <p className="text-gray-400">
                        Manage your videos and track your channel performance
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Videos */}
                    <div className="bg-gradient-to-br from-red-900/20 to-red-600/10 border border-red-800/30 rounded-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20 animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <VideoIcon className="text-red-500" size={32} />
                            <BarChart3 className="text-red-400/30" size={48} />
                        </div>
                        <p className="text-gray-400 text-sm mb-1">
                            Total Videos
                        </p>
                        <h3 className="text-3xl font-bold text-white">
                            <CountUp end={stats.totalVideos} />
                        </h3>
                    </div>

                    {/* Total Views */}
                    <div className="bg-gradient-to-br from-red-900/20 to-red-600/10 border border-red-800/30 rounded-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20 animate-fadeIn [animation-delay:100ms]">
                        <div className="flex items-center justify-between mb-4">
                            <Eye className="text-red-500" size={32} />
                            <BarChart3 className="text-red-400/30" size={48} />
                        </div>
                        <p className="text-gray-400 text-sm mb-1">
                            Total Views
                        </p>
                        <h3 className="text-3xl font-bold text-white">
                            <CountUp end={stats.totalViews} />
                        </h3>
                    </div>

                    {/* Total Subscribers */}
                    <div className="bg-gradient-to-br from-red-900/20 to-red-600/10 border border-red-800/30 rounded-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20 animate-fadeIn [animation-delay:200ms]">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="text-red-500" size={32} />
                            <BarChart3 className="text-red-400/30" size={48} />
                        </div>
                        <p className="text-gray-400 text-sm mb-1">
                            Subscribers
                        </p>
                        <h3 className="text-3xl font-bold text-white">
                            <CountUp end={stats.totalSubscribers} />
                        </h3>
                    </div>

                    {/* Total Tweets */}
                    <div className="bg-gradient-to-br from-red-900/20 to-red-600/10 border border-red-800/30 rounded-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20 animate-fadeIn [animation-delay:300ms]">
                        <div className="flex items-center justify-between mb-4">
                            <MessageSquare className="text-red-500" size={32} />
                            <BarChart3 className="text-red-400/30" size={48} />
                        </div>
                        <p className="text-gray-400 text-sm mb-1">
                            Total Tweets
                        </p>
                        <h3 className="text-3xl font-bold text-white">
                            <CountUp end={stats.totalTweets} />
                        </h3>
                    </div>
                </div>

                {/* Analytics Section */}
                {analyticsData && (
                    <div className="mb-12 animate-fadeIn">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                Channel Analytics
                            </h2>
                            <p className="text-sm text-gray-400">
                                Last 30 Days Performance
                            </p>
                        </div>

                        <GrowthMetrics metrics={analyticsData?.growthMetrics} />

                        <AnalyticsCharts data={analyticsData?.growthMetrics} />

                        {analyticsData?.additionalMetrics?.mostPopularVideo && (
                            <TopVideoCard
                                video={
                                    analyticsData.additionalMetrics
                                        .mostPopularVideo
                                }
                            />
                        )}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab("myVideos")}
                        className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                            activeTab === "myVideos"
                                ? "text-white border-red-600"
                                : "text-gray-400 border-transparent hover:text-white"
                        }`}
                    >
                        My Videos ({stats.totalVideos})
                    </button>
                    <button
                        onClick={() => setActiveTab("myTweets")}
                        className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                            activeTab === "myTweets"
                                ? "text-white border-red-600"
                                : "text-gray-400 border-transparent hover:text-white"
                        }`}
                    >
                        My Tweets ({stats.totalTweets})
                    </button>
                    <button
                        onClick={() => setActiveTab("likedVideos")}
                        className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                            activeTab === "likedVideos"
                                ? "text-white border-red-600"
                                : "text-gray-400 border-transparent hover:text-white"
                        }`}
                    >
                        <Heart size={16} className="inline mr-1" />
                        Liked Videos ({likedVideos.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("likedTweets")}
                        className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                            activeTab === "likedTweets"
                                ? "text-white border-red-600"
                                : "text-gray-400 border-transparent hover:text-white"
                        }`}
                    >
                        <Heart size={16} className="inline mr-1" />
                        Liked Tweets ({likedTweets.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("subscribers")}
                        className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                            activeTab === "subscribers"
                                ? "text-white border-red-600"
                                : "text-gray-400 border-transparent hover:text-white"
                        }`}
                    >
                        <Users size={16} className="inline mr-1" />
                        Subscribers ({subscribers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("subscribedTo")}
                        className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                            activeTab === "subscribedTo"
                                ? "text-white border-red-600"
                                : "text-gray-400 border-transparent hover:text-white"
                        }`}
                    >
                        <Users size={16} className="inline mr-1" />
                        Subscribed To ({subscribedTo.length})
                    </button>
                </div>

                {/* My Videos Section */}
                {activeTab === "myVideos" && (
                    <div className="bg-[#2A2D2E]/50 border border-[#2A2D2E] rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-[#2A2D2E]">
                            <h2 className="text-2xl font-bold">Your Videos</h2>
                        </div>

                        {videos.length === 0 ? (
                            <div className="p-12 text-center">
                                <VideoIcon
                                    className="mx-auto mb-4 text-gray-400"
                                    size={48}
                                />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                    No videos yet
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Upload your first video to get started
                                </p>
                                <button
                                    onClick={() => navigate("/upload")}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition-colors"
                                >
                                    Upload Video
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#2A2D2E]/50">
                                        <tr>
                                            <th className="text-left p-4 font-semibold text-gray-300">
                                                Video
                                            </th>
                                            <th className="text-center p-4 font-semibold text-gray-300">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Eye size={16} />
                                                    Views
                                                </div>
                                            </th>
                                            <th className="text-center p-4 font-semibold text-gray-300">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Heart size={16} />
                                                    Likes
                                                </div>
                                            </th>
                                            <th className="text-center p-4 font-semibold text-gray-300">
                                                Date
                                            </th>
                                            <th className="text-right p-4 font-semibold text-gray-300">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {videos.map((video) => (
                                            <tr
                                                key={video._id}
                                                className="border-b border-[#2A2D2E] hover:bg-[#2A2D2E] transition-colors"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-32 h-20 bg-red-600/10 rounded-lg flex items-center justify-center">
                                                            <VideoIcon
                                                                className="text-red-600"
                                                                size={32}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-white line-clamp-2">
                                                                {video.title}
                                                            </h4>
                                                            <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                                                                {
                                                                    video.description
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center text-gray-300">
                                                    {video.views?.toLocaleString() ||
                                                        0}
                                                </td>
                                                <td className="p-4 text-center text-gray-300">
                                                    {video.likes || 0}
                                                </td>
                                                <td className="p-4 text-center text-gray-400 text-sm">
                                                    {new Date(
                                                        video.createdAt
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(
                                                                    video
                                                                )
                                                            }
                                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                            title="Edit"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    video._id
                                                                )
                                                            }
                                                            disabled={
                                                                deleting ===
                                                                video._id
                                                            }
                                                            className="p-2 hover:bg-red-900/30 rounded-lg transition-colors text-gray-400 hover:text-red-600 disabled:opacity-50"
                                                            title="Delete"
                                                        >
                                                            {deleting ===
                                                            video._id ? (
                                                                <Loader2
                                                                    size={18}
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <Trash2
                                                                    size={18}
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* My Tweets Section */}
                {activeTab === "myTweets" && (
                    <div className="bg-[#2A2D2E]/50 border border-[#2A2D2E] rounded-xl overflow-hidden mt-8">
                        <div className="p-6 border-b border-[#2A2D2E]">
                            <h2 className="text-2xl font-bold">Your Tweets</h2>
                        </div>

                        {tweets.length === 0 ? (
                            <div className="p-12 text-center">
                                <MessageSquare
                                    className="mx-auto mb-4 text-gray-400"
                                    size={48}
                                />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                    No tweets yet
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Post your first tweet to get started
                                </p>
                                <button
                                    onClick={() => navigate("/upload")}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition-colors"
                                >
                                    Post Tweet
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#2A2D2E]/50">
                                        <tr>
                                            <th className="text-left p-4 font-semibold text-gray-300">
                                                Tweet Content
                                            </th>
                                            <th className="text-center p-4 font-semibold text-gray-300">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Heart size={16} />
                                                    Likes
                                                </div>
                                            </th>
                                            <th className="text-center p-4 font-semibold text-gray-300">
                                                Date
                                            </th>
                                            <th className="text-right p-4 font-semibold text-gray-300">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tweets.map((tweet) => (
                                            <tr
                                                key={tweet._id}
                                                className="border-b border-[#2A2D2E] hover:bg-[#2A2D2E] transition-colors"
                                            >
                                                <td className="p-4">
                                                    <h4 className="font-semibold text-white line-clamp-2">
                                                        {tweet.content}
                                                    </h4>
                                                </td>
                                                <td className="p-4 text-center text-gray-300">
                                                    {tweet.likes || 0}
                                                </td>
                                                <td className="p-4 text-center text-gray-400 text-sm">
                                                    {new Date(
                                                        tweet.createdAt
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleEditTweet(
                                                                    tweet
                                                                )
                                                            }
                                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                            title="Edit"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteTweet(
                                                                    tweet._id
                                                                )
                                                            }
                                                            disabled={
                                                                deleting ===
                                                                tweet._id
                                                            }
                                                            className="p-2 hover:bg-red-900/30 rounded-lg transition-colors text-gray-400 hover:text-red-600 disabled:opacity-50"
                                                            title="Delete"
                                                        >
                                                            {deleting ===
                                                            tweet._id ? (
                                                                <Loader2
                                                                    size={18}
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <Trash2
                                                                    size={18}
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Liked Videos Section */}
                {activeTab === "likedVideos" && (
                    <div className="bg-[#2A2D2E]/50 border border-[#2A2D2E] rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-[#2A2D2E]">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Heart size={28} className="text-red-500" />
                                Liked Videos
                            </h2>
                        </div>

                        {likedVideos.length === 0 ? (
                            <div className="p-12 text-center">
                                <Heart
                                    className="mx-auto mb-4 text-gray-400"
                                    size={48}
                                />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                    No liked videos yet
                                </h3>
                                <p className="text-gray-500">
                                    Videos you like will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 p-6">
                                {likedVideos.map((item) => {
                                    // Handle structure: backend returns video details inside videoDetails
                                    const video =
                                        item.videoDetails || item.video || item
                                    if (!video._id) return null

                                    return (
                                        <div
                                            key={video._id}
                                            className="bg-[#1E2021] rounded-lg p-4 flex items-center gap-4 hover:bg-[#2A2D2E] transition-colors"
                                        >
                                            <div className="flex-shrink-0 w-32 h-20 bg-[#2A2D2E] rounded flex items-center justify-center">
                                                <VideoIcon
                                                    size={32}
                                                    className="text-red-500"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-medium truncate mb-1">
                                                    {video.title}
                                                </h4>
                                                <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                                                    {video.description}
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                    {video.views?.toLocaleString() ||
                                                        0}{" "}
                                                    views
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Liked Tweets Section */}
                {activeTab === "likedTweets" && (
                    <div className="bg-[#2A2D2E]/50 border border-[#2A2D2E] rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-[#2A2D2E]">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Heart size={28} className="text-red-500" />
                                Liked Tweets
                            </h2>
                        </div>

                        {likedTweets.length === 0 ? (
                            <div className="p-12 text-center">
                                <Heart
                                    className="mx-auto mb-4 text-gray-400"
                                    size={48}
                                />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                    No liked tweets yet
                                </h3>
                                <p className="text-gray-500">
                                    Tweets you like will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                                {likedTweets.map((item) => {
                                    const tweet =
                                        item.tweetDetails || item.tweet || item
                                    const owner =
                                        item.ownerDetails || tweet.owner || {}
                                    if (!tweet._id) return null

                                    return (
                                        <div
                                            key={tweet._id}
                                            className="bg-[#1E2021] rounded-lg p-4 hover:bg-[#2A2D2E] transition-colors"
                                        >
                                            {tweet.image && (
                                                <img
                                                    src={tweet.image}
                                                    alt="Tweet"
                                                    className="w-full h-48 object-cover rounded-lg mb-3"
                                                />
                                            )}
                                            <p className="text-white line-clamp-3 mb-3">
                                                {tweet.content}
                                            </p>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm text-gray-300">
                                                    @{owner?.username}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Heart size={16} />
                                                    {tweet.likes || 0}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Subscribers Section */}
                {activeTab === "subscribers" && (
                    <div className="bg-[#2A2D2E]/50 border border-[#2A2D2E] rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-[#2A2D2E]">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Users size={28} className="text-red-500" />
                                Subscribers
                            </h2>
                        </div>

                        {subscribers.length === 0 ? (
                            <div className="p-12 text-center">
                                <Users
                                    className="mx-auto mb-4 text-gray-400"
                                    size={48}
                                />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                    No subscribers yet
                                </h3>
                                <p className="text-gray-500">
                                    Users who subscribe to you will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="p-6 space-y-3">
                                {subscribers.map((sub) => {
                                    const userObj =
                                        sub.subscriberDetails ||
                                        sub.subscriber ||
                                        sub
                                    if (!userObj) return null

                                    return (
                                        <div
                                            key={sub._id}
                                            className="bg-[#1E2021] rounded-lg p-4 hover:bg-[#2A2D2E] transition-colors flex items-center justify-between"
                                        >
                                            <div>
                                                <h4 className="text-white font-semibold">
                                                    {userObj.fullName}
                                                </h4>
                                                <p className="text-gray-400 text-sm">
                                                    @{userObj.username}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Subscribed To Section */}
                {activeTab === "subscribedTo" && (
                    <div className="bg-[#2A2D2E]/50 border border-[#2A2D2E] rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-[#2A2D2E]">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Users size={28} className="text-red-500" />
                                Subscribed Channels
                            </h2>
                        </div>

                        {subscribedTo.length === 0 ? (
                            <div className="p-12 text-center">
                                <Users
                                    className="mx-auto mb-4 text-gray-400"
                                    size={48}
                                />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                    No subscriptions yet
                                </h3>
                                <p className="text-gray-500">
                                    Channels you subscribe to will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="p-6 space-y-3">
                                {subscribedTo.map((sub) => {
                                    const channelObj =
                                        sub.subscribedChannelDetails ||
                                        sub.channel ||
                                        sub
                                    if (!channelObj) return null

                                    return (
                                        <div
                                            key={sub._id}
                                            className="bg-[#1E2021] rounded-lg p-4 hover:bg-[#2A2D2E] transition-colors flex items-center justify-between"
                                        >
                                            <div>
                                                <h4 className="text-white font-semibold">
                                                    {channelObj.fullName}
                                                </h4>
                                                <p className="text-gray-400 text-sm">
                                                    @{channelObj.username}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <EditModal
                    isOpen={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    item={editingItem}
                    onSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    )
}

// Edit Modal Component
const EditModal = ({ isOpen, onClose, item, onSuccess }) => {
    const isVideo = item.type === "video"
    const [formData, setFormData] = useState({
        title: isVideo ? item.data.title : "",
        description: isVideo ? item.data.description : "",
        content: !isVideo ? item.data.content : "",
        thumbnail: null,
    })
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState(
        isVideo ? item.data.thumbNail || item.data.thumbnail : null
    )

    const handleChange = (e) => {
        const { name, value, files } = e.target
        if (name === "thumbnail" && files[0]) {
            setFormData((prev) => ({ ...prev, thumbnail: files[0] }))
            setPreview(URL.createObjectURL(files[0]))
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isVideo) {
                // Update Video
                // If we have a file, specifically use updateVideo
                // The controller expects a PATCH with field updates
                // If file is present, it handles cloud upload

                // We need to send updates.
                // Note: The generic updateVideo in API might treat usage of FormData differently or expects JSON if no file?
                // Actually updateVideo API usually handles generic requests.
                // Let's verify API signature: `updateVideo = async (videoId, data)`
                // If we are sending file, data should be FormData.

                let dataToSend
                const isMultipart = !!formData.thumbnail

                if (isMultipart) {
                    dataToSend = new FormData()
                    dataToSend.append("title", formData.title)
                    dataToSend.append("description", formData.description)
                    if (formData.thumbnail) {
                        dataToSend.append("thumbnail", formData.thumbnail)
                    }
                } else {
                    // Send JSON if no file, but wait, updateVideo API likely uses patch directly.
                    // Let's check api/videoApi.js again.
                    // It says: `apiClient.patch(\`/videos/${videoId}\`, data)`
                    // If we pass an object, axios sends JSON. If FormData, it sets multipart.
                    // Keep common fields
                    dataToSend = {
                        title: formData.title,
                        description: formData.description,
                    }
                }

                // Correction: The controller checks `req.file?.path`.
                // This means the request MUST be multipart/form-data if a file is involved.
                // If NO file is involved, we can send JSON `title` and `description`.
                // However, our `updateVideo` function in `videoApi.js` (I should check source)
                // usually blindly passes `data`.
                // If I pass a plain object to axios patch, it sends JSON.
                // If I pass FormData, it sends multipart.
                // So: if thumbnail is new, use FormData. If not, use JSON.

                if (formData.thumbnail) {
                    const fd = new FormData()
                    fd.append("title", formData.title)
                    fd.append("description", formData.description)
                    fd.append("thumbnail", formData.thumbnail)
                    await updateVideo(item.data._id, fd)
                } else {
                    await updateVideo(item.data._id, {
                        title: formData.title,
                        description: formData.description,
                    })
                }

                toast.success("Video updated successfully")
            } else {
                // Update Tweet
                await updateTweet(item.data._id, formData.content)
                toast.success("Tweet updated successfully")
            }
            onSuccess()
        } catch (error) {
            console.error("Update failed:", error)
            toast.error(error.message || "Failed to update")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div
                className={`bg-[#1E2021] border border-[#2A2D2E] rounded-2xl w-full ${isVideo ? "max-w-2xl" : "max-w-lg"} shadow-2xl overflow-hidden`}
            >
                <div className="flex justify-between items-center p-6 border-b border-[#2A2D2E]">
                    <h3 className="text-xl font-bold text-white">
                        {isVideo ? "Edit Video" : "Edit Tweet"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {isVideo ? (
                        <div className="space-y-6">
                            {/* Thumbnail Preview & Upload */}
                            <div className="flex gap-6 flex-col md:flex-row">
                                <div className="w-full md:w-1/3 relative aspect-video bg-black rounded-lg overflow-hidden group">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Thumbnail"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                            No Thumbnail
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <label className="cursor-pointer flex flex-col items-center gap-2 text-white">
                                            <Upload size={24} />
                                            <span className="text-xs font-medium">
                                                Change
                                            </span>
                                            <input
                                                type="file"
                                                name="thumbnail"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleChange}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Video Title
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full bg-[#2A2D2E] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-600 transition-colors"
                                            placeholder="Enter video title"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full bg-[#2A2D2E] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-600 transition-colors resize-none"
                                            placeholder="Enter video description"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Tweet Content
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows={6}
                                className="w-full bg-[#2A2D2E] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors resize-none text-lg"
                                placeholder="What's happening?"
                                required
                            />
                        </div>
                    )}

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-[#2A2D2E] hover:bg-gray-700 text-white font-medium rounded-full transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && (
                                <Loader2 size={18} className="animate-spin" />
                            )}
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DashboardPage
