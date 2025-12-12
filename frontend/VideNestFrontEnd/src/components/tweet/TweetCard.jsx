import React, { useState } from "react"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toggleTweetLike } from "../../api/tweetApi"
import { toast } from "react-hot-toast"
import { useNavigate, useLocation } from "react-router-dom"

const TweetCard = ({ tweet }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(tweet.likes || 0)

    console.log(`TweetCard: ${tweet._id}`, {
        image: tweet.image,
        content: tweet.content,
    })

    const handleShare = (e) => {
        e.stopPropagation()
        const link = `${window.location.origin}/tweet/${tweet._id}`
        navigator.clipboard.writeText(link)
        toast.success("Link copied to clipboard!")
    }

    const handleComment = (e) => {
        e.stopPropagation()
        navigate(`/tweet/${tweet._id}`, { state: { background: location } })
    }

    const handleLike = async (e) => {
        e.stopPropagation()
        try {
            const response = await toggleTweetLike(tweet._id)
            setIsLiked(response.data.isliked)
            setLikesCount((prev) =>
                response.data.isliked ? prev + 1 : prev - 1
            )
        } catch (error) {
            toast.error("Failed to like post")
        }
    }

    const formatDate = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true })
        } catch {
            return "Recently"
        }
    }

    const hasImage = !!tweet.image

    return (
        <div
            onClick={() =>
                hasImage &&
                navigate(`/tweet/${tweet._id}`, {
                    state: { background: location },
                })
            }
            className={`group relative w-full mb-6 break-inside-avoid rounded-2xl overflow-hidden shadow-lg bg-[#2A2D2E] transition-all duration-300 border border-transparent flex flex-col ${
                hasImage
                    ? "hover:-translate-y-1 hover:shadow-2xl hover:bg-[#2F3233] cursor-pointer hover:border-white/10"
                    : ""
            }`}
        >
            {/* TOP SECTION: IMAGE & ACTIONS OVERLAY - Only show if image exists */}
            {hasImage && (
                <div className="relative w-full isolate overflow-hidden bg-[#1E2021]">
                    {/* Image */}
                    <img
                        src={tweet.image?.replace("http://", "https://")}
                        alt={tweet.content}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* HOVER OVERLAY - ACTION ICONS */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 z-10">
                        {/* Like Action */}
                        <button
                            onClick={handleLike}
                            className="flex flex-col items-center gap-1 group/btn"
                            title="Like"
                        >
                            <div
                                className={`p-3 rounded-full transition-all duration-300 ${isLiked ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/40 hover:scale-110"}`}
                            >
                                <Heart
                                    size={20}
                                    fill={isLiked ? "currentColor" : "none"}
                                />
                            </div>
                            <span className="text-xs font-bold text-white drop-shadow-md">
                                {likesCount}
                            </span>
                        </button>

                        {/* Comment Action */}
                        <button
                            onClick={handleComment}
                            className="flex flex-col items-center gap-1 group/btn"
                            title="Comment"
                        >
                            <div className="p-3 rounded-full bg-white/20 text-white hover:bg-white/40 hover:scale-110 transition-all duration-300">
                                <MessageCircle size={20} />
                            </div>
                            <span className="text-xs font-bold text-white drop-shadow-md">
                                Comment
                            </span>
                        </button>

                        {/* Share Action */}
                        <button
                            onClick={handleShare}
                            className="flex flex-col items-center gap-1 group/btn"
                            title="Share"
                        >
                            <div className="p-3 rounded-full bg-white/20 text-white hover:bg-white/40 hover:scale-110 transition-all duration-300">
                                <Share2 size={20} />
                            </div>
                            <span className="text-xs font-bold text-white drop-shadow-md">
                                Share
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* BOTTOM SECTION: TEXT & INFO */}
            <div className="p-4 flex flex-col gap-3">
                {/* Content */}
                {tweet.content && (
                    <p className="text-gray-100 font-medium text-base line-clamp-3 leading-relaxed">
                        {tweet.content}
                    </p>
                )}

                {/* Author Info */}
                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/5">
                    <img
                        src={
                            tweet.ownerDetails?.avatar ||
                            "https://via.placeholder.com/30"
                        }
                        alt={tweet.ownerDetails?.username}
                        className="h-8 w-8 rounded-full object-cover border border-white/10"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">
                            {tweet.ownerDetails?.fullName}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>@{tweet.ownerDetails?.username}</span>
                            <span>•</span>
                            <span>{formatDate(tweet.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TweetCard
