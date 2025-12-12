import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTweetById, toggleTweetLike } from "../api/tweetApi"
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

const TweetPage = ({ isModal = false }) => {
    const { tweetId } = useParams()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const [tweet, setTweet] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(0)
    const [isSubscribed, setIsSubscribed] = useState(false)

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

    const handleSubscribe = async (e) => {
        e?.stopPropagation()
        if (!user) {
            toast.error("Please login to subscribe")
            return
        }
        if (user._id === tweet?.ownerDetails?._id) return

        const wasSubscribed = isSubscribed
        setIsSubscribed(!wasSubscribed) // Optimistic

        try {
            await toggleSubscription(tweet.ownerDetails._id)
            toast.success(wasSubscribed ? "Unsubscribed" : "Subscribed!")
        } catch (error) {
            setIsSubscribed(wasSubscribed)
            toast.error("Failed to update subscription")
        }
    }

    const handleLike = async () => {
        try {
            const response = await toggleTweetLike(tweet._id)
            setIsLiked(response.data.isliked)
            setLikesCount((prev) =>
                response.data.isliked ? prev + 1 : prev - 1
            )
        } catch (error) {
            toast.error("Failed to like post")
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#1E2021]">
                <Loader2 className="w-10 h-10 animate-spin text-white" />
            </div>
        )
    }

    const handleShare = (e) => {
        e?.stopPropagation()
        const link = window.location.href
        navigator.clipboard.writeText(link)
        toast.success("Link copied to clipboard!")
    }

    // IMMERSIVE MODAL LAYOUT (REELS STYLE)
    if (isModal) {
        return (
            <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                {/* CLOSE BUTTON */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* CONTENT - CENTRAL & IMMERSIVE */}
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                    {tweet.image ? (
                        <img
                            src={tweet.image}
                            alt="Tweet content"
                            className="max-w-full max-h-full object-contain shadow-2xl"
                        />
                    ) : (
                        <div className="w-full flex items-center justify-center">
                            <p className="text-white text-3xl md:text-4xl font-bold text-center leading-snug tracking-wide">
                                {tweet.content}
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT OVERLAY - ACTIONS BUTTONS */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-6">
                    {/* Like Action */}
                    <button
                        className="flex flex-col items-center gap-1 group"
                        onClick={handleLike}
                    >
                        <div
                            className={`p-3 rounded-full backdrop-blur-md transition-all ${isLiked ? "bg-red-600/80 text-white" : "bg-black/40 text-white group-hover:bg-red-500/20"}`}
                        >
                            <Heart
                                size={28}
                                fill={isLiked ? "currentColor" : "none"}
                            />
                        </div>
                        <span className="text-xs font-bold text-white shadow-black drop-shadow-md">
                            {likesCount}
                        </span>
                    </button>

                    {/* Comment Action */}
                    <button className="flex flex-col items-center gap-1 group">
                        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white group-hover:bg-white/20 transition-all">
                            <MessageCircle size={28} />
                        </div>
                        <span className="text-xs font-bold text-white shadow-black drop-shadow-md">
                            Comment
                        </span>
                    </button>

                    {/* Share Action */}
                    <button
                        className="flex flex-col items-center gap-1 group"
                        onClick={handleShare}
                    >
                        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white group-hover:bg-white/20 transition-all">
                            <Share2 size={28} />
                        </div>
                        <span className="text-xs font-bold text-white shadow-black drop-shadow-md">
                            Share
                        </span>
                    </button>

                    {/* Removed MoreVertical (3 dots) as requested */}
                </div>

                {/* BOTTOM OVERLAY - INFO */}
                <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-24 pb-8 px-4">
                    <div className="flex items-center gap-3 mb-3">
                        <img
                            src={
                                tweet.ownerDetails?.avatar ||
                                "https://via.placeholder.com/40"
                            }
                            alt={tweet.ownerDetails?.username}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white/20 cursor-pointer"
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
                                    {tweet.ownerDetails?.fullName}
                                </span>
                                <button
                                    onClick={handleSubscribe}
                                    className={`px-3 py-0.5 text-xs font-bold rounded-full transition-colors ${isSubscribed ? "bg-white/20 text-gray-200" : "bg-white text-black hover:bg-gray-200"}`}
                                >
                                    {isSubscribed ? "Following" : "Follow"}
                                </button>
                            </div>
                            <span className="text-xs text-gray-300">
                                @{tweet.ownerDetails?.username}
                            </span>
                        </div>
                    </div>

                    {/* Show content snippet IF image exists. If NO image, we don't show it here because it's already centered big! */}
                    {tweet.image && tweet.content && (
                        <p className="text-white text-sm md:text-base leading-snug line-clamp-3 mb-1 w-[85%] shadow-black drop-shadow-sm">
                            {tweet.content}
                        </p>
                    )}

                    <p className="text-[10px] text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(tweet.createdAt), {
                            addSuffix: true,
                        })}
                    </p>
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
                            {tweet.ownerDetails?.fullName}
                        </h3>
                        <p className="text-xs text-gray-400">
                            @{tweet.ownerDetails?.username}
                        </p>
                    </div>
                </div>

                {/* Content & Stats */}
                <div className="p-4">
                    {tweet.content && (
                        <p className="text-base mb-4 whitespace-pre-wrap leading-relaxed border-b border-[#2A2D2E] pb-4">
                            {tweet.content}
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
