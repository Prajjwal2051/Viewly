// ============================================
// TOP VIDEO CARD COMPONENT
// ============================================
// Highlights the most popular video on the channel

import { Play, Heart, MessageSquare, Calendar } from "lucide-react"
import { Link } from "react-router-dom"
import { formatNumber } from "../../utils/formatNumber"
import { formatDistanceToNow } from "date-fns"
import {
    sanitizeVideoTitle,
    sanitizeVideoDescription,
} from "../../utils/sanitize"

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
                {/* Thumbnail */}
                <div className="relative w-full md:w-64 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <Link
                        to={`/video/${video._id}`}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <div className="bg-red-600 p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <Play
                                size={24}
                                fill="currentColor"
                                className="text-white ml-1"
                            />
                        </div>
                    </Link>
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                        {formatNumber(video.duration)}s
                    </div>
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
