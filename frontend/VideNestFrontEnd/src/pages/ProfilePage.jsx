import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"
import { Grid, Film, User, Loader2, MessageSquare } from "lucide-react"
import VideoCard from "../components/video/VideoCard"
import TweetList from "../components/tweet/TweetList"
import EmptyState from "../components/ui/EmptyState"
import { getAllVideos } from "../api/videoApi"
import { toggleSubscription } from "../api/subscriptionApi"
import { getUserChannelProfile } from "../api/userApi"
import toast from "react-hot-toast"

// Tab Configuration
const TABS = [
    { id: "videos", label: "Videos", icon: Film },
    { id: "tweets", label: "Tweets", icon: MessageSquare },
    { id: "about", label: "About", icon: User },
]

const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth)
    const { username } = useParams()
    const navigate = useNavigate()

    const [activeTab, setActiveTab] = useState("videos")
    const [loading, setLoading] = useState(true)
    const [userVideos, setUserVideos] = useState([])
    const [stats, setStats] = useState({ subscribers: 0, videos: 0 })
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [subscribing, setSubscribing] = useState(false)

    // Determine if viewing own profile or someone else's
    const isOwnProfile = !username || username === user?.username
    const profileUser = isOwnProfile ? user : null // For now, use current user

    console.log("ProfilePage Debug:", {
        user,
        coverImage: user?.coverImage,
        coverImg: user?.coverImg,
    })

    // Fetch profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true)

                // Fetch channel profile with latest subscriber count
                if (user?.username) {
                    const channelResponse = await getUserChannelProfile(
                        user.username
                    )
                    console.log("Channel profile:", channelResponse)

                    const channelData = channelResponse.data || channelResponse
                    const subscriberCount =
                        channelData.subscribersCount ||
                        channelData.subscriberCount ||
                        user?.subscribersCount ||
                        0

                    // Fetch all videos and filter by user
                    const response = await getAllVideos()
                    const allVideos =
                        response.data?.videos || response.videos || []

                    // Filter user's videos
                    const filtered = allVideos.filter(
                        (v) => v.owner?._id === user._id || v.owner === user._id
                    )

                    setUserVideos(filtered)

                    // Set stats with fresh subscriber count
                    setStats({
                        subscribers: subscriberCount,
                        videos: filtered.length,
                    })
                }
            } catch (error) {
                console.error("Failed to load profile data:", error)
                // Fallback to user data if API fails
                setStats({
                    subscribers: user?.subscribersCount || 0,
                    videos: userVideos.length,
                })
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            fetchProfileData()
        }
    }, [user])

    // Subscribe handler
    const handleSubscribe = async () => {
        if (!user) {
            toast.error("Please login to subscribe")
            navigate("/login")
            return
        }

        setSubscribing(true)
        const wasSubscribed = isSubscribed

        // Optimistic update
        setIsSubscribed(!wasSubscribed)
        setStats((prev) => ({
            ...prev,
            subscribers: wasSubscribed
                ? prev.subscribers - 1
                : prev.subscribers + 1,
        }))

        try {
            await toggleSubscription(profileUser._id)
            toast.success(wasSubscribed ? "Unsubscribed" : "Subscribed!")
        } catch (error) {
            // Revert on error
            setIsSubscribed(wasSubscribed)
            setStats((prev) => ({
                ...prev,
                subscribers: wasSubscribed
                    ? prev.subscribers + 1
                    : prev.subscribers - 1,
            }))
            toast.error("Failed to update subscription")
        } finally {
            setSubscribing(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Cover Photo Banner */}
            {/* Cover Photo Banner */}
            <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-8 bg-[#1E2021]">
                {user?.coverImage || user?.coverImg || user?.coverimage ? (
                    <img
                        src={
                            user?.coverImage ||
                            user?.coverImg ||
                            user?.coverimage
                        }
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 relative">
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Decorative Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Header Area - Notion Style */}
            <div className="relative mb-8 px-4">
                {/* Floating Avatar - Overlapping Banner */}
                <div className="absolute -top-16 left-4 md:left-8">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-[#121212]">
                        <img
                            src={
                                user?.avatar ||
                                "https://via.placeholder.com/150"
                            }
                            alt={user?.username}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                </div>

                {/* Edit/Subscribe Button - Top Right aligned with Avatar area */}
                <div className="flex justify-end pt-4 mb-4">
                    {isOwnProfile ? (
                        <button
                            onClick={() => navigate("/settings")}
                            className="px-4 py-2 bg-[#2A2D2E] hover:bg-[#3F4243] text-white text-sm font-medium rounded transition-colors"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <button
                            onClick={handleSubscribe}
                            disabled={subscribing}
                            className={`px-6 py-2 font-semibold rounded transition-colors disabled:opacity-50 ${
                                isSubscribed
                                    ? "bg-[#2A2D2E] text-white hover:bg-gray-700"
                                    : "bg-red-600 text-white hover:bg-red-700"
                            }`}
                        >
                            {subscribing
                                ? "Loading..."
                                : isSubscribed
                                  ? "Subscribed"
                                  : "Subscribe"}
                        </button>
                    )}
                </div>

                {/* Content Flow */}
                <div className="mt-12 md:mt-16 ml-1">
                    {/* Name - Huge Title Style */}
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        {user?.fullName}
                    </h1>

                    {/* Handle & Email - Minimal metadata */}
                    <div className="flex flex-wrap gap-4 text-gray-500 font-medium text-lg mb-6 items-center">
                        <span>@{user?.username}</span>
                        {/* Stats inline */}
                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                        <span className="text-gray-400">
                            {loading
                                ? "..."
                                : stats.subscribers.toLocaleString()}{" "}
                            {stats.subscribers === 1
                                ? "Subscriber"
                                : "Subscribers"}
                        </span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                        <span className="text-gray-400">
                            {loading ? "..." : stats.videos.toLocaleString()}{" "}
                            {stats.videos === 1 ? "Video" : "Videos"}
                        </span>
                    </div>

                    {/* Bio - Notion Callout Block Style */}
                    {user?.bio && (
                        <div className="bg-[#2A2D2E] rounded-md p-4 mb-8 flex gap-4 items-start max-w-4xl border border-transparent hover:border-gray-600 transition-colors">
                            <span className="text-2xl">💡</span>
                            <div className="flex-1">
                                <p className="text-gray-300 leading-relaxed font-normal">
                                    {user.bio}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Tabs with Sliding Animation */}
            <div className="relative flex items-center border-b border-[#2A2D2E] mb-8 overflow-x-auto">
                {/* Animated Background Slider - Desktop Only */}
                <div
                    className={`hidden md:block absolute bottom-0 h-0.5 bg-red-600 rounded-t-full transition-all duration-300 ease-out`}
                    style={{
                        width: `${(100 / TABS.length) * 0.6}%`, // 60% of tab width for narrower slider
                        left: `${TABS.findIndex((t) => t.id === activeTab) * (100 / TABS.length) + (100 / TABS.length) * 0.2}%`, // Centered within tab
                    }}
                />

                {TABS.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-center gap-2 px-8 py-4 font-medium transition-all duration-300 relative whitespace-nowrap flex-1 ${
                                isActive
                                    ? "text-red-600"
                                    : "text-gray-500 hover:text-white"
                            }`}
                        >
                            <Icon
                                size={18}
                                className="transition-transform duration-300 hover:scale-110"
                            />
                            {tab.label}
                            {/* Mobile: Individual bottom border */}
                            {isActive && (
                                <div className="md:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-0.5 bg-red-600 rounded-t-full" />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "videos" &&
                    (loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-red-600" />
                        </div>
                    ) : userVideos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {userVideos.map((video) => (
                                <VideoCard key={video._id} video={video} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={Film}
                            title="No videos yet"
                            description={
                                isOwnProfile
                                    ? "Videos you upload will appear here."
                                    : "This user hasn't uploaded any videos yet."
                            }
                            actionLabel={isOwnProfile ? "Upload Video" : null}
                            onAction={
                                isOwnProfile ? () => navigate("/upload") : null
                            }
                            animated={true}
                        />
                    ))}

                {activeTab === "tweets" && (
                    <div>
                        {user?._id ? (
                            <TweetList userId={user._id} />
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                <MessageSquare
                                    size={48}
                                    className="mx-auto mb-4 opacity-20"
                                />
                                <h3 className="text-xl font-medium mb-2">
                                    No tweets yet
                                </h3>
                                <p>
                                    {isOwnProfile
                                        ? "Tweets you post will appear here."
                                        : "This user hasn't posted any tweets yet."}
                                </p>
                                {isOwnProfile && (
                                    <button
                                        onClick={() => navigate("/upload")}
                                        className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors"
                                    >
                                        Post Tweet
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "about" && (
                    <div className="bg-[#1E2021] rounded-xl p-8 border border-gray-100">
                        <h3 className="text-xl font-bold mb-4 text-white">
                            About
                        </h3>
                        <p className="text-gray-400">
                            Joined{" "}
                            {new Date(
                                user?.createdAt || Date.now()
                            ).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfilePage
