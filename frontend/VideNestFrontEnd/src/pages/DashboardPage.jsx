// ============================================
// DASHBOARD PAGE - CREATOR VIDEO MANAGEMENT
// ============================================
// Allows creators to view and manage their uploaded videos
// Features:
// - Channel statistics (Total Views, Videos, Subscribers)
// - Video management table with edit/delete actions
// - Visual stats cards with icons

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { getAllVideos, deleteVideo } from "../api/videoApi"
import {
    BarChart3,
    Video as VideoIcon,
    Users,
    Eye,
    Heart,
    MessageSquare,
    Trash2,
    Edit,
    Loader2,
} from "lucide-react"
import toast from "react-hot-toast"

const DashboardPage = () => {
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)

    const [stats, setStats] = useState({
        totalVideos: 0,
        totalViews: 0,
        totalSubscribers: 0,
    })
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)

    useEffect(() => {
        if (!user) {
            navigate("/login")
            return
        }
        fetchDashboardData()
    }, [user, navigate])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch all videos and filter by current user
            const response = await getAllVideos()
            const allVideos = response.data?.videos || response.videos || []

            // Filter user's videos
            const userVideos = allVideos.filter(
                (v) => v.owner?._id === user._id || v.owner === user._id
            )

            setVideos(userVideos)

            // Calculate stats
            const totalViews = userVideos.reduce(
                (sum, video) => sum + (video.views || 0),
                0
            )

            setStats({
                totalVideos: userVideos.length,
                totalViews,
                totalSubscribers: user.subscribersCount || 0,
            })
        } catch (error) {
            console.error("Failed to load dashboard data:", error)
            toast.error("Failed to load dashboard")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (videoId) => {
        if (!window.confirm("Are you sure you want to delete this video?")) {
            return
        }

        setDeleting(videoId)
        try {
            await deleteVideo(videoId)
            setVideos((prev) => prev.filter((v) => v._id !== videoId))
            setStats((prev) => ({
                ...prev,
                totalVideos: prev.totalVideos - 1,
            }))
            toast.success("Video deleted successfully")
        } catch (error) {
            toast.error("Failed to delete video")
        } finally {
            setDeleting(null)
        }
    }

    const handleEdit = (videoId) => {
        navigate(`/video/${videoId}`)
        toast.info("Edit functionality coming soon!")
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
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        Channel Dashboard
                    </h1>
                    <p className="text-gray-400">
                        Manage your videos and track your channel performance
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Videos */}
                    <div className="bg-gradient-to-br from-red-900/20 to-red-600/10 border border-red-800/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <VideoIcon className="text-red-500" size={32} />
                            <BarChart3
                                className="text-red-400/30"
                                size={48}
                            />
                        </div>
                        <p className="text-gray-400 text-sm mb-1">
                            Total Videos
                        </p>
                        <h3 className="text-3xl font-bold text-white">
                            {stats.totalVideos}
                        </h3>
                    </div>

                    {/* Total Views */}
                    <div className="bg-gradient-to-br from-red-900/20 to-red-600/10 border border-red-800/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Eye className="text-red-500" size={32} />
                            <BarChart3 className="text-red-400/30" size={48} />
                        </div>
                        <p className="text-gray-400 text-sm mb-1">
                            Total Views
                        </p>
                        <h3 className="text-3xl font-bold text-white">
                            {stats.totalViews.toLocaleString()}
                        </h3>
                    </div>

                    {/* Total Subscribers */}
                    <div className="bg-gradient-to-br from-red-900/20 to-red-600/10 border border-red-800/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="text-red-500" size={32} />
                            <BarChart3 className="text-red-400/30" size={48} />
                        </div>
                        <p className="text-gray-400 text-sm mb-1">
                            Subscribers
                        </p>
                        <h3 className="text-3xl font-bold text-white">
                            {stats.totalSubscribers.toLocaleString()}
                        </h3>
                    </div>
                </div>

                {/* Videos Table */}
                <div className="bg-[#2A2D2E]/50 border border-[#2A2D2E] rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-[#2A2D2E]">
                        <h2 className="text-2xl font-bold">Your Videos</h2>
                    </div>

                    {videos.length === 0 ? (
                        <div className="p-12 text-center">
                            <VideoIcon
                                className="mx-auto mb-4 text-gray-400"
                                size={48}
                            />
                            <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                No videos yet
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Upload your first video to get started
                            </p>
                            <button
                                onClick={() => navigate("/upload")}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition-colors"
                            >
                                Upload Video
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#2A2D2E]/50">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-300">
                                            Video
                                        </th>
                                        <th className="text-center p-4 font-semibold text-gray-300">
                                            <div className="flex items-center justify-center gap-1">
                                                <Eye size={16} />
                                                Views
                                            </div>
                                        </th>
                                        <th className="text-center p-4 font-semibold text-gray-300">
                                            <div className="flex items-center justify-center gap-1">
                                                <Heart size={16} />
                                                Likes
                                            </div>
                                        </th>
                                        <th className="text-center p-4 font-semibold text-gray-300">
                                            Date
                                        </th>
                                        <th className="text-right p-4 font-semibold text-gray-300">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {videos.map((video) => (
                                        <tr
                                            key={video._id}
                                            className="border-b border-[#2A2D2E] hover:bg-[#2A2D2E]/30 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={video.thumbnail}
                                                        alt={video.title}
                                                        className="w-32 h-18 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4
                                                            className="font-semibold text-white line-clamp-2 cursor-pointer hover:text-red-600"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/video/${video._id}`
                                                                )
                                                            }
                                                        >
                                                            {video.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                                                            {video.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center text-gray-300">
                                                {video.views?.toLocaleString() ||
                                                    0}
                                            </td>
                                            <td className="p-4 text-center text-gray-300">
                                                {video.likes || 0}
                                            </td>
                                            <td className="p-4 text-center text-gray-400 text-sm">
                                                {new Date(
                                                    video.createdAt
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(
                                                                video._id
                                                            )
                                                        }
                                                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                video._id
                                                            )
                                                        }
                                                        disabled={
                                                            deleting ===
                                                            video._id
                                                        }
                                                        className="p-2 hover:bg-red-900/30 rounded-lg transition-colors text-gray-400 hover:text-red-600 disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        {deleting ===
                                                        video._id ? (
                                                            <Loader2
                                                                size={18}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Trash2 size={18} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
