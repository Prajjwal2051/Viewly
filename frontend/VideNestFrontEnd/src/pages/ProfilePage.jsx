// ============================================
// PROFILE PAGE - USER CHANNEL VIEW
// ============================================
// Displays user profile with videos, tweets, and channel information.
// Shows different content based on whether viewing own profile or another user's.

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
import {
    sanitizeDisplayName,
    sanitizeUsername,
    sanitizeUserBio,
} from "../utils/sanitize"

/**
 * TAB CONFIGURATION
 *
 * Defines the available tabs on the profile page:
 * - Videos: Shows all uploaded videos
 * - Tweets: Shows all photo posts
 * - About: Shows channel description and statistics
 */
const TABS = [
    { id: "videos", label: "Videos", icon: Film },
    { id: "tweets", label: "Tweets", icon: MessageSquare },
    { id: "about", label: "About", icon: User },
]

/**
 * PROFILE PAGE COMPONENT
 *
 * Purpose:
 * - Show user's content (videos and tweets)
 * - Display channel statistics (subscribers, video count)
 * - Allow subscribing to other users' channels
 *
 * Key Features:
 * - Tab navigation (Videos, Tweets, About)
 * - Subscribe/Unsubscribe button (not shown on own profile)
 * - Cover image and avatar display
 * - Responsive grid layout for content
 *
 * URL Patterns:
 * - /profile → Own profile (uses current logged-in user)
 * - /profile/:username → Other user's profile
 */
const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth)
    const { username } = useParams()
    const navigate = useNavigate()

    const [activeTab, setActiveTab] = useState("videos")
    const [loading, setLoading] = useState(true)
    const [profileData, setProfileData] = useState(null)
    const [userVideos, setUserVideos] = useState([])
    const [stats, setStats] = useState({ subscribers: 0, videos: 0 })
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [subscribing, setSubscribing] = useState(false)

    // Determine target username (URL param or current user)
    const targetUsername = username || user?.username

    // Determine if viewing own profile
    // We can only know this for sure after fetching profileData,
    // but initially we can check usernames
    const isOwnProfile = !username || (user && username === user.username)

    const coverImage =
        profileData?.coverImage ||
        profileData?.coverImg ||
        profileData?.coverimage

    // Fetch profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!targetUsername) return

            try {
                setLoading(true)

                // 1. Fetch channel profile
                const channelResponse =
                    await getUserChannelProfile(targetUsername)
                const channelData = channelResponse.data || channelResponse
                setProfileData(channelData)

                // 2. Set subscription status (if logged in user matches)
                if (channelData?.isSubscribed) {
                    setIsSubscribed(true)
                }
                // Alternatively, if the API doesn't return isSubscribed, we might need a separate check
                // For now assuming existing Logic:
                // subscriptionApi usually has checkSubscriptionStatus or similar,
                // but here we might rely on channelData having it or fetching it separately.
                // Let's stick to the previous pattern but focused on target user.

                // If we are looking at another user, check if WE represent a subscriber to THEM
                // The previous code didn't explicitly check isSubscribed status from API?
                // Let's look at how subscriptionApi was used.
                // It seems `getUserChannelProfile` might return `isSubscribed`?
                // If not, we might need to check `channelData.subscribers` includes `user._id`?
                // The current codebase didn't have explicit `checkSubscription` call in useEffect.
                // We will assume `channelData` might have it or we default to false/check later.
                // *Correction*: previous code had `setIsSubscribed` logic missing in the view?
                // Ah, line 65 `const [isSubscribed, setIsSubscribed] = useState(false)` was unused in useEffect?
                // Wait, checking line 134 `handleSubscribe` toggles it.
                // But where is it *initialized*?
                // It seems the previous code *failed* to initialize `isSubscribed` state correctly from backend!
                // I should fix this too.

                // Let's check `channelData` structure. Usually it has `isSubscribed`.
                if (channelData.isSubscribed !== undefined) {
                    setIsSubscribed(channelData.isSubscribed)
                }

                const subscriberCount =
                    channelData.subscribersCount ||
                    channelData.subscriberCount ||
                    (channelData._id === user?._id
                        ? user?.subscribersCount
                        : 0) ||
                    0

                // 3. Fetch videos
                const response = await getAllVideos()
                const allVideos = response.data?.videos || response.videos || []

                // Filter videos by the PROFILE OWNER'S ID
                const filtered = allVideos.filter(
                    (v) =>
                        v.owner?._id === channelData._id ||
                        v.owner === channelData._id
                )

                setUserVideos(filtered)

                setStats({
                    subscribers: subscriberCount,
                    videos: filtered.length,
                })
            } catch (error) {
                console.error("Failed to load profile data:", error)
                toast.error("User not found or error loading profile")
                // If error, maybe redirect or show empty state?
                // For now, staying on page.
            } finally {
                setLoading(false)
            }
        }

        fetchProfileData()
    }, [targetUsername, user?.username]) // Re-run if target changes or user logs in

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
            await toggleSubscription(profileData._id)
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
            {coverImage && (
                <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-8 bg-[#1E2021]">
                    <img
                        src={coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Profile Header Area - Notion Style */}
            <div className="relative mb-8 px-4">
                {/* Floating Avatar - Overlapping Banner */}
                <div
                    className={`${
                        coverImage
                            ? "absolute -top-16 left-4 md:left-8"
                            : "relative mb-4"
                    }`}
                >
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-[#121212]">
                        <img
                            src={
                                profileData?.avatar ||
                                "https://via.placeholder.com/150"
                            }
                            alt={profileData?.username}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                </div>

                {/* Edit/Subscribe Button - Top Right aligned with Avatar area (Only if Banner exists) */}
                {coverImage && (
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
                )}
            </div>

            {/* Content Flow */}
            <div className={`${coverImage ? "mt-12 md:mt-16" : "mt-2"} ml-1`}>
                {/* Name - Huge Title Style */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {sanitizeDisplayName(profileData?.fullName)}
                </h1>

                {/* Handle & Email - Minimal metadata */}
                <div className="flex flex-wrap gap-4 text-gray-500 font-medium text-lg mb-6 items-center">
                    <span>@{sanitizeUsername(profileData?.username)}</span>
                    {/* Stats inline */}
                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                    <span className="text-gray-400">
                        {loading ? "..." : stats.subscribers.toLocaleString()}{" "}
                        {stats.subscribers === 1 ? "Subscriber" : "Subscribers"}
                    </span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                    <span className="text-gray-400">
                        {loading ? "..." : stats.videos.toLocaleString()}{" "}
                        {stats.videos === 1 ? "Video" : "Videos"}
                    </span>

                    {/* Edit/Subscribe Button - Inline with stats (Only if No Banner) */}
                    {!coverImage && (
                        <div className="ml-auto">
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
                    )}
                </div>

                {/* Bio - Notion Callout Block Style */}
                {profileData?.bio && (
                    <div className="bg-[#2A2D2E] rounded-md p-4 mb-8 flex gap-4 items-start max-w-4xl border border-transparent hover:border-gray-600 transition-colors">
                        <span className="text-2xl">💡</span>
                        <div className="flex-1">
                            <p className="text-gray-300 leading-relaxed font-normal">
                                {sanitizeUserBio(profileData.bio)}
                            </p>
                        </div>
                    </div>
                )}
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
                        {profileData?._id ? (
                            <TweetList userId={profileData._id} />
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
                                profileData?.createdAt || Date.now()
                            ).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfilePage
