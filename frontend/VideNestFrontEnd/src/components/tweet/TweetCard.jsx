// ============================================
// TWEET CARD COMPONENT - REUSABLE TWEET ITEM
// ============================================
// Displays tweet content, image, and owner info.
// Used in profile page and tweet feed.

import React, { useState } from "react"
import { Heart, MessageCircle, Share2, User } from "lucide-react"
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
            className={`group relative w-full mb-6 break-inside-avoid rounded-2xl overflow-hidden shadow-lg bg-[#2A2D2E] transition-all duration-300 border border-transparent flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:bg-[#2F3233] hover:border-white/10 ${
                !hasImage ? "min-h-[300px]" : "cursor-pointer"
            }`}
        >
            {/* TOP SECTION: IMAGE & ACTIONS OVERLAY - Only show if image exists */}
            {hasImage && (
                <div className="relative w-full isolate overflow-hidden bg-[#1E2021]">
                    {/* Image */}
                    <img
                        src={getOptimizedUrl(tweet.image, { width: 600 })} // Resize to ~600px width (enough for card)
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

            {/* TEXT-ONLY OVERLAY ACTIONS */}
            {!hasImage && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 z-10 pointer-events-none group-hover:pointer-events-auto">
                    {/* Like Action */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            handleLike()
                        }}
                        className="flex flex-col items-center gap-1 group/btn transition-transform hover:scale-110"
                        title="Like"
                    >
                        <div
                            className={`p-3 rounded-full ${isLiked ? "bg-red-600 text-white shadow-lg shadow-red-600/40" : "bg-white/20 text-white hover:bg-white/30"}`}
                        >
                            <Heart
                                size={24}
                                fill={isLiked ? "currentColor" : "none"}
                            />
                        </div>
                    </button>

                    {/* Comment Action */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/tweet/${tweet._id}`, {
                                state: { background: location },
                            })
                        }}
                        className="flex flex-col items-center gap-1 group/btn transition-transform hover:scale-110"
                        title="Comment"
                    >
                        <div className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30">
                            <MessageCircle size={24} />
                        </div>
                    </button>

                    {/* Share Action */}
                    <button
                        onClick={handleShare}
                        className="flex flex-col items-center gap-1 group/btn transition-transform hover:scale-110"
                        title="Share"
                    >
                        <div className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30">
                            <Share2 size={24} />
                        </div>
                    </button>
                </div>
            )}

            {/* BOTTOM SECTION: TEXT & INFO */}
            <div
                className={`p-5 flex flex-col gap-4 ${!hasImage ? "flex-1 justify-between h-full relative" : ""}`}
            >
                {/* Content */}
                <p
                    className={`text-white font-medium leading-relaxed ${!hasImage ? "text-xl line-clamp-6" : "text-lg line-clamp-2 mb-2"}`}
                >
                    {tweet.content}
                </p>

                {/* Owner Info & Likes */}
                <div className="flex items-center justify-between mt-auto pt-2 relative z-20">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {tweet.ownerDetails?.avatar ? (
                            <img
                                src={tweet.ownerDetails.avatar}
                                alt={tweet.ownerDetails?.username}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(
                                        `/channel/${tweet.ownerDetails?.username}`
                                    )
                                }}
                                className="h-10 w-10 rounded-full object-cover border border-white/10 hover:border-red-500 transition-colors cursor-pointer"
                            />
                        ) : (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(
                                        `/channel/${tweet.ownerDetails?.username}`
                                    )
                                }}
                                className="h-10 w-10 rounded-full bg-gray-700 border border-white/10 hover:border-red-500 transition-colors cursor-pointer flex items-center justify-center"
                            >
                                <User size={20} className="text-gray-400" />
                            </div>
                        )}
                        {/* Name & Date */}
                        <div className="flex flex-col">
                            <span
                                className="font-semibold text-white text-sm truncate max-w-[120px] hover:underline"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(
                                        `/channel/${tweet.ownerDetails?.username}`
                                    )
                                }}
                            >
                                {tweet.ownerDetails?.fullName}
                            </span>
                            <span className="text-xs text-gray-400">
                                {formatDate(tweet.createdAt)}
                            </span>
                        </div>
                    </div>

                    {/* Like Count (Footer - Neutral) */}
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <div className="p-1.5 rounded-full bg-white/5">
                            <Heart size={14} />
                        </div>
                        <span className="text-sm font-bold">{likesCount}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TweetCard
