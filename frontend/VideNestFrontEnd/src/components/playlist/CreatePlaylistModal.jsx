// ============================================
// CREATE PLAYLIST MODAL - PLAYLIST CREATION/EDITING FORM
// ============================================
// Modal form for creating new playlists or editing existing ones.
// Includes name, description, and privacy settings.

import React, { useState, useEffect } from "react"
import { X, Loader2, Globe, Lock } from "lucide-react"
import { createPlaylist, updatePlaylist } from "../../api/playlistApi"
import toast from "react-hot-toast"

/**
 * CREATE PLAYLIST MODAL COMPONENT
 * 
 * Purpose:
 * - Create new playlists to organize videos
 * - Edit existing playlist details
 * - Set privacy (public vs private)
 * 
 * Form Fields:
 * 1. Name (required, max 100 characters)
 *    - Example: "Learning React", "Cooking Tutorials"
 * 2. Description (optional, max 500 characters)
 *    - Example: "Best React tutorials for beginners"
 * 3. Privacy Toggle
 *    - Public: Anyone can view and share
 *    - Private: Only you can see this playlist
 * 
 * Validation Rules:
 * - Name is required and cannot be empty
 * - Name max length: 100 characters
 * - Description max length: 500 characters
 * - Shows error toasts for validation failures
 * 
 * Dual Mode Operation:
 * - Create Mode: Empty form, "Create Playlist" button
 * - Edit Mode: Pre-filled form, "Update Playlist" button
 * 
 * Privacy Explained:
 * - Public playlists appear in search results
 * - Public playlists can be shared via link
 * - Private playlists are hidden from others
 * - Only playlist owner can change privacy
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onSuccess - Callback after successful create/update
 * @param {Object} initialData - Pre-fill data for edit mode (optional)
 * @param {boolean} isEdit - Toggles between create and edit mode
 */

const CreatePlaylistModal = ({
    isOpen,
    onClose,
    onSuccess,
    initialData = null,
    isEdit = false,
}) => {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isPublic, setIsPublic] = useState(true)
    const [loading, setLoading] = useState(false)

    // Populate form with initial data when editing
    useEffect(() => {
        if (isEdit && initialData) {
            setName(initialData.name || "")
            setDescription(initialData.description || "")
            setIsPublic(
                initialData.isPublic !== undefined ? initialData.isPublic : true
            )
        } else if (!isEdit) {
            // Reset form when not in edit mode or when modal is opened for creation
            setName("")
            setDescription("")
            setIsPublic(true)
        }
    }, [isEdit, initialData, isOpen]) // Added isOpen to dependency array to reset on close/open for creation

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (!name.trim()) {
            toast.error("Playlist name is required")
            return
        }

        if (name.trim().length > 100) {
            toast.error("Name cannot exceed 100 characters")
            return
        }

        if (description.trim().length > 500) {
            toast.error("Description cannot exceed 500 characters")
            return
        }

        try {
            setLoading(true)

            let response
            if (isEdit && initialData?._id) {
                // Update existing playlist
                response = await updatePlaylist(initialData._id, {
                    name: name.trim(),
                    description: description.trim(),
                    isPublic,
                })
                toast.success("Playlist updated successfully!")
            } else {
                // Create new playlist
                response = await createPlaylist({
                    name: name.trim(),
                    description: description.trim(),
                    isPublic,
                })
                toast.success("Playlist created successfully!")
            }

            // Reset form
            setName("")
            setDescription("")
            setIsPublic(true)

            // Call success callback
            if (onSuccess) {
                onSuccess(response.data)
            }

            onClose()
        } catch (error) {
            console.error(
                `Error ${isEdit ? "updating" : "creating"} playlist:`,
                error
            )
            toast.error(
                error.message ||
                `Failed to ${isEdit ? "update" : "create"} playlist`
            )
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md bg-[#1E2021] rounded-2xl shadow-2xl border border-gray-700 animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white">
                        {isEdit ? "Edit Playlist" : "Create Playlist"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Awesome Playlist"
                            maxLength={100}
                            className="w-full px-4 py-3 bg-[#2A2D2E] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                            disabled={loading}
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {name.length}/100 characters
                        </p>
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your playlist..."
                            maxLength={500}
                            rows={3}
                            className="w-full px-4 py-3 bg-[#2A2D2E] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all resize-none"
                            disabled={loading}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {description.length}/500 characters
                        </p>
                    </div>

                    {/* Privacy Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Privacy
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsPublic(true)}
                                disabled={loading}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${isPublic
                                        ? "bg-green-600/20 border-green-600 text-green-400"
                                        : "bg-[#2A2D2E] border-gray-600 text-gray-400 hover:border-gray-500"
                                    }`}
                            >
                                <Globe size={18} />
                                <span className="font-medium">Public</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPublic(false)}
                                disabled={loading}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${!isPublic
                                        ? "bg-gray-600/20 border-gray-500 text-gray-300"
                                        : "bg-[#2A2D2E] border-gray-600 text-gray-400 hover:border-gray-500"
                                    }`}
                            >
                                <Lock size={18} />
                                <span className="font-medium">Private</span>
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            {isPublic
                                ? "Anyone can view this playlist"
                                : "Only you can view this playlist"}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        className="animate-spin"
                                        size={18}
                                    />
                                    {isEdit ? "Updating..." : "Creating..."}
                                </>
                            ) : isEdit ? (
                                "Update Playlist"
                            ) : (
                                "Create Playlist"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreatePlaylistModal
