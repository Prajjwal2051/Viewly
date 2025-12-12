// ============================================
// VIDEO CARD COMPONENT - REUSABLE VIDEO ITEM
// ============================================
// Displays video thumbnail, title, channel info, and stats.
// Used in home feed, search results, and playlists.

import { useNavigate, useLocation } from "react-router-dom"
import { formatDistanceToNow } from "date-fns" // Time formatting library
import { Eye, Play, Share2, ThumbsUp } from "lucide-react"

/**
 * Props:
 * - video: Object containing video data (title, thumbnail, views, likes, owner, etc.)
 */
const VideoCard = ({ video }) => {
    const navigate = useNavigate()
    const location = useLocation()

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

    const handleShare = (e) => {
        e.stopPropagation()
        const link = `${window.location.origin}/video/${video._id}`
        navigator.clipboard.writeText(link)
        // Ideally show a toast here, but toast isn't imported.
        // Assuming parent might handle or just silent copy for now.
        // Actually, let's just let it copy.
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
                    {Math.floor(video.duration / 60)}:
                    {String(video.duration % 60).padStart(2, "0")}
                </div>

                {/* HOVER OVERLAY - PLAY & ACTIONS */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 z-10">
                    {/* Play Action */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/video/${video._id}`, {
                                state: { background: location },
                            })
                        }}
                        className="flex flex-col items-center gap-1 group/btn"
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
                        className="flex flex-col items-center gap-1 group/btn"
                        title="Share"
                    >
                        <div className="p-3 rounded-full bg-white/20 text-white hover:bg-white/40 hover:scale-110 transition-all duration-300">
                            <Share2 size={20} />
                        </div>
                    </button>
                </div>
            </div>

            {/* BOTTOM SECTION: INFO */}
            <div className="p-3 flex gap-3">
                {/* Avatar */}
                <img
                    src={
                        video.owner?.avatar || "https://via.placeholder.com/40"
                    }
                    alt={video.owner?.username}
                    className="h-9 w-9 rounded-full object-cover border border-white/10 shrink-0 mt-1"
                    onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/channel/${video.owner?.username}`)
                    }}
                />

                <div className="flex flex-col min-w-0">
                    {/* Title */}
                    <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight mb-1 group-hover:text-red-400 transition-colors">
                        {video.title}
                    </h3>

                    {/* Channel Name */}
                    <p
                        className="text-xs text-gray-400 hover:text-white transition-colors truncate"
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/channel/${video.owner?.username}`)
                        }}
                    >
                        {video.owner?.fullName || video.owner?.username}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                        <span>{formatViews(video.views)} views</span>
                        <span>•</span>
                        <span>{formatDate(video.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoCard
