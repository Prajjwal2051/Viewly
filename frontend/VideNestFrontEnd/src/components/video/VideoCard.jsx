// ============================================
// VIDEO CARD COMPONENT - REUSABLE VIDEO ITEM
// ============================================
// Displays video thumbnail, title, channel info, and stats.
// Used in home feed, search results, and playlists.

import { useNavigate } from "react-router-dom"
import { formatDistanceToNow } from "date-fns" // Time formatting library
import { Eye, ThumbsUp } from "lucide-react"

/**
 * Props:
 * - video: Object containing video data (title, thumbnail, views, likes, owner, etc.)
 */
const VideoCard = ({ video }) => {
    const navigate = useNavigate() // For routing to video/channel pages

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

    return (
        <div
            onClick={() => navigate(`/video/${video._id}`)}
            className="relative w-full mb-6 break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group shadow-lg bg-[#2A2D2E]"
        >
            {/* BACKGROUND IMAGE - Natural Aspect Ratio */}
            <img
                src={video.thumbNail || "https://via.placeholder.com/640x360"}
                alt={video.title}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* GRADIENT OVERLAY - Improves text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

            {/* DURATION BADGE - Top Right now for cleanliness */}
            <div className="absolute top-3 right-3 bg-[#1E2021]/60 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded-lg">
                {Math.floor(video.duration / 60)}:
                {String(video.duration % 60).padStart(2, "0")}
            </div>

            {/* CONTENT OVERLAY - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* Title */}
                <h3 className="text-white font-bold text-sm line-clamp-2 leading-snug mb-2 drop-shadow-md group-hover:text-red-400 transition-colors">
                    {video.title}
                </h3>

                {/* Author & Stats Row */}
                <div className="flex items-center gap-2">
                    {/* Avatar */}
                    <img
                        src={
                            video.owner?.avatar ||
                            "https://via.placeholder.com/40"
                        }
                        alt={video.owner?.username}
                        className="h-6 w-6 rounded-full object-cover border border-white/20"
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/channel/${video.owner?.username}`)
                        }}
                    />

                    {/* Text Info */}
                    <div className="flex-1 min-w-0">
                        <p
                            className="text-xs text-gray-400 truncate hover:underline"
                            onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/channel/${video.owner?.username}`)
                            }}
                        >
                            {video.owner?.fullName || video.owner?.username}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                            <span className="flex items-center gap-0.5">
                                <Eye className="h-2.5 w-2.5" />
                                {formatViews(video.views)}
                            </span>
                            <span className="w-0.5 h-0.5 rounded-full bg-[#2A2D2E]0"></span>
                            <span>{formatDate(video.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoCard
