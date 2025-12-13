import React, { useState, useEffect } from "react"
import { X, Loader2, Plus, Check, ListVideo } from "lucide-react"
import { useSelector } from "react-redux"
import { getUserPlaylists, addVideoToPlaylist } from "../../api/playlistApi"
import CreatePlaylistModal from "./CreatePlaylistModal"
import toast from "react-hot-toast"

const AddToPlaylistModal = ({
    isOpen,
    onClose,
    videoId,
    videoTitle,
    isSidebar = false,
}) => {
    const { user } = useSelector((state) => state.auth)
    const [playlists, setPlaylists] = useState([])
    const [loading, setLoading] = useState(false)
    const [addingTo, setAddingTo] = useState({}) // Track which playlists are being updated
    const [showCreateModal, setShowCreateModal] = useState(false)

    // Fetch user's playlists
    useEffect(() => {
        if (isOpen && user) {
            fetchPlaylists()
        }
    }, [isOpen, user])

    const fetchPlaylists = async () => {
        try {
            setLoading(true)
            const response = await getUserPlaylists(user._id, 1, 50) // Get up to 50 playlists
            setPlaylists(response.data?.playlists || [])
        } catch (error) {
            console.error("Error fetching playlists:", error)
            toast.error("Failed to load playlists")
        } finally {
            setLoading(false)
        }
    }

    const handleAddToPlaylist = async (playlistId) => {
        try {
            setAddingTo((prev) => ({ ...prev, [playlistId]: true }))

            await addVideoToPlaylist(playlistId, videoId)

            toast.success("Added to playlist!")

            // Update local state to show checkmark
            setPlaylists((prev) =>
                prev.map((p) =>
                    p._id === playlistId
                        ? { ...p, videos: [...(p.videos || []), videoId] }
                        : p
                )
            )
        } catch (error) {
            console.error("Error adding to playlist:", error)
            const errorMsg = error.message || "Failed to add to playlist"

            // Check if video already exists
            if (errorMsg.includes("already exists")) {
                toast.error("Video already in this playlist")
            } else {
                toast.error(errorMsg)
            }
        } finally {
            setAddingTo((prev) => ({ ...prev, [playlistId]: false }))
        }
    }

    const isVideoInPlaylist = (playlist) => {
        return playlist.videos?.some((v) => v._id === videoId || v === videoId)
    }

    const handleCreateSuccess = (newPlaylist) => {
        // Add new playlist to list
        setPlaylists((prev) => [newPlaylist, ...prev])
        setShowCreateModal(false)

        // Automatically add video to new playlist
        if (newPlaylist._id) {
            handleAddToPlaylist(newPlaylist._id)
        }
    }

    if (!isOpen) return null

    // Sidebar mode - render without overlay
    if (isSidebar) {
        return (
            <>
                {/* Create New Playlist Button */}
                <div className="mb-4">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        <Plus size={20} />
                        Create New Playlist
                    </button>
                </div>

                {/* Playlists List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-3" />
                            <p className="text-gray-400">
                                Loading playlists...
                            </p>
                        </div>
                    ) : playlists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ListVideo className="w-16 h-16 text-gray-600 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-300 mb-2">
                                No playlists yet
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Create your first playlist to save videos
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {playlists.map((playlist) => {
                                const inPlaylist = isVideoInPlaylist(playlist)
                                const isAdding = addingTo[playlist._id]

                                return (
                                    <button
                                        key={playlist._id}
                                        onClick={() =>
                                            !inPlaylist &&
                                            !isAdding &&
                                            handleAddToPlaylist(playlist._id)
                                        }
                                        disabled={inPlaylist || isAdding}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                            inPlaylist
                                                ? "bg-green-600/10 border-green-600/50 cursor-default"
                                                : "bg-[#2A2D2E] border-gray-600 hover:border-red-600 hover:bg-[#2A2D2E]/80"
                                        } ${isAdding ? "opacity-50 cursor-wait" : ""}`}
                                    >
                                        <div
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                                inPlaylist
                                                    ? "bg-green-600 border-green-600"
                                                    : "border-gray-500"
                                            }`}
                                        >
                                            {inPlaylist && (
                                                <Check
                                                    size={14}
                                                    className="text-white"
                                                />
                                            )}
                                            {isAdding && (
                                                <Loader2
                                                    size={14}
                                                    className="text-white animate-spin"
                                                />
                                            )}
                                        </div>

                                        <div className="flex-1 text-left min-w-0">
                                            <h4 className="font-medium text-white line-clamp-1">
                                                {playlist.name}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {playlist.videoCount || 0}{" "}
                                                videos •{" "}
                                                {playlist.isPublic
                                                    ? "Public"
                                                    : "Private"}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Create Playlist Modal */}
                <CreatePlaylistModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            </>
        )
    }

    // Modal mode - render with overlay
    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <div
                    className="relative w-full max-w-md bg-[#1E2021] rounded-2xl shadow-2xl border border-gray-700 animate-in fade-in zoom-in duration-200 max-h-[80vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Save to Playlist
                            </h2>
                            {videoTitle && (
                                <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                                    {videoTitle}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Create New Playlist Button */}
                    <div className="p-4 border-b border-gray-700 flex-shrink-0">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            <Plus size={20} />
                            Create New Playlist
                        </button>
                    </div>

                    {/* Playlists List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-3" />
                                <p className="text-gray-400">
                                    Loading playlists...
                                </p>
                            </div>
                        ) : playlists.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <ListVideo className="w-16 h-16 text-gray-600 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                                    No playlists yet
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Create your first playlist to save videos
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {playlists.map((playlist) => {
                                    const inPlaylist =
                                        isVideoInPlaylist(playlist)
                                    const isAdding = addingTo[playlist._id]

                                    return (
                                        <button
                                            key={playlist._id}
                                            onClick={() =>
                                                !inPlaylist &&
                                                !isAdding &&
                                                handleAddToPlaylist(
                                                    playlist._id
                                                )
                                            }
                                            disabled={inPlaylist || isAdding}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                                inPlaylist
                                                    ? "bg-green-600/10 border-green-600/50 cursor-default"
                                                    : "bg-[#2A2D2E] border-gray-600 hover:border-red-600 hover:bg-[#2A2D2E]/80"
                                            } ${isAdding ? "opacity-50 cursor-wait" : ""}`}
                                        >
                                            {/* Checkbox/Check */}
                                            <div
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                                    inPlaylist
                                                        ? "bg-green-600 border-green-600"
                                                        : "border-gray-500"
                                                }`}
                                            >
                                                {inPlaylist && (
                                                    <Check
                                                        size={14}
                                                        className="text-white"
                                                    />
                                                )}
                                                {isAdding && (
                                                    <Loader2
                                                        size={14}
                                                        className="text-white animate-spin"
                                                    />
                                                )}
                                            </div>

                                            {/* Playlist Info */}
                                            <div className="flex-1 text-left min-w-0">
                                                <h4 className="font-medium text-white line-clamp-1">
                                                    {playlist.name}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {playlist.videoCount || 0}{" "}
                                                    videos •{" "}
                                                    {playlist.isPublic
                                                        ? "Public"
                                                        : "Private"}
                                                </p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Playlist Modal */}
            <CreatePlaylistModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />
        </>
    )
}

export default AddToPlaylistModal
