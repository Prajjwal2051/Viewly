// ============================================
// VIDEO CARD COMPONENT - REUSABLE VIDEO ITEM
// ============================================
// Displays video thumbnail, title, channel info, and stats.
// Used in home feed, search results, and playlists.

import { useNavigate, useLocation } from "react-router-dom"
import { formatDistanceToNow } from "date-fns" // Time formatting library
import { Play, Share2, User, Heart } from "lucide-react"
import toast from "react-hot-toast"
import { useState, useEffect } from "react"
import { toggleVideoLike, getIsVideoLiked } from "../../api/likeApi"
import { useSelector } from "react-redux"
import {
    sanitizeVideoTitle,
    sanitizeDisplayName,
    sanitizeUsername,
} from "../../utils/sanitize"

/**
 * Props:
 * - video: Object containing video data (title, thumbnail, views, likes, owner, etc.)
 */
const VideoCard = ({ video }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useSelector((state) => state.auth)
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(video.likes || 0)

    // Fetch initial like status when component mounts
    useEffect(() => {
        const fetchLikeStatus = async () => {
            if (user && video._id) {
                try {
                    const data = await getIsVideoLiked(video._id)
                    setIsLiked(data.isLiked)
                } catch (error) {
                    // Silent fail - like status will default to false
                    console.error("Failed to fetch video like status:", error)
                }
            }
        }
        fetchLikeStatus()
    }, [video._id, user])

    /**
     * FORMAT VIEWS HELPER
     * Converts large numbers to readable format
     * Examples: 1500 → "1.5K", 2000000 → "2.0M"
     */
    const formatViews = (views) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
        return views
    }

    /**
     * FORMAT DATE HELPER
     * Converts timestamp to relative time ("2 days ago", "3 weeks ago")
     * Falls back to "Recently" if date is invalid
     */
    const formatDate = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true })
        } catch {
            return "Recently"
        }
    }

    // Format duration to simple format (21 sec, 2 min, 1 hr)
    const formatDuration = (seconds) => {
        if (!seconds || seconds < 0) return "0 sec"

        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)

        if (hours > 0) {
            return `${hours} hr${minutes > 0 ? " " + minutes + " min" : ""}`
        } else if (minutes > 0) {
            return `${minutes} min${secs > 0 ? " " + secs + " sec" : ""}`
        } else {
            return `${secs} sec`
        }
    }

    const handleShare = (e) => {
        e.stopPropagation()
        const link = `${window.location.origin}/video/${video._id}`
        navigator.clipboard.writeText(link)
        toast.success("Link copied to clipboard!")
    }

    const handleLike = async (e) => {
        e.stopPropagation()

        if (!user) {
            toast.error("Please login to like videos")
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
            await toggleVideoLike(video._id)
            // Show success toast with context
            toast.success(newLikedState ? "Liked" : "Unliked")
        } catch (error) {
            // Revert on error
            setIsLiked(wasLiked)
            setLikesCount((prev) => (newLikedState ? prev - 1 : prev + 1))
            toast.error("Failed to like video")
        }
    }

    return (
        <div
            onClick={() =>
                navigate(`/video/${video._id}`, {
                    state: { background: location },
                })
            }
            className="group relative w-full mb-6 break-inside-avoid rounded-2xl overflow-hidden cursor-pointer shadow-lg bg-[#2A2D2E] hover:-translate-y-1 hover:shadow-2xl hover:bg-[#2F3233] transition-all duration-300 border border-transparent hover:border-white/10 flex flex-col"
        >
            {/* TOP SECTION: VIDEO THUMBNAIL & OVERLAY */}
            <div className="relative w-full isolate overflow-hidden bg-[#1E2021]">
                <img
                    src={
                        video.thumbNail || "https://via.placeholder.com/640x360"
                    }
                    alt={video.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* DURATION BADGE */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md z-20">
                    {formatDuration(video.duration)}
                </div>

                {/* HOVER OVERLAY - PLAY & ACTIONS */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 z-10">
                    {/* Like Action */}
                    <button
                        onClick={handleLike}
                        className="flex flex-col items-center gap-1 group/btn transition-all duration-300 hover:scale-110 active:scale-95"
                        title="Like"
                    >
                        <div
                            className={`p-3 rounded-full transition-all duration-300 ${
                                isLiked
                                    ? "bg-red-600 text-white shadow-lg shadow-red-600/40"
                                    : "bg-white/20 text-white hover:bg-white/40"
                            }`}
                        >
                            <Heart
                                size={22}
                                fill={isLiked ? "currentColor" : "none"}
                            />
                        </div>
                    </button>

                    {/* Play Action */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/video/${video._id}`, {
                                state: { background: location },
                            })
                        }}
                        className="flex flex-col items-center gap-1 group/btn transition-all duration-300 hover:scale-125 active:scale-95"
                        title="Play"
                    >
                        <div className="p-3 rounded-full bg-red-600 text-white hover:scale-110 transition-all duration-300 shadow-lg shadow-red-600/40">
                            <Play
                                size={24}
                                fill="currentColor"
                                className="ml-1"
                            />
                        </div>
                    </button>

                    {/* Share Action */}
                    <button
                        onClick={handleShare}
                        className="flex flex-col items-center gap-1 group/btn transition-all duration-300 hover:scale-110 active:scale-95"
                        title="Share"
                    >
                        <div className="p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-all duration-300">
                            <Share2 size={20} />
                        </div>
                    </button>
                </div>
            </div>

            {/* BOTTOM SECTION: INFO */}
            <div className="p-3 flex gap-3">
                {/* Avatar with Fallback */}
                {video.owner?.avatar ? (
                    <img
                        src={video.owner.avatar}
                        alt={video.owner?.username}
                        className="h-9 w-9 rounded-full object-cover border border-white/10 shrink-0 mt-1"
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/channel/${video.owner?.username}`)
                        }}
                    />
                ) : (
                    <div
                        className="h-9 w-9 rounded-full bg-gray-700 border border-white/10 shrink-0 mt-1 flex items-center justify-center"
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/channel/${video.owner?.username}`)
                        }}
                    >
                        <User size={18} className="text-gray-400" />
                    </div>
                )}

                <div className="flex flex-col min-w-0">
                    {/* Title - Increased Font Size */}
                    <h3 className="text-white font-semibold text-base line-clamp-2 leading-tight mb-1 group-hover:text-red-400 transition-colors">
                        {sanitizeVideoTitle(video.title)}
                    </h3>

                    {/* Channel Name */}
                    <p
                        className="text-xs text-gray-400 hover:text-white transition-colors truncate mb-1"
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/channel/${video.owner?.username}`)
                        }}
                    >
                        {sanitizeDisplayName(
                            video.owner?.fullName || video.owner?.username
                        )}
                    </p>

                    {/* Stats - Adjusted */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap overflow-hidden">
                        <span>{formatViews(video.views)} views</span>
                        <span>•</span>
                        <span>{formatViews(likesCount)} likes</span>
                        <span>•</span>
                        <span className="truncate">
                            {formatDate(video.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoCard
