import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"
import { Grid, Film, User, Loader2, MessageSquare } from "lucide-react"
import VideoCard from "../components/video/VideoCard"
import TweetList from "../components/tweet/TweetList"
import { getAllVideos } from "../api/videoApi"
import { toggleSubscription } from "../api/subscriptionApi"
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

    // Fetch profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true)

                // Fetch all videos and filter by user
                const response = await getAllVideos()
                const allVideos = response.data?.videos || response.videos || []

                // Filter user's videos
                const filtered = allVideos.filter(
                    (v) => v.owner?._id === user._id || v.owner === user._id
                )

                setUserVideos(filtered)

                // Set stats
                setStats({
                    subscribers: user?.subscribersCount || 0,
                    videos: filtered.length,
                })
            } catch (error) {
                console.error("Failed to load profile data:", error)
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
            {/* Profile Header Card */}
            <div className="bg-[#1E2021] rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-red-500 to-pink-500">
                            <img
                                src={
                                    user?.avatar ||
                                    "https://via.placeholder.com/150"
                                }
                                alt={user?.username}
                                className="w-full h-full rounded-full object-cover border-4 border-white"
                            />
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h1 className="text-3xl font-bold text-white font-Playfair_Display">
                            {user?.fullName}
                        </h1>
                        <p className="text-lg text-gray-500 font-medium">
                            @{user?.username}
                        </p>
                        <p className="text-gray-400 max-w-lg">{user?.email}</p>

                        {/* Stats - Horizontal Stack */}
                        <div className="flex items-center justify-center md:justify-start gap-8 mt-6 pt-6 border-t border-gray-100">
                            <div className="text-center md:text-left">
                                <span className="block text-2xl font-bold text-white">
                                    {loading ? (
                                        <Loader2 className="inline-block w-6 h-6 animate-spin" />
                                    ) : (
                                        stats.subscribers.toLocaleString()
                                    )}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {stats.subscribers === 1
                                        ? "Subscriber"
                                        : "Subscribers"}
                                </span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="block text-2xl font-bold text-white">
                                    {loading ? (
                                        <Loader2 className="inline-block w-6 h-6 animate-spin" />
                                    ) : (
                                        stats.videos.toLocaleString()
                                    )}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {stats.videos === 1 ? "Video" : "Videos"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {isOwnProfile ? (
                            <button
                                onClick={() => navigate("/settings")}
                                className="px-6 py-2 bg-[#2A2D2E] hover:bg-gray-200 text-white font-medium rounded-full transition-colors"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <button
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                className={`px-6 py-2 font-semibold rounded-full transition-colors disabled:opacity-50 ${
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
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-[#2A2D2E] mb-8 overflow-x-auto">
                {TABS.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-8 py-4 font-medium transition-all relative whitespace-nowrap ${
                                isActive
                                    ? "text-red-600"
                                    : "text-gray-500 hover:text-gray-500"
                            }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full" />
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
                        <div className="text-center py-20 text-gray-500">
                            <Grid
                                size={48}
                                className="mx-auto mb-4 opacity-20"
                            />
                            <h3 className="text-xl font-medium mb-2">
                                No videos yet
                            </h3>
                            <p>
                                {isOwnProfile
                                    ? "Videos you upload will appear here."
                                    : "This user hasn't uploaded any videos yet."}
                            </p>
                            {isOwnProfile && (
                                <button
                                    onClick={() => navigate("/upload")}
                                    className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors"
                                >
                                    Upload Video
                                </button>
                            )}
                        </div>
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
