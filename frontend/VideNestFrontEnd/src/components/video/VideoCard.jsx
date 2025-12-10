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
        // Card container - clickable, expands shadow on hover, 'group' enables child hover effects
        <div
            onClick={() => navigate(`/video/${video._id}`)}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group border dark:border-gray-700"
        >
            {/* VIDEO THUMBNAIL - 16:9 aspect ratio with duration badge */}
            <div className="relative aspect-video bg-gray-200">
                {/* Thumbnail image - scales up slightly on card hover (group-hover) */}
                <img
                    src={
                        video.thumbNail || "https://via.placeholder.com/640x360"
                    }
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Duration badge - positioned at bottom-right, shows MM:SS format */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {Math.floor(video.duration / 60)}:
                    {String(video.duration % 60).padStart(2, "0")}
                </div>
            </div>

            {/* VIDEO INFO SECTION - Title, channel, and stats */}
            <div className="p-4">
                {/* Channel avatar + video details in flex layout */}
                <div className="flex gap-3">
                    {/* Channel avatar - clickable, stops event propagation to avoid triggering video click */}
                    <img
                        src={
                            video.owner?.avatar ||
                            "https://via.placeholder.com/40"
                        }
                        alt={video.owner?.username}
                        className="h-10 w-10 rounded-full object-cover shrink-0"
                        onClick={(e) => {
                            e.stopPropagation() // Prevents video click when clicking avatar
                            navigate(`/channel/${video.owner?.username}`)
                        }}
                    />

                    <div className="flex-1 min-w-0">
                        {/* Video title - max 2 lines with ellipsis (line-clamp-2) */}
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                            {video.title}
                        </h3>

                        {/* Channel name - clickable text */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                            {video.owner?.fullName || video.owner?.username}
                        </p>

                        {/* Video statistics - views, likes, upload time */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {formatViews(video.views)} views
                            </span>
                            <span className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {formatViews(video.likes)}
                            </span>
                            <span>{formatDate(video.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoCard
