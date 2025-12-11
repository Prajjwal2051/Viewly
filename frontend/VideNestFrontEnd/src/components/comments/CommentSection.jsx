import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Loader2, Send, Trash2, Edit2, MoreVertical } from "lucide-react"
import {
    getVideoComments,
    addComment,
    deleteComment,
    updateComment,
} from "../../api/commentApi"
import toast from "react-hot-toast"
import Input from "../layout/ui/Input" // Utilizing our reusable Input/TextArea if compatible, or standard HTML

const CommentSection = ({ videoId }) => {
    const { user } = useSelector((state) => state.auth)
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    // Initial Fetch
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const data = await getVideoComments(videoId, 1, 10)
                // Adjust based on actual API response structure (data.docs or data.comments)
                // Our mock plan said response.data which is ApiResponse object
                // The actual controller returns { docs: [], totalDocs: ... } inside data
                setComments(data.data?.comments || [])
                setHasMore(data.data?.hasNextPage)
            } catch (error) {
                console.error("Failed to load comments", error)
            } finally {
                setLoading(false)
            }
        }
        if (videoId) fetchComments()
    }, [videoId])

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
            const response = await addComment(newComment, videoId)
            // Backend returns the created comment with populated owner
            // Add to top of list
            setComments((prev) => [response.data, ...prev])
            setNewComment("")
            toast.success("Comment added")
        } catch (error) {
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

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold mb-6 text-white">
                {comments.length} Comments
            </h3>

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
                    comments.map((comment) => (
                        <div key={comment._id} className="flex gap-4 group">
                            <img
                                src={
                                    comment.ownerDetails?.avatar ||
                                    "https://via.placeholder.com/40"
                                }
                                alt={comment.ownerDetails?.username}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-white text-sm">
                                        @{comment.ownerDetails?.username}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                        {new Date(
                                            comment.createdAt
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-300 text-sm">
                                    {comment.content}
                                </p>

                                {/* ACTIONS (Like / Delete) */}
                                <div className="flex items-center gap-4 mt-2">
                                    {/* Owner controls */}
                                    {user?._id ===
                                        comment.ownerDetails?._id && (
                                        <button
                                            onClick={() =>
                                                handleDelete(comment._id)
                                            }
                                            className="text-gray-500 hover:text-red-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default CommentSection
