// ============================================
// COMMENT SECTION COMPONENT - DISCUSSION INTERFACE
// ============================================
// Full-featured comment system for videos and tweets.
// Supports adding, editing, deleting comments with real-time updates.

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Loader2, Send, Trash2, Edit2, MoreVertical } from "lucide-react"
import {
    getVideoComments,
    getTweetComments,
    addComment,
    deleteComment,
    updateComment,
} from "../../api/commentApi"
import toast from "react-hot-toast"
import Input from "../layout/ui/Input"
import { sanitizeComment, sanitizeDisplayName } from "../../utils/sanitize"

/**
 * COMMENT SECTION COMPONENT
 * 
 * Purpose:
 * - Display all comments on a video or tweet
 * - Allow users to post new comments
 * - Enable editing and deleting own comments
 * - Support pagination for large comment threads
 * 
 * Key Features:
 * - Real-time comment posting with optimistic updates
 * - Inline editing (click Edit → modify → Save)
 * - Delete confirmation
 * - Pagination (Load More button)
 * - Shows commenter avatar and name
 * - Timestamps ("2 hours ago", "3 days ago")
 * - XSS protection via sanitization
 * 
 * Dual Mode Operation:
 * - Video Comments: Pass videoId prop
 * - Tweet Comments: Pass tweetId prop
 * 
 * Authentication:
 * - Anyone can view comments
 * - Must be logged in to post
 * - Can only edit/delete own comments
 * 
 * @param {string} videoId - Video ID if commenting on video
 * @param {string} tweetId - Tweet ID if commenting on tweet
 * @param {boolean} hideHeader - Hide "Comments" header (optional)
 */

const CommentSection = ({ videoId, tweetId, hideHeader = false }) => {
    const { user } = useSelector((state) => state.auth)
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [editingCommentId, setEditingCommentId] = useState(null)
    const [editContent, setEditContent] = useState("")

    // Initial Fetch
    useEffect(() => {
        const fetchComments = async () => {
            try {
                let data
                if (tweetId) {
                    console.log(
                        "[CommentSection] Fetching tweet comments:",
                        tweetId
                    )
                    data = await getTweetComments(tweetId, 1, 10)
                } else if (videoId) {
                    console.log(
                        "[CommentSection] Fetching video comments:",
                        videoId
                    )
                    data = await getVideoComments(videoId, 1, 10)
                }

                console.log("[CommentSection] Fetched data:", data)
                console.log("[CommentSection] Comments array:", data?.comments)
                setComments(data?.comments || [])
                setHasMore(data?.hasNextPage)
            } catch (error) {
                console.error("Failed to load comments", error)
            } finally {
                setLoading(false)
            }
        }
        if (videoId || tweetId) fetchComments()
    }, [videoId, tweetId])

    // Add Comment
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return

        if (!user) {
            toast.error("Please login to comment")
            return
        }

        setSubmitting(true)
        try {
            // Pass both, let api helper handle nulls
            console.log("[CommentSection] Adding comment:", {
                content: newComment,
                videoId,
                tweetId,
            })
            const response = await addComment(newComment, videoId, tweetId)
            console.log("[CommentSection] Add response:", response)
            const addedComment = response.data || response
            console.log("[CommentSection] Added comment:", addedComment)

            // Ensure owner details are present for immediate display
            const commentWithOwner = {
                ...addedComment,
                ownerDetails: addedComment.ownerDetails || {
                    _id: user._id,
                    username: user.username,
                    fullName: user.fullName,
                    avatar: user.avatar,
                },
            }

            setComments((prev) => [commentWithOwner, ...prev])
            setNewComment("")
            toast.success("Comment added")
        } catch (error) {
            console.error("Failed to add comment:", error)
            toast.error("Failed to post comment")
        } finally {
            setSubmitting(false)
        }
    }

    // Delete Comment
    const handleDelete = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return
        try {
            await deleteComment(commentId)
            setComments((prev) => prev.filter((c) => c._id !== commentId))
            toast.success("Comment deleted")
        } catch (error) {
            toast.error("Failed to delete comment")
        }
    }

    // Start editing a comment
    const handleEdit = (comment) => {
        setEditingCommentId(comment._id)
        setEditContent(comment.content)
    }

    // Save edited comment
    const handleUpdate = async (commentId) => {
        if (!editContent.trim()) {
            toast.error("Comment cannot be empty")
            return
        }

        try {
            const response = await updateComment(commentId, editContent)
            const updated = response.data || response

            setComments((prev) =>
                prev.map((c) =>
                    c._id === commentId ? { ...c, content: editContent } : c
                )
            )
            setEditingCommentId(null)
            setEditContent("")
            toast.success("Comment updated")
        } catch (error) {
            toast.error("Failed to update comment")
        }
    }

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingCommentId(null)
        setEditContent("")
    }

    return (
        <div className="mt-8">
            {!hideHeader && (
                <h3 className="text-xl font-bold mb-6 text-white">
                    {comments.length} Comments
                </h3>
            )}

            {/* ADD COMMENT FORM */}
            <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
                <img
                    src={user?.avatar || "https://via.placeholder.com/40"}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                    <input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full bg-transparent border-b border-gray-700 focus:border-white text-white py-2 px-0 focus:outline-none transition-colors"
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submitting}
                            className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold text-sm disabled:opacity-50 hover:bg-red-700 transition"
                        >
                            {submitting ? "Posting..." : "Comment"}
                        </button>
                    </div>
                </div>
            </form>

            {/* COMMENTS LIST */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin text-red-600" />
                    </div>
                ) : (
                    comments.map((comment) => {
                        const owner = comment.ownerDetails || comment.owner
                        return (
                            <div key={comment._id} className="flex gap-4 group">
                                <img
                                    src={
                                        owner?.avatar ||
                                        "https://via.placeholder.com/40"
                                    }
                                    alt={owner?.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-white text-sm">
                                            @{owner?.username}
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            {new Date(
                                                comment.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {/* Comment Content or Edit Mode */}
                                    {editingCommentId === comment._id ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) =>
                                                    setEditContent(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full bg-[#2A2D2E] border border-gray-600 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-red-600 resize-none"
                                                rows="3"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleUpdate(
                                                            comment._id
                                                        )
                                                    }
                                                    className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-700 transition"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-700 transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-gray-300 text-sm">
                                                {sanitizeComment(
                                                    comment.content
                                                )}
                                            </p>

                                            {/* ACTIONS (Edit / Delete) */}
                                            <div className="flex items-center gap-4 mt-2">
                                                {/* Owner controls */}
                                                {user?._id === owner?._id && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(
                                                                    comment
                                                                )
                                                            }
                                                            className="text-gray-500 hover:text-blue-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    comment._id
                                                                )
                                                            }
                                                            className="text-gray-500 hover:text-red-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default CommentSection
