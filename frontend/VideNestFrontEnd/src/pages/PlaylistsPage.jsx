// ============================================
// PLAYLISTS PAGE - PLAYLIST MANAGEMENT
// ============================================
// Displays user's playlists with filtering and creation options.
// Allows organizing videos into collections for easy access.

import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { getUserPlaylists } from "../api/playlistApi"
import PlaylistCard from "../components/playlist/PlaylistCard"
import CreatePlaylistModal from "../components/playlist/CreatePlaylistModal"
import EmptyState from "../components/ui/EmptyState"
import { ListVideo, Plus, Loader2, Globe, Lock } from "lucide-react"
import toast from "react-hot-toast"

/**
 * PLAYLISTS PAGE COMPONENT
 * 
 * Purpose:
 * - Display all playlists created by the user
 * - Filter playlists by visibility (all, public, private)
 * - Create new playlists
 * 
 * Key Features:
 * - Grid layout for playlist cards
 * - "Create Playlist" button
 * - Filter tabs (All, Public, Private)
 * - Click to view playlist details
 * 
 * Use Cases:
 * - Organize favorite videos into themed collections
 * - Create watch-later lists
 * - Share curated video collections with others
 * 
 * Privacy Settings:
 * - Public: Anyone can view (shows in search, shareable)
 * - Private: Only owner can view (hidden from others)
 */
const PlaylistsPage = () => {
    const { user } = useSelector((state) => state.auth)
    const navigate = useNavigate()

    const [playlists, setPlaylists] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [filter, setFilter] = useState("all") // 'all', 'public', 'private'

    useEffect(() => {
        if (!user) {
            navigate("/login")
            return
        }
        fetchPlaylists()
    }, [user, navigate])

    const fetchPlaylists = async () => {
        try {
            setLoading(true)
            const response = await getUserPlaylists(user._id, 1, 50)
            setPlaylists(response.data?.playlists || [])
        } catch (error) {
            console.error("Error fetching playlists:", error)
            toast.error("Failed to load playlists")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateSuccess = (newPlaylist) => {
        setPlaylists((prev) => [newPlaylist, ...prev])
        setShowCreateModal(false)
    }

    // Filter playlists
    const filteredPlaylists = playlists.filter((playlist) => {
        if (filter === "public") return playlist.isPublic
        if (filter === "private") return !playlist.isPublic
        return true
    })

    return (
        <div className="min-h-screen bg-[#1E2021] text-white pt-6 pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-bold mb-2 flex items-center gap-2 md:gap-3">
                                <ListVideo className="text-red-500" size={28} />
                                My Playlists
                            </h1>
                            <p className="text-sm md:text-base text-gray-400">
                                Organize your favorite videos into playlists
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30"
                        >
                            <Plus size={20} />
                            Create Playlist
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 border-b border-gray-700 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-3 md:px-4 py-2 font-medium transition-colors whitespace-nowrap text-sm md:text-base ${filter === "all"
                                    ? "text-red-600 border-b-2 border-red-600"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            All ({playlists.length})
                        </button>
                        <button
                            onClick={() => setFilter("public")}
                            className={`px-3 md:px-4 py-2 font-medium transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap text-sm md:text-base ${filter === "public"
                                    ? "text-red-600 border-b-2 border-red-600"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <Globe size={14} className="md:w-4 md:h-4" />
                            Public ({playlists.filter((p) => p.isPublic).length}
                            )
                        </button>
                        <button
                            onClick={() => setFilter("private")}
                            className={`px-3 md:px-4 py-2 font-medium transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap text-sm md:text-base ${filter === "private"
                                    ? "text-red-600 border-b-2 border-red-600"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <Lock size={14} className="md:w-4 md:h-4" />
                            Private (
                            {playlists.filter((p) => !p.isPublic).length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-red-600 mb-4" />
                        <p className="text-gray-400">Loading playlists...</p>
                    </div>
                ) : filteredPlaylists.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPlaylists.map((playlist) => (
                            <PlaylistCard
                                key={playlist._id}
                                playlist={playlist}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={ListVideo}
                        title={
                            filter === "all"
                                ? "No playlists yet"
                                : filter === "public"
                                    ? "No public playlists"
                                    : "No private playlists"
                        }
                        description={
                            filter === "all"
                                ? "Create your first playlist to organize your favorite videos"
                                : filter === "public"
                                    ? "Create a public playlist to share with others"
                                    : "Create a private playlist for personal use"
                        }
                        actionLabel="Create Playlist"
                        onAction={() => setShowCreateModal(true)}
                        animated={true}
                    />
                )}
            </div>

            {/* Create Playlist Modal */}
            <CreatePlaylistModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    )
}

export default PlaylistsPage
