// ============================================
// VIDEO PLAYER PAGE - WATCH VIDEO INTERFACE
// ============================================
// Displays the video player, video details, and related video suggestions.
// Key Features:
// - HTML5 Video Player
// - Fetch video by ID from URL params
// - Display title, description, and views
// - Sidebar with more videos

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { getVideoById, getAllVideos } from "../api/videoApi"
import { toggleVideoLike, getIsVideoLiked } from "../api/likeApi"
import { toggleSubscription } from "../api/subscriptionApi"
import VideoCardSkeleton from "../components/video/VideoCardSkeleton"
import VideoCard from "../components/video/VideoCard"
import {
    Loader2,
    ThumbsUp,
    MessageSquare,
    Share2,
    MoreVertical,
    Heart,
    X,
    Play,
    Pause,
    Maximize,
    Rewind,
    FastForward,
    Volume2,
    VolumeX,
    Settings,
    PictureInPicture,
    ListPlus,
} from "lucide-react"
import AddToPlaylistModal from "../components/playlist/AddToPlaylistModal"
import toast from "react-hot-toast"

import VideoControls from "../components/video/VideoControls"
import CommentSection from "../components/comments/CommentSection"

const VideoPlayerPage = ({ isModal = false }) => {
    const { videoId } = useParams()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)

    // State
    const [video, setVideo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [relatedVideos, setRelatedVideos] = useState([])
    const [loadingRelated, setLoadingRelated] = useState(true)

    // Subscription state
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [subscribing, setSubscribing] = useState(false)
    const [subscriberCount, setSubscriberCount] = useState(0)

    // Like state for Modal
    const [liked, setLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(0)

    // Video Player Refs & State
    const videoRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(true)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackSpeed, setPlaybackSpeed] = useState(1)
    const [showSpeedMenu, setShowSpeedMenu] = useState(false)
    const [showPlaylistModal, setShowPlaylistModal] = useState(false)

    const handleTogglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const skip = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds
        }
    }

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (!document.fullscreenElement) {
                videoRef.current.requestFullscreen().catch((err) => {
                    console.log(
                        `Error attempting to enable fullscreen: ${err.message}`
                    )
                })
            } else {
                document.exitFullscreen()
            }
        }
    }

    const handleProgressChange = (e) => {
        const newTime = (e.target.value / 100) * duration
        if (videoRef.current) {
            videoRef.current.currentTime = newTime
        }
        setProgress(e.target.value)
    }

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value
        setVolume(newVolume)
        if (videoRef.current) {
            videoRef.current.volume = newVolume
        }
        setIsMuted(newVolume === 0)
    }

    const toggleMute = () => {
        if (videoRef.current) {
            const newMuted = !isMuted
            setIsMuted(newMuted)
            videoRef.current.muted = newMuted
        }
    }

    const handleSpeedChange = (speed) => {
        setPlaybackSpeed(speed)
        if (videoRef.current) {
            videoRef.current.playbackRate = speed
        }
        setShowSpeedMenu(false)
    }

    const togglePictureInPicture = async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture()
            } else if (videoRef.current) {
                await videoRef.current.requestPictureInPicture()
            }
        } catch (error) {
            console.log("PiP error:", error)
        }
    }

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00"
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    // Update progress as video plays
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const updateProgress = () => {
            const currentProgress = (video.currentTime / video.duration) * 100
            setProgress(currentProgress)
            setCurrentTime(video.currentTime)
        }

        const updateDuration = () => {
            setDuration(video.duration)
        }

        video.addEventListener("timeupdate", updateProgress)
        video.addEventListener("loadedmetadata", updateDuration)

        return () => {
            video.removeEventListener("timeupdate", updateProgress)
            video.removeEventListener("loadedmetadata", updateDuration)
        }
    }, [])

    // Fetch Video Details
    useEffect(() => {
        const fetchVideoData = async () => {
            try {
                setLoading(true)
                const videoData = await getVideoById(videoId)

                const fetchedVideo =
                    videoData.data || videoData.video || videoData
                setVideo(fetchedVideo)

                // Set initial subscriber count
                setSubscriberCount(fetchedVideo.owner?.subscribersCount || 0)
                setLikesCount(fetchedVideo.likes || 0) // Initialize likes

                // Check like status
                if (user) {
                    try {
                        const likeData = await getIsVideoLiked(videoId)
                        setLiked(likeData.isLiked)
                    } catch (err) {
                        console.error("Failed to fetch like status", err)
                    }
                }

                // Fetch Related
                const relatedData = await getAllVideos({ limit: 10 })
                const filtered = (
                    relatedData.data?.videos ||
                    relatedData.videos ||
                    []
                ).filter((v) => v._id !== videoId)
                setRelatedVideos(filtered)
            } catch (error) {
                console.error("Failed to load video:", error)
                toast.error("Video not found")
            } finally {
                setLoading(false)
                setLoadingRelated(false)
            }
        }
        if (videoId) {
            fetchVideoData()
            // window.scrollTo(0, 0) // Disable scroll to top if modal? Or Keep it?
            if (!isModal) window.scrollTo(0, 0)
        }
    }, [videoId, navigate, isModal, user])

    // Subscribe Handler
    const handleSubscribe = async () => {
        if (!user) {
            toast.error("Please login to subscribe")
            navigate("/login")
            return
        }

        if (user._id === video.owner._id) {
            toast.error("You cannot subscribe to your own channel")
            return
        }

        setSubscribing(true)
        const wasSubscribed = isSubscribed

        // Optimistic update
        setIsSubscribed(!wasSubscribed)
        setSubscriberCount((prev) => (wasSubscribed ? prev - 1 : prev + 1))

        try {
            await toggleSubscription(video.owner._id)
            toast.success(wasSubscribed ? "Unsubscribed" : "Subscribed!")
        } catch (error) {
            // Revert on error
            setIsSubscribed(wasSubscribed)
            setSubscriberCount((prev) => (wasSubscribed ? prev + 1 : prev - 1))
            toast.error("Failed to update subscription")
        } finally {
            setSubscribing(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh] bg-[#1E2021]">
                <Loader2 className="w-10 h-10 animate-spin text-red-600" />
            </div>
        )
    }

    if (!video) return null

    const handleLike = async (e) => {
        e?.stopPropagation()
        if (!user) {
            toast.error("Please login to like videos")
            return
        }

        const isLikedNow = !liked
        setLiked(isLikedNow)
        setLikesCount((prev) => {
            const newCount = isLikedNow ? prev + 1 : prev - 1
            return Math.max(0, newCount)
        })

        try {
            await toggleVideoLike(videoId)
        } catch (error) {
            setLiked(!isLikedNow)
            setLikesCount((prev) => (isLikedNow ? prev - 1 : prev + 1))
            toast.error("Failed to like video")
        }
    }

    const handleShare = (e) => {
        e.stopPropagation()
        const link = window.location.href
        navigator.clipboard.writeText(link)
        toast.success("Link copied to clipboard!")
    }

    // IMMERSIVE MODAL LAYOUT (REELS STYLE)
    if (isModal) {
        return (
            <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                {/* CLOSE BUTTON */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* VIDEO PLAYER - CENTRAL & IMMERSIVE */}
                <div className="relative w-full h-full max-w-[500px] flex items-center bg-black group">
                    <video
                        ref={videoRef}
                        src={video.videoFile?.replace("http://", "https://")}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain cursor-pointer"
                        poster={video.thumbnail}
                        onClick={handleTogglePlay}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onLoadedData={(e) => {
                            e.target.play().catch(() => {
                                console.log(
                                    "Autoplay blocked, waiting for interaction"
                                )
                                setIsPlaying(false)
                            })
                        }}
                    />

                    {/* CUSTOM CONTROLS OVERLAY - CENTERED */}
                    <div className="absolute inset-0 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* Top Controls - Fullscreen & PiP */}
                        <div className="absolute top-4 right-4 flex gap-2 z-20">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    togglePictureInPicture()
                                }}
                                className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all backdrop-blur-sm"
                                title="Picture in Picture"
                            >
                                <PictureInPicture size={20} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleFullscreen()
                                }}
                                className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all backdrop-blur-sm"
                                title="Fullscreen"
                            >
                                <Maximize size={20} />
                            </button>
                        </div>

                        {/* Center Controls - Play/Pause & Skip */}
                        <div className="flex-1 flex items-center justify-center gap-8 pointer-events-none">
                            {/* Rewind -5s */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    skip(-5)
                                }}
                                className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 hover:scale-110 transition-all pointer-events-auto backdrop-blur-sm"
                                title="Rewind 5s"
                            >
                                <Rewind size={32} fill="white" />
                            </button>

                            {/* Play/Pause Main Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleTogglePlay()
                                }}
                                className="p-5 rounded-full bg-red-600/90 text-white hover:bg-red-600 hover:scale-110 transition-all shadow-lg pointer-events-auto backdrop-blur-sm shadow-red-900/20"
                            >
                                {isPlaying ? (
                                    <Pause size={40} fill="white" />
                                ) : (
                                    <Play
                                        size={40}
                                        fill="white"
                                        className="ml-1"
                                    />
                                )}
                            </button>

                            {/* Fast Forward +5s */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    skip(5)
                                }}
                                className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60 hover:scale-110 transition-all pointer-events-auto backdrop-blur-sm"
                                title="Forward 5s"
                            >
                                <FastForward size={32} fill="white" />
                            </button>
                        </div>

                        {/* Bottom Controls - Progress, Volume, Speed */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            {/* Progress Bar */}
                            <div className="mb-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progress}
                                    onChange={handleProgressChange}
                                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                    style={{
                                        background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${progress}%, rgba(255,255,255,0.3) ${progress}%, rgba(255,255,255,0.3) 100%)`,
                                    }}
                                />
                            </div>

                            {/* Controls Row */}
                            <div className="flex items-center justify-between text-white text-sm">
                                {/* Left: Time */}
                                <div className="flex items-center gap-2">
                                    <span className="font-mono">
                                        {formatTime(currentTime)} /{" "}
                                        {formatTime(duration)}
                                    </span>
                                </div>

                                {/* Right: Volume & Speed */}
                                <div className="flex items-center gap-4">
                                    {/* Volume Control */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                toggleMute()
                                            }}
                                            className="p-1 hover:scale-110 transition-transform"
                                        >
                                            {isMuted || volume === 0 ? (
                                                <VolumeX size={20} />
                                            ) : (
                                                <Volume2 size={20} />
                                            )}
                                        </button>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={isMuted ? 0 : volume}
                                            onChange={handleVolumeChange}
                                            className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                                        />
                                    </div>

                                    {/* Playback Speed */}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setShowSpeedMenu(!showSpeedMenu)
                                            }}
                                            className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                                        >
                                            <Settings size={16} />
                                            <span className="text-xs">
                                                {playbackSpeed}x
                                            </span>
                                        </button>

                                        {showSpeedMenu && (
                                            <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-lg overflow-hidden shadow-xl">
                                                {[
                                                    0.5, 0.75, 1, 1.25, 1.5, 2,
                                                ].map((speed) => (
                                                    <button
                                                        key={speed}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleSpeedChange(
                                                                speed
                                                            )
                                                        }}
                                                        className={`block w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${
                                                            playbackSpeed ===
                                                            speed
                                                                ? "bg-red-600 text-white"
                                                                : "text-gray-300"
                                                        }`}
                                                    >
                                                        {speed}x
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT OVERLAY - ACTIONS BUTTONS */}
                <div className="absolute right-4 bottom-20 z-40 flex flex-col items-center gap-6">
                    {/* Like Action */}
                    <button
                        className="flex flex-col items-center gap-1 group"
                        onClick={handleLike}
                    >
                        <div
                            className={`p-3 rounded-full backdrop-blur-md transition-all ${liked ? "bg-red-600/80 text-white" : "bg-black/40 text-white group-hover:bg-red-500/20"}`}
                        >
                            <Heart
                                size={28}
                                fill={liked ? "currentColor" : "none"}
                            />
                        </div>
                        <span className="text-xs font-bold text-white shadow-black drop-shadow-md">
                            {likesCount}
                        </span>
                    </button>

                    {/* Comment Action */}
                    <button className="flex flex-col items-center gap-1 group">
                        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white group-hover:bg-white/20 transition-all">
                            <MessageSquare size={28} />
                        </div>
                        <span className="text-xs font-bold text-white shadow-black drop-shadow-md">
                            Comment
                        </span>
                    </button>

                    {/* Share Action */}
                    <button
                        className="flex flex-col items-center gap-1 group"
                        onClick={handleShare}
                    >
                        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white group-hover:bg-white/20 transition-all">
                            <Share2 size={28} />
                        </div>
                        <span className="text-xs font-bold text-white shadow-black drop-shadow-md">
                            Share
                        </span>
                    </button>

                    {/* Add to Playlist Action */}
                    <button
                        className="flex flex-col items-center gap-1 group"
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowPlaylistModal(true)
                        }}
                    >
                        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white group-hover:bg-white/20 transition-all">
                            <ListPlus size={28} />
                        </div>
                        <span className="text-xs font-bold text-white shadow-black drop-shadow-md">
                            Save
                        </span>
                    </button>

                    {/* More Action */}
                    <button className="flex flex-col items-center gap-1 group">
                        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white group-hover:bg-white/20 transition-all">
                            <MoreVertical size={28} />
                        </div>
                    </button>
                </div>

                {/* BOTTOM OVERLAY - INFO */}
                <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-20 pb-6 px-4">
                    <div className="flex items-center gap-3 mb-3">
                        <img
                            src={
                                video.owner?.avatar ||
                                "https://via.placeholder.com/40"
                            }
                            alt={video.owner?.username}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white/20 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/channel/${video.owner?.username}`)
                            }}
                        />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span
                                    className="font-bold text-white text-base hover:underline cursor-pointer"
                                    onClick={() =>
                                        navigate(
                                            `/channel/${video.owner?.username}`
                                        )
                                    }
                                >
                                    {video.owner?.username}
                                </span>
                                <button
                                    onClick={handleSubscribe}
                                    className={`px-3 py-0.5 text-xs font-bold rounded-full transition-colors ${isSubscribed ? "bg-white/10 text-white" : "bg-red-600 text-white"}`}
                                >
                                    {isSubscribed ? "Subscribed" : "Subscribe"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <h1 className="text-white text-lg font-medium leading-tight line-clamp-2 mb-1 w-[85%]">
                        {video.title}
                    </h1>
                    {video.description && (
                        <p className="text-gray-200/80 text-sm line-clamp-1 w-[85%]">
                            {video.description}
                        </p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div
            className={`${isModal ? "h-full overflow-y-auto bg-[#1E2021] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10" : "min-h-screen bg-[#1E2021] pt-4 pb-12"} text-white`}
        >
            <div
                className={`mx-auto flex flex-col lg:flex-row gap-6 ${isModal ? "p-0" : "max-w-[1800px] px-4 md:px-6"}`}
            >
                {/* LEFT COLUMN: Main Video Player & Details */}
                <div className="flex-1 lg:w-[70%]">
                    {/* 1. Video Player */}
                    <div className="bg-[#1E2021]">
                        <video
                            src={video.videoFile}
                            controls
                            autoPlay
                            className="w-full max-h-[80vh] object-contain bg-[#1E2021] mx-auto"
                            poster={video.thumbnail}
                        />
                    </div>

                    {/* 2. Video Info & Controls */}
                    <div className="mt-4 space-y-4">
                        <h1 className="text-xl md:text-2xl font-bold line-clamp-2">
                            {video.title}
                        </h1>

                        {/* NEW: Video Controls Component */}
                        <VideoControls
                            videoId={video._id}
                            ownerId={video.owner?._id}
                            video={video}
                        />

                        {/* Channel & Description Area */}
                        <div className="mt-6 p-4 bg-[#2A2D2E]/50 rounded-xl border border-[#2A2D2E]">
                            <div className="flex items-center gap-4 mb-4">
                                <img
                                    src={
                                        video.owner?.avatar ||
                                        "https://via.placeholder.com/40"
                                    }
                                    alt={video.owner?.username}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-700"
                                />
                                <div>
                                    <h3 className="font-semibold text-white text-lg">
                                        {video.owner?.username ||
                                            "Unknown Channel"}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {subscriberCount.toLocaleString()}{" "}
                                        {subscriberCount === 1
                                            ? "subscriber"
                                            : "subscribers"}
                                    </p>
                                </div>
                                {/* Subscribe Button */}
                                <button
                                    onClick={handleSubscribe}
                                    disabled={
                                        subscribing ||
                                        user?._id === video.owner?._id
                                    }
                                    className={`ml-auto px-6 py-2 font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                        isSubscribed
                                            ? "bg-[#2A2D2E] text-white hover:bg-gray-700"
                                            : "bg-[#1E2021] text-black hover:bg-gray-200"
                                    }`}
                                >
                                    {subscribing
                                        ? "Loading..."
                                        : isSubscribed
                                          ? "Subscribed"
                                          : "Subscribe"}
                                </button>
                            </div>

                            <div className="text-sm text-gray-300 whitespace-pre-wrap">
                                {video.description ||
                                    "No description provided."}
                            </div>
                        </div>

                        {/* NEW: Comments Section */}
                        <CommentSection videoId={video._id} />
                    </div>
                </div>

                {/* RIGHT COLUMN: Related Videos */}
                <div className="lg:w-[30%] space-y-4">
                    <h3 className="font-bold text-lg mb-4 hidden lg:block">
                        Up Next
                    </h3>
                    {loadingRelated
                        ? Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className="flex gap-2">
                                  <div className="w-40 h-24 bg-[#2A2D2E] rounded-lg animate-pulse" />
                                  <div className="flex-1 space-y-2">
                                      <div className="h-4 bg-[#2A2D2E] rounded w-3/4" />
                                      <div className="h-3 bg-[#2A2D2E] rounded w-1/2" />
                                  </div>
                              </div>
                          ))
                        : relatedVideos.map((relatedVideo) => (
                              <div key={relatedVideo._id} className="w-full">
                                  {/* Reuse VideoCard but maybe we want a "horizontal" row variant? 
                                    For now, standard VideoCard is fine, but sidebar usually prefers row layout.
                                    Let's wrap it or just use the card as is for MVP. 
                                    Better UX: Quick custom row layout so it fits sidebar better.
                                */}
                                  <div
                                      onClick={() =>
                                          navigate(`/video/${relatedVideo._id}`)
                                      }
                                      className="flex gap-3 cursor-pointer group hover:bg-[#2A2D2E]/50 p-2 rounded-lg transition-colors"
                                  >
                                      {/* Thumbnail */}
                                      <div className="relative w-40 min-w-[160px] h-24 rounded-lg overflow-hidden bg-[#2A2D2E]">
                                          <img
                                              src={relatedVideo.thumbnail}
                                              alt={relatedVideo.title}
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          />
                                          <div className="absolute bottom-1 right-1 bg-[#1E2021]/80 px-1 rounded text-xs text-white">
                                              {String(
                                                  Math.floor(
                                                      relatedVideo.duration || 0
                                                  ) / 60
                                              ).padStart(2, "0")}
                                              :
                                              {String(
                                                  Math.floor(
                                                      relatedVideo.duration || 0
                                                  ) % 60
                                              ).padStart(2, "0")}
                                          </div>
                                      </div>

                                      {/* Info */}
                                      <div className="flex flex-col gap-1 min-w-0">
                                          <h4 className="font-semibold text-sm line-clamp-2 text-white group-hover:text-red-600 transition-colors">
                                              {relatedVideo.title}
                                          </h4>
                                          <p className="text-xs text-gray-400">
                                              {relatedVideo.owner?.username}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                              {relatedVideo.views} views •{" "}
                                              {new Date(
                                                  relatedVideo.createdAt
                                              ).toLocaleDateString()}
                                          </p>
                                          {/* New tag if recent? */}
                                      </div>
                                  </div>
                              </div>
                          ))}
                </div>
            </div>
        </div>
    )
}

export default VideoPlayerPage
