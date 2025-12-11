// ============================================
// VIDEO PLAYER PAGE - WATCH VIDEO INTERFACE
// ============================================
// Displays the video player, video details, and related video suggestions.
// Key Features:
// - HTML5 Video Player
// - Fetch video by ID from URL params
// - Display title, description, and views
// - Sidebar with more videos

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getVideoById, getAllVideos } from "../api/videoApi"
import VideoCardSkeleton from "../components/video/VideoCardSkeleton"
import VideoCard from "../components/video/VideoCard" // Reusing existing card
import {
    Loader2,
    ThumbsUp,
    MessageSquare,
    Share2,
    MoreVertical,
} from "lucide-react"
import toast from "react-hot-toast"

import VideoControls from "../components/video/VideoControls"
import CommentSection from "../components/comments/CommentSection"

const VideoPlayerPage = () => {
    const { videoId } = useParams() // Get video ID from URL
    const navigate = useNavigate()

    // State
    const [video, setVideo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [relatedVideos, setRelatedVideos] = useState([])
    const [loadingRelated, setLoadingRelated] = useState(true)

    // Fetch Video Details
    useEffect(() => {
        const fetchVideoData = async () => {
            try {
                setLoading(true)
                const videoData = await getVideoById(videoId)

                // Ensure we handle the structure correctly
                // verifyApi in previous turn showed getVideoById returns response.data
                // which typically has { data: { videoObject } } or just { videoObject }
                // Let's assume standard ApiResponse wrapper: { statusCode, data, message }
                // So videoData.data should be the video object.
                // Or if the helper already unwrapped it.
                // Let's inspect videoApi.js again visually or safeguard.
                // "return response.data" in videoApi.js means we get the full payload.
                const fetchedVideo =
                    videoData.data || videoData.video || videoData
                setVideo(fetchedVideo)

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
            window.scrollTo(0, 0)
        }
    }, [videoId, navigate])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh] bg-black">
                <Loader2 className="w-10 h-10 animate-spin text-red-600" />
            </div>
        )
    }

    if (!video) return null

    return (
        <div className="min-h-screen bg-black text-white pt-4 pb-12">
            <div className="max-w-[1800px] mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-6">
                {/* LEFT COLUMN: Main Video Player & Details */}
                <div className="flex-1 lg:w-[70%]">
                    {/* 1. Video Player */}
                    <div className="relative w-full pb-[56.25%] bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-900">
                        <video
                            src={video.videoFile}
                            poster={video.thumbnail}
                            className="absolute top-0 left-0 w-full h-full object-contain"
                            controls
                            autoPlay
                        >
                            Your browser does not support the video tag.
                        </video>
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
                        <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
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
                                        {/* Subscriber count would ideally come from subscription api or video owner details */}
                                        {video.owner?.subscribersCount || 0}{" "}
                                        subscribers
                                    </p>
                                </div>
                                <button className="ml-auto px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors">
                                    Subscribe
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
                                  <div className="w-40 h-24 bg-gray-800 rounded-lg animate-pulse" />
                                  <div className="flex-1 space-y-2">
                                      <div className="h-4 bg-gray-800 rounded w-3/4" />
                                      <div className="h-3 bg-gray-800 rounded w-1/2" />
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
                                      className="flex gap-3 cursor-pointer group hover:bg-gray-900/50 p-2 rounded-lg transition-colors"
                                  >
                                      {/* Thumbnail */}
                                      <div className="relative w-40 min-w-[160px] h-24 rounded-lg overflow-hidden bg-gray-800">
                                          <img
                                              src={relatedVideo.thumbnail}
                                              alt={relatedVideo.title}
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          />
                                          <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-xs text-white">
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
                                          <h4 className="font-semibold text-sm line-clamp-2 text-white group-hover:text-red-500 transition-colors">
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
