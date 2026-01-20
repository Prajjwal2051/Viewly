// ============================================
// PLAYLIST CARD COMPONENT - PLAYLIST PREVIEW ITEM
// ============================================
// Displays a playlist preview with thumbnail, video count, and privacy status.
// Used on the Playlists page to show all user playlists.

import React from "react"
import { useNavigate } from "react-router-dom"
import { ListVideo, Lock, Globe } from "lucide-react"

/**
 * PLAYLIST CARD COMPONENT
 * 
 * Purpose:
 * - Display playlist preview in grid layout
 * - Show key playlist information at a glance
 * - Provide clickable access to playlist details
 * 
 * Card Information Displayed:
 * - Thumbnail: First video's thumbnail or placeholder icon
 * - Video Count: Number of videos in playlist
 * - Privacy Status: Public (anyone can view) or Private (owner only)
 * - Name & Description: Playlist title and description
 * 
 * Design Features:
 * - Hover effects: scale up and glow border
 * - Overlays: video count badge, privacy indicator
 * - Placeholder: Shows icon when no videos yet
 * - Responsive: adapts to different screen sizes
 * 
 * Privacy Indicators:
 * - Green "Public" badge with globe icon
 * - Gray "Private" badge with lock icon
 * 
 * @param {Object} playlist - Playlist data object
 * @param {string} playlist._id - Playlist ID for navigation
 * @param {string} playlist.name - Playlist title
 * @param {string} playlist.description - Playlist description
 * @param {boolean} playlist.isPublic - Privacy setting
 * @param {Array} playlist.videos - Array of video objects
 * @param {number} playlist.videoCount - Total videos (if provided)
 */

const PlaylistCard = ({ playlist }) => {
    const navigate = useNavigate()

    // Get first video thumbnail or use placeholder
    const thumbnail = playlist.videos?.[0]?.thumbnail || null
    const videoCount = playlist.videoCount || playlist.videos?.length || 0

    return (
        <div
            onClick={() => navigate(`/playlists/${playlist._id}`)}
            className="group cursor-pointer bg-[#2A2D2E] rounded-xl overflow-hidden border border-gray-700 hover:border-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-600/20"
        >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-[#1E2021] flex items-center justify-center overflow-hidden">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={playlist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        <ListVideo size={48} strokeWidth={1.5} />
                        <p className="text-sm mt-2">No videos yet</p>
                    </div>
                )}

                {/* Video Count Overlay */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <ListVideo size={14} className="text-white" />
                    <span className="text-white text-sm font-semibold">
                        {videoCount}
                    </span>
                </div>

                {/* Privacy Indicator */}
                <div className="absolute bottom-2 left-2">
                    {playlist.isPublic ? (
                        <div className="bg-green-600/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                            <Globe size={12} className="text-white" />
                            <span className="text-white text-xs font-medium">
                                Public
                            </span>
                        </div>
                    ) : (
                        <div className="bg-gray-600/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                            <Lock size={12} className="text-white" />
                            <span className="text-white text-xs font-medium">
                                Private
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-semibold text-white text-lg line-clamp-1 mb-1 group-hover:text-red-600 transition-colors">
                    {playlist.name}
                </h3>
                {playlist.description && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                        {playlist.description}
                    </p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>
                        {videoCount} {videoCount === 1 ? "video" : "videos"}
                    </span>
                    {playlist.updatedAt && (
                        <>
                            <span>•</span>
                            <span>
                                Updated{" "}
                                {new Date(
                                    playlist.updatedAt
                                ).toLocaleDateString()}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PlaylistCard
