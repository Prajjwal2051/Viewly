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
import { Loader2, Play, TrendingUp, Film, Gamepad2, Music, Code, BookOpen, Dumbbell } from "lucide-react"

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
                    category: activeCategory === "All" ? undefined : activeCategory 
                })
                
                // Assuming API returns { docs, hasNextPage } or similar
                // Adjust based on actual API response structure
                const newVideos = response.videos || response.data?.videos || []
                
                if (page === 1) {
                    setVideos(newVideos)
                } else {
                    setVideos(prev => [...prev, ...newVideos])
                }
                
                setHasMore(response.pagination?.hasNextPage || newVideos.length === 12)
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* HERO SECTION */}
            <div className="relative h-[400px] w-full overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-red-600/30 animate-pulse"></div>
                
                <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 w-full">
                        <div className="max-w-2xl text-white space-y-6">
                            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">VidNest</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-200">
                                Discover, share, and connect through the power of video. 
                                Join our community of creators today.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:scale-105 transition transform shadow-lg flex items-center gap-2">
                                    <Play className="fill-current w-5 h-5" />
                                    Explore Now
                                </button>
                                <button className="px-8 py-3 bg-white/10 backdrop-blur-md rounded-full font-semibold hover:bg-white/20 transition border border-white/20">
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
                                    ? "bg-purple-600 text-white shadow-lg scale-105"
                                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-md"
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeCategory === "All" ? "All Videos" : `${activeCategory} Videos`}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {videos.length} {videos.length === 1 ? "video" : "videos"}
                </span>
            </div>

            {/* VIDEO GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading && page === 1 ? (
                    // Show skeleton cards on initial load
                    Array.from({ length: 8 }).map((_, index) => (
                        <VideoCardSkeleton key={index} />
                    ))
                ) : (
                    videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))
                )}
            </div>

            {/* LOADING SPINNER - Only for "Load More" */}
            {loading && page > 1 && (
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-300">Loading more videos...</p>
                    </div>
                </div>
            )}

            {/* LOAD MORE BUTTON */}
            {!loading && hasMore && videos.length > 0 && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={loadMore}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        Load More Videos
                    </button>
                </div>
            )}

            {/* END MESSAGE */}
            {!loading && !hasMore && videos.length > 0 && (
                <div className="text-center py-8">
                    <div className="inline-block px-6 py-3 bg-gray-100 rounded-full">
                        <p className="text-gray-600 dark:text-gray-300 font-medium">
                            🎉 You've watched them all!
                        </p>
                    </div>
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && videos.length === 0 && (
                <div className="text-center py-16">
                    <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                        <Film className="h-16 w-16 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        No videos found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {activeCategory !== "All" 
                            ? `No ${activeCategory} videos available yet.`
                            : "Be the first to upload amazing content!"}
                    </p>
                    <button 
                        onClick={() => handleCategoryChange("All")}
                        className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors"
                    >
                        Browse All Videos
                    </button>
                </div>
            )}
        </div>
    )
}

export default HomePage
