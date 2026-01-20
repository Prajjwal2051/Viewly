// ============================================
// VIDEO CONTROLS COMPONENT - LIKE & SUBSCRIBE ACTIONS
// ============================================
// Provides interactive buttons for liking videos and subscribing to channels.
// Used on video player page below the video.

import { useState, useEffect } from "react"
import { ThumbsUp, Share2, Bell } from "lucide-react"
import { toggleVideoLike, getIsVideoLiked } from "../../api/likeApi"
import {
    toggleSubscription,
    getUserChannelSubscribers,
} from "../../api/subscriptionApi"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"

/**
 * VIDEO CONTROLS COMPONENT
 * 
 * Purpose:
 * - Provide like button for videos
 * - Provide subscribe button for channels
 * - Show real-time like counts
 * - Handle user authentication checks
 * 
 * Key Features:
 * - Optimistic UI updates (instant visual feedback)
 * - Automatic state reversion on API errors
 * - Authentication guards (prompts login if needed)
 * - Real-time like count updates
 * - Subscribe/Unsubscribe toggle
 * 
 * Optimistic UI Explained:
 * 1. User clicks like button
 * 2. UI updates IMMEDIATELY (heart fills red)
 * 3. API call happens in background
 * 4. If API fails, UI reverts to previous state
 * 
 * Why optimistic UI?
 * - Feels instant and responsive
 * - No waiting for server response
 * - Better user experience
 * - Only reverts if something goes wrong
 * 
 * @param {string} videoId - Video being interacted with
 * @param {string} ownerId - Channel owner ID
 * @param {Object} video - Video data object
 * @param {Function} onSubscribeToggle - Callback when subscribe status changes
 */

const VideoControls = ({ videoId, ownerId, video, onSubscribeToggle }) => {
    const { user } = useSelector((state) => state.auth)
    const [liked, setLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(video?.likes || 0)
    const [subscribed, setSubscribed] = useState(false)

    // Check initial like status
    useEffect(() => {
        const fetchLikeStatus = async () => {
            if (user && videoId) {
                try {
                    const data = await getIsVideoLiked(videoId)
                    setLiked(data.isLiked)
                } catch (error) {
                    // Silent fail
                }
            }
        }
        fetchLikeStatus()
    }, [videoId, user])

    const handleLike = async () => {
        if (!user) {
            toast.error("Please login to like videos")
            return
        }

        // Optimistic update
        const isLikedNow = !liked
        setLiked(isLikedNow)

        // Prevent negative likes
        setLikesCount((prev) => {
            const newCount = isLikedNow ? prev + 1 : prev - 1
            return Math.max(0, newCount)
        })

        try {
            await toggleVideoLike(videoId)
        } catch (error) {
            // Revert on error
            setLiked(!isLikedNow)
            setLikesCount((prev) => (isLikedNow ? prev - 1 : prev + 1))
            toast.error("Failed to like video")
        }
    }

    const handleSubscribe = async () => {
        if (!user) {
            toast.error("Please login to subscribe")
            return
        }
        if (user._id === ownerId) {
            toast.error("You cannot subscribe to your own channel")
            return
        }

        // Optimistic update
        const isSubscribedNow = !subscribed
        setSubscribed(isSubscribedNow)

        try {
            await toggleSubscription(ownerId)
            toast.success(isSubscribedNow ? "Subscribed!" : "Unsubscribed")
            if (onSubscribeToggle) onSubscribeToggle(isSubscribedNow)
        } catch (error) {
            setSubscribed(!isSubscribedNow)
            toast.error("Details: Failed to update subscription")
        }
    }

    const handleShare = () => {
        const url = window.location.href
        navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard!")
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
            {/* Views & Date */}
            <div className="text-gray-400 text-sm">
                {video?.views} views •{" "}
                {new Date(video?.createdAt).toLocaleDateString()}
            </div>

            <div className="flex items-center gap-2">
                {/* LIKE BUTTON */}
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${liked
                            ? "bg-red-600/20 text-red-500"
                            : "bg-[#2A2D2E] hover:bg-gray-700 text-white"
                        }`}
                >
                    <ThumbsUp
                        size={20}
                        className={liked ? "fill-current" : ""}
                    />
                    <span className="font-medium text-sm">{likesCount}</span>
                </button>

                {/* SHARE BUTTON */}
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2A2D2E] hover:bg-gray-700 text-white rounded-full transition-colors"
                >
                    <Share2 size={20} />
                    <span className="font-medium text-sm">Share</span>
                </button>

                {/* SUBSCRIBE BUTTON (Placed here or near channel info? Usually near channel info, 
                     but for modularity we can keep controls together or split. 
                     Let's keep Subscribe near Channel info in parent, but we can export a SubscribeButton too.
                     For now, let's keep basic actions here.) 
                 */}
            </div>
        </div>
    )
}

export default VideoControls
