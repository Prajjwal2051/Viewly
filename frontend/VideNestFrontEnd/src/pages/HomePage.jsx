// ============================================
// HOME PAGE - ENHANCED VIDEO FEED
// ============================================
// Modern home page with hero section, category filters, and video grid.
// Features: trending videos, category filtering, infinite scroll.

import { useState, useEffect } from "react"
import { getAllVideos } from "../api/videoApi"
import VideoCard from "../components/video/VideoCard"
import VideoCardSkeleton from "../components/video/VideoCardSkeleton"
import toast from "react-hot-toast"
import {
    Loader2,
    Play,
    TrendingUp,
    Film,
    Gamepad2,
    Music,
    Code,
    BookOpen,
    Dumbbell,
} from "lucide-react"

const HomePage = () => {
    // State management
    const [videos, setVideos] = useState([]) // Array of video objects
    const [loading, setLoading] = useState(true) // Loading spinner control
    const [page, setPage] = useState(1) // Current page number
    const [hasMore, setHasMore] = useState(true) // Whether more videos exist
    const [activeCategory, setActiveCategory] = useState("All") // Active category filter

    // Category options with icons
    const categories = [
        { name: "All", icon: <Film className="w-4 h-4" /> },
        { name: "Trending", icon: <TrendingUp className="w-4 h-4" /> },
        { name: "Gaming", icon: <Gamepad2 className="w-4 h-4" /> },
        { name: "Music", icon: <Music className="w-4 h-4" /> },
        { name: "Coding", icon: <Code className="w-4 h-4" /> },
        { name: "Education", icon: <BookOpen className="w-4 h-4" /> },
        { name: "Fitness", icon: <Dumbbell className="w-4 h-4" /> },
    ]

    /**
     * FETCH VIDEOS ON PAGE OR CATEGORY CHANGE
     * Triggers when component mounts, page changes, or category changes
     */
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // If category changed, reset list
                if (page === 1) setLoading(true)

                // Fetch videos (simulating category filter if needed)
                const response = await getAllVideos({
                    page,
                    limit: 12,
                    category:
                        activeCategory === "All" ? undefined : activeCategory,
                })

                // Assuming API returns { docs, hasNextPage } or similar
                // Adjust based on actual API response structure
                const newVideos = response.videos || response.data?.videos || []

                if (page === 1) {
                    setVideos(newVideos)
                } else {
                    setVideos((prev) => [...prev, ...newVideos])
                }

                setHasMore(
                    response.pagination?.hasNextPage || newVideos.length === 12
                )
            } catch (error) {
                console.error("Failed to fetch videos:", error)
                toast.error("Could not load videos")
            } finally {
                setLoading(false)
            }
        }

        fetchVideos()
    }, [page, activeCategory])

    /**
     * HANDLE CATEGORY CHANGE
     * Resets page to 1 and updates selected category
     */
    const handleCategoryChange = (categoryName) => {
        setActiveCategory(categoryName)
        setPage(1)
        setVideos([])
    }

    /**
     * LOAD MORE HANDLER
     * Increments page number to fetch next page
     */
    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage((prev) => prev + 1)
        }
    }

    return (
        <div className="min-h-screen bg-black pb-20">
            {/* HERO SECTION */}
            <div className="px-4 md:px-8 lg:px-12 pt-6">
                <div className="relative h-[400px] w-full overflow-hidden bg-gradient-to-r from-gray-900 via-[#0a0a0a] to-black rounded-[2.5rem] border border-gray-800 shadow-2xl">
                    {/* Background Effects */}
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none opacity-60"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none opacity-40"></div>

                    {/* Hero Content */}
                    <div className="absolute inset-0 flex flex-col justify-center items-start text-left relative z-10 pl-10 md:pl-20 lg:pl-32 pr-4 pt-8">
                        <div className="max-w-4xl text-white space-y-8">
                            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tighter drop-shadow-xl animate-fadeInUp delay-200">
                                Welcome to{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
                                    VidNest
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-300 max-w-xl animate-fadeInUp delay-400 leading-relaxed">
                                Discover, share, and connect through the power
                                of video. Join our community of creators today
                                and start watching.
                            </p>
                            <div className="flex gap-4 pt-4 animate-fadeInUp delay-600">
                                <button className="px-8 py-4 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg shadow-red-900/20 flex items-center gap-2">
                                    <Play className="fill-current w-5 h-5" />
                                    Explore Now
                                </button>
                                <button className="px-8 py-4 bg-white/5 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/10 transition border border-white/10 hover:border-white/20">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CATEGORY FILTERS */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-4 md:px-8 lg:px-12 mt-8">
                {categories.map((category) => {
                    const isActive = activeCategory === category.name
                    return (
                        <button
                            key={category.name}
                            onClick={() => handleCategoryChange(category.name)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                                isActive
                                    ? "bg-red-600 text-white shadow-lg"
                                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`}
                        >
                            {category.icon}
                            {category.name}
                        </button>
                    )
                })}
            </div>

            {/* SECTION TITLE */}
            <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 mt-8 mb-6">
                <h2 className="text-2xl font-bold text-white">
                    {activeCategory === "All"
                        ? "All Videos"
                        : `${activeCategory} Videos`}
                </h2>
                <span className="text-sm text-gray-500">
                    {videos.length} {videos.length === 1 ? "video" : "videos"}
                </span>
            </div>

            {/* VIDEO GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-8 lg:px-12">
                {loading && page === 1
                    ? // Show skeleton cards on initial load
                      Array.from({ length: 8 }).map((_, index) => (
                          <VideoCardSkeleton key={index} />
                      ))
                    : videos.map((video) => (
                          <VideoCard key={video._id} video={video} />
                      ))}
            </div>

            {/* LOADING SPINNER - Only for "Load More" */}
            {loading && page > 1 && (
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-red-600 mx-auto mb-3" />
                        <p className="text-gray-400">Loading more videos...</p>
                    </div>
                </div>
            )}

            {/* LOAD MORE BUTTON */}
            {!loading && hasMore && videos.length > 0 && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleLoadMore}
                        className="px-8 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-all shadow-lg"
                    >
                        Load More Videos
                    </button>
                </div>
            )}

            {/* END MESSAGE */}
            {!loading && !hasMore && videos.length > 0 && (
                <div className="text-center py-8">
                    <div className="inline-block px-6 py-3 bg-gray-800 rounded-full">
                        <p className="text-gray-400 font-medium">
                            🎉 You've watched them all!
                        </p>
                    </div>
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && videos.length === 0 && (
                <div className="text-center py-16">
                    <div className="inline-block p-6 bg-gray-800 rounded-full mb-4">
                        <Film className="h-16 w-16 text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                        No videos found
                    </h3>
                    <p className="text-gray-400 mb-6">
                        {activeCategory !== "All"
                            ? `No ${activeCategory} videos available yet.`
                            : "Be the first to upload amazing content!"}
                    </p>
                    <button
                        onClick={() => handleCategoryChange("All")}
                        className="px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors"
                    >
                        Browse All Videos
                    </button>
                </div>
            )}
        </div>
    )
}

export default HomePage
