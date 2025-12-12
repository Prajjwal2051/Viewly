import React, { useState } from "react"
import { Heart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toggleTweetLike } from "../../api/tweetApi"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const TweetCard = ({ tweet }) => {
    const navigate = useNavigate()
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(tweet.likes || 0)

    console.log(`TweetCard: ${tweet._id}`, {
        image: tweet.image,
        content: tweet.content,
    })

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

    return (
        <div className="relative w-full mb-6 break-inside-avoid rounded-2xl overflow-hidden shadow-lg bg-[#2A2D2E]">
            {/* BACKGROUND IMAGE - Natural Aspect Ratio */}
            {tweet.image ? (
                <img
                    src={tweet.image?.replace("http://", "https://")}
                    alt={tweet.content}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
            ) : (
                <div className="w-full h-48 bg-[#2A2D2E] flex items-center justify-center p-4">
                    <p className="text-white text-center">{tweet.content}</p>
                </div>
            )}

            {/* GRADIENT OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

            {/* CONTENT OVERLAY */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* Caption/Content (Truncated) */}
                {tweet.content && (
                    <p className="text-white font-medium text-sm line-clamp-2 leading-snug mb-2 drop-shadow-md">
                        {tweet.content}
                    </p>
                )}

                {/* Author & Stats Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Avatar */}
                        <img
                            src={
                                tweet.ownerDetails?.avatar ||
                                "https://via.placeholder.com/30"
                            }
                            alt={tweet.ownerDetails?.username}
                            className="h-6 w-6 rounded-full object-cover border border-white/20"
                        />
                        <div className="text-[10px] text-gray-300">
                            <span className="block font-semibold text-white truncate max-w-[80px]">
                                {tweet.ownerDetails?.fullName}
                            </span>
                            <span>{formatDate(tweet.createdAt)}</span>
                        </div>
                    </div>

                    {/* Like Button */}
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-full backdrop-blur-sm transition-colors ${
                            isLiked
                                ? "bg-red-500/20 text-red-500"
                                : "bg-[#1E2021]/10 text-white hover:bg-[#1E2021]/20"
                        }`}
                    >
                        <Heart
                            size={14}
                            fill={isLiked ? "currentColor" : "none"}
                        />
                        <span className="text-xs font-bold">{likesCount}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TweetCard
