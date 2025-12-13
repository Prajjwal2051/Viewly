import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
    getPlaylistById,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
} from "../api/playlistApi"
import VideoCard from "../components/video/VideoCard"
import CreatePlaylistModal from "../components/playlist/CreatePlaylistModal"
import {
    ArrowLeft,
    Edit,
    Trash2,
    Play,
    Loader2,
    Globe,
    Lock,
    MoreVertical,
} from "lucide-react"
import toast from "react-hot-toast"

const PlaylistDetailPage = () => {
    const { playlistId } = useParams()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)

    const [playlist, setPlaylist] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    useEffect(() => {
        fetchPlaylist()
    }, [playlistId])

    const fetchPlaylist = async () => {
        try {
            setLoading(true)
            const response = await getPlaylistById(playlistId)
            setPlaylist(response.data)
        } catch (error) {
            console.error("Error fetching playlist:", error)
            toast.error("Failed to load playlist")
            navigate("/playlists")
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveVideo = async (videoId) => {
        console.log("[PlaylistDetail] Remove video clicked:", {
            playlistId,
            videoId,
        })

        if (!confirm("Remove this video from playlist?")) {
            console.log("[PlaylistDetail] User cancelled removal")
            return
        }

        try {
            console.log(
                "[PlaylistDetail] Calling removeVideoFromPlaylist API..."
            )
            const response = await removeVideoFromPlaylist(playlistId, videoId)
            console.log("[PlaylistDetail] API response:", response)
            toast.success("Video removed from playlist")

            // Update local state
            setPlaylist((prev) => ({
                ...prev,
                videos: prev.videos.filter((v) => v._id !== videoId),
                videoCount: prev.videoCount - 1,
            }))
            console.log("[PlaylistDetail] Local state updated")
        } catch (error) {
            console.error("[PlaylistDetail] Error removing video:", error)
            console.error(
                "[PlaylistDetail] Error details:",
                error.response?.data || error.message
            )
            toast.error("Failed to remove video")
        }
    }

    const handleDeletePlaylist = async () => {
        if (!confirm("Delete this playlist? This action cannot be undone."))
            return

        try {
            await deletePlaylist(playlistId)
            toast.success("Playlist deleted")
            navigate("/playlists")
        } catch (error) {
            console.error("Error deleting playlist:", error)
            toast.error("Failed to delete playlist")
        }
    }

    const handleUpdateSuccess = (updatedPlaylist) => {
        setPlaylist((prev) => ({
            ...prev,
            ...updatedPlaylist,
        }))
        setShowEditModal(false)
        toast.success("Playlist updated")
    }

    const isOwner = user && playlist && playlist.owner?._id === user._id

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1E2021] flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-red-600" />
            </div>
        )
    }

    if (!playlist) {
        return (
            <div className="min-h-screen bg-[#1E2021] flex items-center justify-center">
                <p className="text-gray-400">Playlist not found</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1E2021] text-white pt-4 md:pt-6 pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/playlists")}
                    className="mb-4 md:mb-6 flex items-center gap-2 text-sm md:text-base text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={18} className="md:w-5 md:h-5" />
                    Back to Playlists
                </button>

                {/* Playlist Header */}
                <div className="bg-[#2A2D2E] rounded-xl md:rounded-2xl p-4 md:p-8 mb-6 md:mb-8 border border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 md:mb-2">
                                <h1 className="text-2xl md:text-4xl font-bold">
                                    {playlist.name}
                                </h1>
                                {playlist.isPublic ? (
                                    <div className="flex items-center gap-1 px-2 md:px-3 py-1 bg-green-600/20 border border-green-600/50 rounded-full w-fit">
                                        <Globe
                                            size={12}
                                            className="text-green-400 md:w-3.5 md:h-3.5"
                                        />
                                        <span className="text-green-400 text-xs md:text-sm font-medium">
                                            Public
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 px-2 md:px-3 py-1 bg-gray-600/20 border border-gray-500/50 rounded-full w-fit">
                                        <Lock
                                            size={12}
                                            className="text-gray-400 md:w-3.5 md:h-3.5"
                                        />
                                        <span className="text-gray-400 text-xs md:text-sm font-medium">
                                            Private
                                        </span>
                                    </div>
                                )}
                            </div>

                            {playlist.description && (
                                <p className="text-sm md:text-base text-gray-400 mb-3 md:mb-4">
                                    {playlist.description}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                                <span>{playlist.videoCount || 0} videos</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline">
                                    Created by{" "}
                                    {playlist.owner?.username || "Unknown"}
                                </span>
                                <span className="hidden md:inline">•</span>
                                <span className="hidden md:inline">
                                    Updated{" "}
                                    {new Date(
                                        playlist.updatedAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        {isOwner && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <MoreVertical size={20} />
                                </button>

                                {showMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[#1E2021] border border-gray-700 rounded-lg shadow-xl overflow-hidden z-10">
                                        <button
                                            onClick={() => {
                                                setShowEditModal(true)
                                                setShowMenu(false)
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors"
                                        >
                                            <Edit size={18} />
                                            Edit Playlist
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleDeletePlaylist()
                                                setShowMenu(false)
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-500 hover:bg-gray-700 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                            Delete Playlist
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Play All Button */}
                    {playlist.videos?.length > 0 && (
                        <button
                            onClick={() => {
                                // Navigate to first video
                                navigate(`/video/${playlist.videos[0]._id}`)
                            }}
                            className="mt-4 md:mt-6 w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                        >
                            <Play
                                size={18}
                                className="md:w-5 md:h-5"
                                fill="white"
                            />
                            Play All
                        </button>
                    )}
                </div>

                {/* Videos Grid */}
                {playlist.videos?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {playlist.videos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[#2A2D2E]/30 rounded-xl">
                        <Play
                            className="mx-auto mb-4 text-gray-500"
                            size={64}
                        />
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">
                            No videos in this playlist
                        </h3>
                        <p className="text-gray-500">
                            {isOwner
                                ? "Start adding videos to build your playlist"
                                : "This playlist is empty"}
                        </p>
                    </div>
                )}
            </div>

            {/* Edit Playlist Modal */}
            {showEditModal && (
                <CreatePlaylistModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleUpdateSuccess}
                    initialData={playlist}
                    isEdit={true}
                />
            )}
        </div>
    )
}

export default PlaylistDetailPage
