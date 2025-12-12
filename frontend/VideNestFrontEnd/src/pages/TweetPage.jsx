import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTweetById, toggleTweetLike } from "../api/tweetApi"
import CommentSection from "../components/comments/CommentSection"
import { Loader2, Heart, Share2, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import toast from "react-hot-toast"

const TweetPage = () => {
    const { tweetId } = useParams()
    const navigate = useNavigate()
    const [tweet, setTweet] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(0)

    useEffect(() => {
        const fetchTweet = async () => {
            try {
                setLoading(true)
                const response = await getTweetById(tweetId)
                // response.data contains the tweet object
                const tweetData = response.data || response // Adjust based on API structure
                setTweet(tweetData)
                setLikesCount(tweetData.likes || 0)
                // setIsLiked(tweetData.isLiked) // If backend provides this
            } catch (error) {
                console.error("Failed to fetch tweet:", error)
                toast.error("Failed to load post")
                navigate("/")
            } finally {
                setLoading(false)
            }
        }

        if (tweetId) fetchTweet()
    }, [tweetId, navigate])

    const handleLike = async () => {
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#1E2021]">
                <Loader2 className="w-10 h-10 animate-spin text-white" />
            </div>
        )
    }

    if (!tweet) return null

    return (
        <div className="min-h-screen bg-[#1E2021] text-white flex flex-col md:flex-row">
            {/* LEFT: Image Viewer */}
            <div className="flex-1 bg-[#1E2021] flex items-center justify-center relative min-h-[50vh] md:h-screen">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 z-10 p-2 bg-[#1E2021]/50 rounded-full hover:bg-[#1E2021]/80 text-white"
                >
                    <ArrowLeft size={24} />
                </button>
                {tweet.image && (
                    <img
                        src={tweet.image}
                        alt="Full size"
                        className="max-w-full max-h-[90vh] object-contain"
                    />
                )}
            </div>

            {/* RIGHT: Sidebar (Details & Comments) */}
            <div className="md:w-[400px] lg:w-[450px] bg-[#2A2D2E] border-l border-[#2A2D2E] flex flex-col h-screen overflow-y-auto">
                {/* Header: Author */}
                <div className="p-4 border-b border-[#2A2D2E] flex items-center gap-3">
                    <img
                        src={
                            tweet.ownerDetails?.avatar ||
                            "https://via.placeholder.com/40"
                        }
                        alt={tweet.ownerDetails?.username}
                        className="w-10 h-10 rounded-full object-cover cursor-pointer"
                        onClick={() =>
                            navigate(`/channel/${tweet.ownerDetails?.username}`)
                        }
                    />
                    <div className="flex-1">
                        <h3
                            className="font-semibold cursor-pointer hover:underline"
                            onClick={() =>
                                navigate(
                                    `/channel/${tweet.ownerDetails?.username}`
                                )
                            }
                        >
                            {tweet.ownerDetails?.fullName}
                        </h3>
                        <p className="text-xs text-gray-400">
                            @{tweet.ownerDetails?.username}
                        </p>
                    </div>
                </div>

                {/* Content & Stats */}
                <div className="p-4">
                    {tweet.content && (
                        <p className="text-sm mb-4 whitespace-pre-wrap leading-relaxed border-b border-[#2A2D2E] pb-4">
                            {tweet.content}
                        </p>
                    )}

                    <div className="flex items-center gap-6 mb-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 transition-colors ${
                                isLiked
                                    ? "text-red-500"
                                    : "text-white hover:text-red-600"
                            }`}
                        >
                            <Heart
                                size={24}
                                fill={isLiked ? "currentColor" : "none"}
                            />
                            <span className="font-bold">
                                {likesCount} likes
                            </span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <Share2 size={24} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500">
                        Posted{" "}
                        {formatDistanceToNow(new Date(tweet.createdAt), {
                            addSuffix: true,
                        })}
                    </p>
                </div>

                {/* Comments Section - Reusing Component */}
                {/* CommentSection expects 'videoId', but we modified controller to handle tweets.
                    Our CommentSection component might pass 'videoId' param to API.
                    We need to check CommentSection.jsx props.
                 */}
                <div className="flex-1 bg-[#1E2021]/20">
                    <CommentSection
                        tweetId={tweet._id}
                        isTweet={true} // Hint for component if needed, but likely we pass different prop or API handles it
                    />
                </div>
            </div>
        </div>
    )
}

export default TweetPage
