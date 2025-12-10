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
    const [selectedCategory, setSelectedCategory] = useState("all") // Active category filter

    // Category options with icons
    const categories = [
        { id: "all", label: "All", icon: Film },
        { id: "trending", label: "Trending", icon: TrendingUp },
        { id: "gaming", label: "Gaming", icon: Gamepad2 },
        { id: "music", label: "Music", icon: Music },
        { id: "coding", label: "Coding", icon: Code },
        { id: "education", label: "Education", icon: BookOpen },
        { id: "fitness", label: "Fitness", icon: Dumbbell },
    ]

    /**
     * FETCH VIDEOS ON PAGE OR CATEGORY CHANGE
     * Triggers when component mounts, page changes, or category changes
     */
    useEffect(() => {
        // Reset videos when category changes
        if (page === 1) {
            setVideos([])
        }
        fetchVideos()
    }, [page, selectedCategory])

    /**
     * FETCH VIDEOS FROM API
     * Loads 12 videos per page and appends to existing list
     */
    const fetchVideos = async () => {
        try {
            setLoading(true)
            const response = await getAllVideos({ 
                page, 
                limit: 12,
                category: selectedCategory !== "all" ? selectedCategory : undefined 
            })

            if (response.videos && response.videos.length > 0) {
                setVideos((prev) => page === 1 ? response.videos : [...prev, ...response.videos])
                setHasMore(response.pagination?.hasNextPage || false)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            toast.error(error.message || "Failed to load videos")
        } finally {
            setLoading(false)
        }
    }

    /**
     * HANDLE CATEGORY CHANGE
     * Resets page to 1 and updates selected category
     */
    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId)
        setPage(1)
        setVideos([])
    }

    /**
     * LOAD MORE HANDLER
     * Increments page number to fetch next page
     */
    const loadMore = () => {
        if (!loading && hasMore) {
            setPage((prev) => prev + 1)
        }
    }

    return (
        <div className="space-y-8">
            {/* HERO SECTION */}
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative px-8 py-16 md:py-24 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        Welcome to VidNest
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Discover amazing videos from creators around the world
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                            <Play className="h-5 w-5" />
                            Explore Now
                        </button>
                    </div>
                </div>
            </div>

            {/* CATEGORY FILTERS */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => {
                    const Icon = category.icon
                    const isActive = selectedCategory === category.id
                    return (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryChange(category.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                                isActive
                                    ? "bg-purple-600 text-white shadow-lg scale-105"
                                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {category.label}
                        </button>
                    )
                })}
            </div>

            {/* SECTION TITLE */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCategory === "all" ? "All Videos" : 
                     selectedCategory === "trending" ? "Trending Now" :
                     `${categories.find(c => c.id === selectedCategory)?.label} Videos`}
                </h2>
                <span className="text-sm text-gray-500">
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
                        <p className="text-gray-600">Loading more videos...</p>
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
                        <p className="text-gray-600 font-medium">
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        No videos found
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {selectedCategory !== "all" 
                            ? `No ${selectedCategory} videos available yet.`
                            : "Be the first to upload amazing content!"}
                    </p>
                    <button 
                        onClick={() => handleCategoryChange("all")}
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
