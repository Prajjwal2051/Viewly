// ============================================
// DISCOVER PAGE - CONTENT DISCOVERY
// ============================================
// Help users discover new content through trending videos and categories

import { useState, useEffect } from "react"
import { getAllVideos } from "../api/videoApi"
import VideoCard from "../components/video/VideoCard"
import VideoCardSkeleton from "../components/video/VideoCardSkeleton"
import { TrendingUp, Sparkles, Loader2, Shuffle } from "lucide-react"
import toast from "react-hot-toast"

const CATEGORIES = [
    "All",
    "Gaming",
    "Music",
    "Education",
    "Entertainment",
    "Sports",
    "Tech",
]

const DiscoverPage = () => {
    const [activeCategory, setActiveCategory] = useState("All")
    const [trendingVideos, setTrendingVideos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTrendingVideos = async () => {
            try {
                setLoading(true)
                const response = await getAllVideos()
                const allVideos = response.data?.videos || response.videos || []

                // Sort by views to get trending (most viewed first)
                const sorted = [...allVideos].sort(
                    (a, b) => (b.views || 0) - (a.views || 0)
                )

                setTrendingVideos(sorted)
            } catch (error) {
                console.error("Failed to load trending videos:", error)
                toast.error("Failed to load content")
            } finally {
                setLoading(false)
            }
        }

        fetchTrendingVideos()
    }, [])

    const handleShuffle = () => {
        const shuffled = [...trendingVideos].sort(() => Math.random() - 0.5)
        setTrendingVideos(shuffled)
        toast.success("Shuffled videos!")
    }

    return (
        <div className="min-h-screen bg-[#1E2021] text-white pt-6 pb-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                            <Sparkles className="text-yellow-500" size={36} />
                            Discover
                        </h1>
                        <p className="text-gray-400">
                            Discover trending videos and amazing content
                        </p>
                    </div>
                    <button
                        onClick={handleShuffle}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full flex items-center gap-2 transition-colors"
                    >
                        <Shuffle size={18} />
                        Shuffle
                    </button>
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                                activeCategory === category
                                    ? "bg-[#1E2021] text-black"
                                    : "bg-[#2A2D2E] text-gray-300 hover:bg-gray-700"
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Trending Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="text-red-500" size={28} />
                        Trending Now
                    </h2>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <VideoCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : trendingVideos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {trendingVideos.slice(0, 12).map((video) => (
                                <VideoCard key={video._id} video={video} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <TrendingUp
                                className="mx-auto mb-4 text-gray-500"
                                size={64}
                            />
                            <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                No trending videos yet
                            </h3>
                            <p className="text-gray-500">
                                Check back later for trending content
                            </p>
                        </div>
                    )}
                </div>

                {/* Featured Creators Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">
                        Featured Creators
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {/* Placeholder for future featured creators */}
                        <div className="text-center py-12 col-span-full">
                            <p className="text-gray-500">
                                Featured creators coming soon!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DiscoverPage
