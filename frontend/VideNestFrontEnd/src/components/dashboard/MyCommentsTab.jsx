import { useState, useEffect } from "react"
import {
    MessageSquare,
    Trash2,
    Edit,
    Video as VideoIcon,
    Image,
    ExternalLink,
} from "lucide-react"
import {
    getUserComments,
    updateComment,
    deleteComment,
} from "../../api/commentApi"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"

const MyCommentsTab = () => {
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [editContent, setEditContent] = useState("")
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalComments: 0,
    })
    const [commentToDelete, setCommentToDelete] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchComments()
    }, [pagination.currentPage])

    const fetchComments = async () => {
        setLoading(true)
        try {
            const response = await getUserComments(pagination.currentPage, 20)
            const data = response.data || response
            setComments(data.comments || [])
            setPagination({
                currentPage: data.currentPage || 1,
                totalPages: data.totalPages || 1,
                totalComments: data.totalComments || 0,
            })
        } catch (error) {
            console.error("Failed to fetch comments:", error)
            toast.error("Failed to load comments")
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (comment) => {
        setEditingId(comment._id)
        setEditContent(comment.content)
    }

    const handleSaveEdit = async (commentId) => {
        try {
            await updateComment(commentId, editContent)
            setComments((prev) =>
                prev.map((c) =>
                    c._id === commentId
                        ? { ...c, content: editContent, updatedAt: new Date() }
                        : c
                )
            )
            setEditingId(null)
            toast.success("Comment updated")
        } catch (error) {
            toast.error("Failed to update comment")
        }
    }

    const handleDeleteClick = (commentId) => {
        setCommentToDelete(commentId)
    }

    const confirmDelete = async () => {
        if (!commentToDelete) return

        try {
            await deleteComment(commentToDelete)
            setComments((prev) => prev.filter((c) => c._id !== commentToDelete))
            setPagination((prev) => ({
                ...prev,
                totalComments: prev.totalComments - 1,
            }))
            toast.success("Comment deleted successfully")
            setCommentToDelete(null)
        } catch (error) {
            toast.error("Failed to delete comment")
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (comments.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-medium mb-2">No comments yet</h3>
                <p>Comments you post will appear here</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                    My Comments ({pagination.totalComments})
                </h2>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div
                        key={comment._id}
                        className="bg-[#2A2D2E] rounded-lg p-4 hover:bg-[#3F4243] transition-colors"
                    >
                        {/* Comment Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1">
                                {/* Type Icon & Source Info */}
                                <div className="flex-shrink-0">
                                    {comment.commentType === "video" ? (
                                        <div className="w-12 h-12 bg-[#1E2021] rounded flex items-center justify-center">
                                            <VideoIcon className="w-6 h-6 text-red-500" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-[#1E2021] rounded flex items-center justify-center">
                                            <MessageSquare className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-400 font-medium truncate">
                                        {comment.commentType === "video"
                                            ? "Video Comment"
                                            : "Tweet Comment"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatDistanceToNow(
                                            new Date(comment.createdAt),
                                            { addSuffix: true }
                                        )}
                                        {comment.updatedAt !==
                                            comment.createdAt && " • Edited"}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {!editingId && (
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleEdit(comment)
                                        }}
                                        className="p-2 hover:bg-[#4A4D4E] rounded transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteClick(comment._id)
                                        }}
                                        className="p-2 hover:bg-red-600/20 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Comment Content */}
                        {editingId === comment._id ? (
                            <div className="space-y-3">
                                <textarea
                                    value={editContent}
                                    onChange={(e) =>
                                        setEditContent(e.target.value)
                                    }
                                    className="w-full bg-[#1E2021] text-white p-3 rounded border border-gray-700 focus:border-red-600 focus:outline-none resize-none"
                                    rows={3}
                                    maxLength={500}
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleSaveEdit(comment._id)
                                        }
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                                {comment.content}
                            </p>
                        )}

                        {/* Comment Stats */}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {comment.likes} likes
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button
                        onClick={() =>
                            setPagination((prev) => ({
                                ...prev,
                                currentPage: prev.currentPage - 1,
                            }))
                        }
                        disabled={pagination.currentPage === 1}
                        className="px-4 py-2 bg-[#2A2D2E] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3F4243] transition-colors"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-400">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() =>
                            setPagination((prev) => ({
                                ...prev,
                                currentPage: prev.currentPage + 1,
                            }))
                        }
                        disabled={
                            pagination.currentPage === pagination.totalPages
                        }
                        className="px-4 py-2 bg-[#2A2D2E] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3F4243] transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {commentToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1E2021] rounded-xl p-6 max-w-sm w-full border border-gray-700 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-2">
                            Delete Comment?
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to delete this comment? This
                            action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setCommentToDelete(null)}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyCommentsTab
