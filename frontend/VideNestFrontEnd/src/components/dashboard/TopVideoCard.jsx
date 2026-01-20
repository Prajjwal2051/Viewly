// ============================================
// TOP VIDEO CARD COMPONENT - FEATURED VIDEO HIGHLIGHT
// ============================================
// Highlights the most popular video on the channel with enhanced styling.
// Appears on the Dashboard page as a showcase of best-performing content.

import { Play, Heart, MessageSquare, Calendar, Video } from "lucide-react"
import { Link } from "react-router-dom"
import { formatNumber } from "../../utils/formatNumber"
import { formatDistanceToNow } from "date-fns"
import {
    sanitizeVideoTitle,
    sanitizeVideoDescription,
} from "../../utils/sanitize"

/**
 * TOP VIDEO CARD COMPONENT
 * 
 * Purpose:
 * - Showcase channel's most successful video
 * - Provide quick access to top-performing content
 * - Display key performance metrics (views, likes, comments)
 * 
 * Why highlight top video?
 * - Helps creators understand what content works best
 * - Encourages creating similar successful content
 * - Provides motivational boost seeing best results
 * 
 * Design Features:
 * - Gradient background for premium feel
 * - "Top Performing" badge in corner
 * - Large video icon as visual anchor
 * - Hover effects for interactivity
 * 
 * @param {Object} video - Top performing video data
 * @param {string} video._id - Video ID for linking
 * @param {string} video.title - Video title
 * @param {string} video.description - Video description
 * @param {number} video.views - Total view count
 * @param {number} video.likes - Total likes
 * @param {number} video.comments - Total comments
 * @param {Date} video.createdAt - Upload date
 */
const TopVideoCard = ({ video }) => {
    if (!video) return null

    return (
        <div className="bg-gradient-to-r from-[#2A2D2E] to-[#1f2122] border border-[#2A2D2E] rounded-xl p-6 mb-8 relative overflow-hidden group">
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-3 bg-red-600/10 rounded-bl-2xl border-b border-l border-red-600/20">
                <span className="text-red-500 text-xs font-bold uppercase tracking-wider">
                    Top Performing
                </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-4">
                Most Popular Video
            </h3>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Video Logo */}
                <div className="relative w-24 h-24 bg-red-600/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <Video size={40} className="text-red-500" />
                    <div className="absolute inset-0 bg-red-600/10 rounded-2xl animate-pulse" />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-center">
                    <Link
                        to={`/video/${video._id}`}
                        className="hover:text-red-500 transition-colors"
                    >
                        <h4 className="text-xl font-bold text-white mb-2 line-clamp-2">
                            {sanitizeVideoTitle(video.title)}
                        </h4>
                    </Link>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {sanitizeVideoDescription(
                            video.description || "No description provided"
                        )}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <Play size={16} className="text-blue-400" />
                            <span className="text-white">
                                {formatNumber(video.views)}
                            </span>{" "}
                            views
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart size={16} className="text-red-400" />
                            <span className="text-white">
                                {formatNumber(video.likesCount || 0)}
                            </span>{" "}
                            likes
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageSquare
                                size={16}
                                className="text-green-400"
                            />
                            <span className="text-white">
                                {formatNumber(video.commentsCount || 0)}
                            </span>{" "}
                            comments
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>
                                {video.createdAt
                                    ? formatDistanceToNow(
                                        new Date(video.createdAt),
                                        { addSuffix: true }
                                    )
                                    : "Recently"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TopVideoCard
