import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTweetById, toggleTweetLike } from "../api/tweetApi"
import { getIsTweetLiked } from "../api/likeApi"
import { getSubscriptionStatus } from "../api/subscriptionApi"
import { toggleSubscription } from "../api/subscriptionApi"
import CommentSection from "../components/comments/CommentSection"
import {
    Loader2,
    Heart,
    Share2,
    ArrowLeft,
    X,
    MessageCircle,
    MoreVertical,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import toast from "react-hot-toast"
import { useSelector } from "react-redux"
import {
    sanitizeTweetContent,
    sanitizeDisplayName,
    sanitizeUsername,
} from "../utils/sanitize"

const TweetPage = ({ isModal = false }) => {
    const { tweetId } = useParams()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const [tweet, setTweet] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(0)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false) // Loading state for follow button
    const [showComments, setShowComments] = useState(false)

    useEffect(() => {
        const fetchTweet = async () => {
            try {
                setLoading(true)
                const response = await getTweetById(tweetId)
                // response.data contains the tweet object
                const tweetData = response.data || response // Adjust based on API structure
                setTweet(tweetData)
                setLikesCount(tweetData.likes || 0)
                // setIsLiked(tweetData.isLiked) // If backend provides this
                // Assuming tweetData might have subscription status or we default false
                // For a proper implementation we might need to check 'isSubscribed' from backend
                // or have it in ownerDetails. For now, defaulting false or simple toggle.
                setIsSubscribed(tweetData.ownerDetails?.isSubscribed || false)
            } catch (error) {
                console.error("Failed to fetch tweet:", error)
                toast.error("Failed to load post")
                navigate("/")
            } finally {
                setLoading(false)
            }
        }

        if (tweetId) fetchTweet()
    }, [tweetId, navigate])

    // Fetch like status
    useEffect(() => {
        const fetchLikeStatus = async () => {
            if (user && tweetId) {
                try {
                    const data = await getIsTweetLiked(tweetId)
                    setIsLiked(data.isLiked || false)
                } catch (error) {
                    console.error("Failed to fetch like status:", error)
                }
            }
        }
        fetchLikeStatus()
    }, [tweetId, user])

    // Fetch follow status
    useEffect(() => {
        const fetchFollowStatus = async () => {
            if (user && tweet?.ownerDetails?._id) {
                try {
                    const data = await getSubscriptionStatus(
                        tweet.ownerDetails._id
                    )
                    setIsSubscribed(data.isSubscribed || false)
                } catch (error) {
                    console.error("Failed to fetch follow status:", error)
                }
            }
        }
        fetchFollowStatus()
    }, [tweet?.ownerDetails?._id, user])

    const handleSubscribe = async (e) => {
        e?.stopPropagation()

        if (!user) {
            toast.error("Please login to follow")
            return
        }

        // Prevent self-follow with error message
        if (user._id === tweet?.ownerDetails?._id) {
            toast.error("You cannot follow yourself")
            return
        }

        // Prevent rapid clicks
        if (isFollowing) return

        setIsFollowing(true)
        const wasSubscribed = isSubscribed
        setIsSubscribed(!wasSubscribed) // Optimistic

        try {
            const response = await toggleSubscription(tweet.ownerDetails._id)
            console.log("Toggle response:", response)

            // Use actual API response
            const newState =
                response.data?.isSubscribed ??
                response.isSubscribed ??
                !wasSubscribed
            setIsSubscribed(newState)

            const username = tweet.ownerDetails?.username || "user"
            toast.success(
                newState ? `Following @${username}` : `Unfollowed @${username}`
            )
        } catch (error) {
            setIsSubscribed(wasSubscribed)
            toast.error("Failed to update follow status")
            console.error("Follow error:", error)
        } finally {
            setIsFollowing(false)
        }
    }

    const handleLike = async () => {
        if (!user) {
            toast.error("Please login to like tweets")
            return
        }

        // Optimistic update
        const wasLiked = isLiked
        const newLikedState = !isLiked
        setIsLiked(newLikedState)
        setLikesCount((prev) => {
            const newCount = newLikedState ? prev + 1 : prev - 1
            return Math.max(0, newCount) // Prevent negative counts
        })

        try {
            await toggleTweetLike(tweet._id)
            // Show success toast with context
            toast.success(newLikedState ? "Liked" : "Unliked")
        } catch (error) {
            // Revert on error
            setIsLiked(wasLiked)
            setLikesCount((prev) => (newLikedState ? prev - 1 : prev + 1))
            console.error("Error liking tweet:", error)
            toast.error("Failed to like tweet")
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#1E2021]">
                <Loader2 className="w-10 h-10 animate-spin text-white" />
            </div>
        )
    }

    if (!tweet) return null

    const handleShare = (e) => {
        e?.stopPropagation()
        const link = window.location.href
        navigator.clipboard.writeText(link)
        toast.success("Link copied to clipboard!")
    }

    if (isModal) {
        return (
            <div className="relative w-full h-full bg-[#1E2021] flex flex-col overflow-hidden">
                {/* CLOSE BUTTON */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* CONTENT AREA: IMAGE (Flex-1 to take available space) */}
                <div className="flex-1 flex items-center justify-center bg-[#1E2021] overflow-hidden relative w-full">
                    {tweet.image ? (
                        <img
                            src={tweet.image}
                            alt="Tweet content"
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center p-8">
                            <div className="w-full max-w-3xl flex flex-col items-center justify-center bg-[#1E2021] rounded-3xl p-8 shadow-2xl">
                                <p className="text-gray-100 text-xl md:text-3xl font-normal text-center leading-relaxed whitespace-pre-wrap tracking-wide">
                                    {sanitizeTweetContent(tweet.content)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER: INFO & ACTIONS (Static block below image) */}
                <div className="w-full bg-[#1E2021] border-t border-gray-800 p-4 transition-transform z-40">
                    <div className="max-w-screen-xl mx-auto flex flex-col gap-4">
                        {/* Top Row: User Info & Follow Button */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src={
                                        tweet.ownerDetails?.avatar ||
                                        "https://via.placeholder.com/40"
                                    }
                                    alt={tweet.ownerDetails?.username}
                                    className="w-10 h-10 rounded-full object-cover border border-white/10 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(
                                            `/channel/${tweet.ownerDetails?.username}`
                                        )
                                    }}
                                />
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="font-bold text-white text-base hover:underline cursor-pointer"
                                            onClick={() =>
                                                navigate(
                                                    `/channel/${tweet.ownerDetails?.username}`
                                                )
                                            }
                                        >
                                            {sanitizeDisplayName(
                                                tweet.ownerDetails?.fullName
                                            )}
                                        </span>
                                        {user?._id !==
                                            tweet.ownerDetails?._id && (
                                            <button
                                                onClick={handleSubscribe}
                                                disabled={isFollowing}
                                                className={`px-3 py-0.5 text-xs font-bold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    isSubscribed
                                                        ? "bg-transparent border border-gray-500 text-gray-300 hover:border-red-500 hover:text-red-500"
                                                        : "bg-white text-black hover:bg-gray-200"
                                                }`}
                                            >
                                                {isFollowing
                                                    ? "..."
                                                    : isSubscribed
                                                      ? "Following"
                                                      : "Follow"}
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        @
                                        {sanitizeUsername(
                                            tweet.ownerDetails?.username
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content snippet (if image present, show caption below) */}
                        {tweet.image && tweet.content && (
                            <p className="text-gray-200 text-sm md:text-base leading-snug line-clamp-2">
                                {sanitizeTweetContent(tweet.content)}
                            </p>
                        )}

                        {/* Actions Row */}
                        <div className="flex items-center justify-between border-t border-gray-800 pt-3 mt-1">
                            <div className="flex items-center gap-4 sm:gap-6">
                                {/* Like */}
                                <button
                                    onClick={handleLike}
                                    className="flex items-center gap-2 group"
                                >
                                    <Heart
                                        size={24}
                                        className={`transition-colors ${isLiked ? "fill-red-600 text-red-600" : "text-gray-400 group-hover:text-red-500"}`}
                                    />
                                    <span
                                        className={`text-sm font-medium ${isLiked ? "text-red-600" : "text-gray-400 group-hover:text-white"}`}
                                    >
                                        {likesCount}
                                    </span>
                                </button>

                                {/* Comment */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowComments(true)
                                    }}
                                    className="flex items-center gap-2 group"
                                >
                                    <MessageCircle
                                        size={24}
                                        className="text-gray-400 group-hover:text-blue-500 transition-colors"
                                    />
                                    <span className="text-sm font-medium text-gray-400 group-hover:text-white hidden sm:block">
                                        Comment
                                    </span>
                                </button>

                                {/* Share */}
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 group"
                                >
                                    <Share2
                                        size={24}
                                        className="text-gray-400 group-hover:text-green-500 transition-colors"
                                    />
                                    <span className="text-sm font-medium text-gray-400 group-hover:text-white hidden sm:block">
                                        Share
                                    </span>
                                </button>
                            </div>

                            <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">
                                {formatDistanceToNow(
                                    new Date(tweet.createdAt),
                                    {
                                        addSuffix: true,
                                    }
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* COMMENTS SECTION - RESPONSIVE (Bottom Sheet on Mobile, Sidebar on Desktop) */}
                <div
                    className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
                        showComments
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                    }`}
                    onClick={() => setShowComments(false)}
                >
                    <div
                        className={`fixed bg-[#1E2021] border-gray-700 shadow-2xl transition-transform duration-300 ease-out flex flex-col
                            bottom-0 w-full h-[90vh] rounded-t-3xl border-t transform
                            md:top-0 md:right-0 md:h-full md:w-[450px] md:bottom-auto md:rounded-none md:border-l md:border-t-0
                            ${
                                showComments
                                    ? "translate-y-0 md:translate-x-0"
                                    : "translate-y-full md:translate-x-full"
                            }
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drag Indicator (Mobile only visual cue) */}
                        <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
                            <div className="w-12 h-1.5 bg-gray-600 rounded-full"></div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">
                                    Comments
                                </h2>
                                <button
                                    onClick={() => setShowComments(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <CommentSection
                                    tweetId={tweet._id}
                                    hideHeader={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`${isModal ? "h-full bg-[#1E2021]" : "min-h-screen bg-[#1E2021]"} text-white flex ${tweet.image ? "flex-col md:flex-row" : "justify-center"} ${isModal ? "rounded-2xl overflow-hidden" : ""}`}
        >
            {/* LEFT: Image Viewer - Only if image exists */}
            {tweet.image && (
                <div className="flex-1 bg-[#1E2021] flex items-center justify-center relative min-h-[50vh] md:h-screen">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(-1)
                        }}
                        className="absolute top-4 left-4 z-10 p-2 bg-[#1E2021]/50 rounded-full hover:bg-[#1E2021]/80 text-white"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <img
                        src={tweet.image}
                        alt="Full size"
                        className="max-w-full max-h-[90vh] object-contain"
                    />
                </div>
            )}

            {/* Back Button for Text-Only Mode */}
            {!tweet.image && (
                <button
                    onClick={() => navigate(-1)}
                    className="fixed top-4 left-4 z-50 p-2 bg-[#2A2D2E] rounded-full hover:bg-[#3F4243] text-white shadow-lg"
                >
                    <ArrowLeft size={24} />
                </button>
            )}

            {/* RIGHT: Sidebar (Details & Comments) */}
            <div
                className={`${tweet.image ? "md:w-[400px] lg:w-[450px] border-l" : "w-full max-w-2xl border-x"} bg-[#2A2D2E] border-[#2A2D2E] flex flex-col h-screen overflow-y-auto relative`}
            >
                {/* Header: Author */}
                <div className="sticky top-0 z-20 bg-[#2A2D2E]/95 backdrop-blur-sm p-4 border-b border-[#2A2D2E] flex items-center gap-3">
                    <img
                        src={
                            tweet.ownerDetails?.avatar ||
                            "https://via.placeholder.com/40"
                        }
                        alt={tweet.ownerDetails?.username}
                        className="w-10 h-10 rounded-full object-cover cursor-pointer"
                        onClick={() =>
                            navigate(`/channel/${tweet.ownerDetails?.username}`)
                        }
                    />
                    <div className="flex-1">
                        <h3
                            className="font-semibold cursor-pointer hover:underline"
                            onClick={() =>
                                navigate(
                                    `/channel/${tweet.ownerDetails?.username}`
                                )
                            }
                        >
                            {sanitizeDisplayName(tweet.ownerDetails?.fullName)}
                        </h3>
                        <p className="text-xs text-gray-400">
                            @{sanitizeUsername(tweet.ownerDetails?.username)}
                        </p>
                    </div>
                </div>

                {/* Content & Stats */}
                <div className="p-4">
                    {tweet.content && (
                        <p className="text-base mb-4 whitespace-pre-wrap leading-relaxed border-b border-[#2A2D2E] pb-4">
                            {sanitizeTweetContent(tweet.content)}
                        </p>
                    )}

                    <div className="flex items-center gap-6 mb-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 transition-colors ${
                                isLiked
                                    ? "text-red-500"
                                    : "text-white hover:text-red-600"
                            }`}
                        >
                            <Heart
                                size={24}
                                fill={isLiked ? "currentColor" : "none"}
                            />
                            <span className="font-bold">
                                {likesCount} likes
                            </span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <Share2 size={24} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500">
                        Posted{" "}
                        {formatDistanceToNow(new Date(tweet.createdAt), {
                            addSuffix: true,
                        })}
                    </p>
                </div>

                {/* Comments Section */}
                <div className="flex-1 bg-[#1E2021]/20">
                    <CommentSection tweetId={tweet._id} isTweet={true} />
                </div>
            </div>
        </div>
    )
}

export default TweetPage
