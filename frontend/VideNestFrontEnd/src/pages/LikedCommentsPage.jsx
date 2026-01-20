// ============================================
// LIKED COMMENTS PAGE
// ============================================
// Displays all comments that the user has liked

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { getLikedComments } from "../api/likeApi"
import { MessageSquare, Heart, Loader2, Video, Twitter } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { sanitizeComment, sanitizeDisplayName } from "../utils/sanitize"
import toast from "react-hot-toast"

const LikedCommentsPage = () => {
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalComments: 0,
    })

    useEffect(() => {
        if (!user) {
            navigate("/login")
            return
        }
        fetchLikedComments()
    }, [user, navigate, pagination.currentPage])

    const fetchLikedComments = async () => {
        try {
            setLoading(true)
            const response = await getLikedComments({
                page: pagination.currentPage,
                limit: 20,
            })

            const data = response.data || response
            setComments(data.likedComments || [])
            setPagination(
                data.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalComments: 0,
                }
            )
        } catch (error) {
            console.error("Failed to fetch liked comments:", error)
            toast.error("Failed to load liked comments")
        } finally {
            setLoading(false)
        }
    }

    const handleCommentClick = (comment) => {
        // Navigate to the video or tweet where the comment was made
        if (comment.video) {
            navigate(`/video/${comment.video._id}`)
        } else if (comment.tweet) {
            navigate(`/tweet/${comment.tweet._id}`)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#1E2021]">
                <Loader2 className="w-12 h-12 animate-spin text-red-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1E2021] text-white pt-6 pb-12">
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart
                            className="text-red-500"
                            size={32}
                            fill="currentColor"
                        />
                        <h1 className="text-4xl font-bold">Liked Comments</h1>
                    </div>
                    <p className="text-gray-400">
                        Comments you've liked across videos and tweets
                    </p>
                </div>

                {/* Comments List */}
                {comments.length > 0 ? (
                    <>
                        <div className="mb-4 text-gray-400">
                            {pagination.totalComments} liked comment
                            {pagination.totalComments !== 1 ? "s" : ""}
                        </div>

                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div
                                    key={comment._id}
                                    onClick={() => handleCommentClick(comment)}
                                    className="bg-[#2A2D2E] border border-[#323638] rounded-xl p-4 hover:bg-[#323638] transition-colors cursor-pointer group"
                                >
                                    {/* Comment Header */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <img
                                            src={
                                                comment.owner?.avatar ||
                                                "https://via.placeholder.com/40"
                                            }
                                            alt={comment.owner?.username}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-white">
                                                    {sanitizeDisplayName(
                                                        comment.owner?.fullName
                                                    )}
                                                </span>
                                                <span className="text-gray-500 text-sm">
                                                    @{comment.owner?.username}
                                                </span>
                                                <span className="text-gray-600">
                                                    •
                                                </span>
                                                <span className="text-gray-500 text-sm">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            comment.createdAt
                                                        ),
                                                        {
                                                            addSuffix: true,
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 leading-relaxed">
                                                {sanitizeComment(
                                                    comment.content
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Comment Context */}
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-3 pt-3 border-t border-[#323638]">
                                        {comment.video ? (
                                            <>
                                                <Video size={16} />
                                                <span>Commented on video:</span>
                                                <span className="text-white font-medium truncate">
                                                    {comment.video.title}
                                                </span>
                                            </>
                                        ) : comment.tweet ? (
                                            <>
                                                <Twitter size={16} />
                                                <span>Commented on tweet</span>
                                            </>
                                        ) : null}
                                    </div>

                                    {/* Like Count */}
                                    <div className="flex items-center gap-2 mt-3">
                                        <Heart
                                            size={14}
                                            className="text-red-500"
                                            fill="currentColor"
                                        />
                                        <span className="text-sm text-gray-400">
                                            {comment.likesCount || 0}{" "}
                                            {comment.likesCount === 1
                                                ? "like"
                                                : "likes"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() =>
                                        setPagination({
                                            ...pagination,
                                            currentPage:
                                                pagination.currentPage - 1,
                                        })
                                    }
                                    disabled={!pagination.hasPrevPage}
                                    className="px-4 py-2 bg-[#2A2D2E] text-white rounded-lg hover:bg-[#323638] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                <span className="text-gray-400">
                                    Page {pagination.currentPage} of{" "}
                                    {pagination.totalPages}
                                </span>

                                <button
                                    onClick={() =>
                                        setPagination({
                                            ...pagination,
                                            currentPage:
                                                pagination.currentPage + 1,
                                        })
                                    }
                                    disabled={!pagination.hasNextPage}
                                    className="px-4 py-2 bg-[#2A2D2E] text-white rounded-lg hover:bg-[#323638] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
                        <MessageSquare
                            className="text-gray-500 mb-4"
                            size={64}
                        />
                        <h3 className="text-2xl font-semibold text-gray-400 mb-2">
                            No liked comments yet
                        </h3>
                        <p className="text-gray-500 text-center max-w-md">
                            When you like comments on videos or tweets, they'll
                            appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LikedCommentsPage
