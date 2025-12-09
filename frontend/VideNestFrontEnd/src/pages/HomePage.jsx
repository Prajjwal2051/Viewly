// ============================================
// HOME PAGE - MAIN VIDEO FEED
// ============================================
// Displays paginated video grid with infinite scroll capability.
// Fetches videos on mount and allows loading more on demand.

import { useState, useEffect } from "react"
import { getAllVideos } from "../api/videoApi"
import VideoCard from "../components/video/VideoCard"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"

const HomePage = () => {
    // State management
    const [videos, setVideos] = useState([]) // Array of video objects
    const [loading, setLoading] = useState(true) // Loading spinner control
    const [page, setPage] = useState(1) // Current page number
    const [hasMore, setHasMore] = useState(true) // Whether more videos exist

    /**
     * FETCH VIDEOS ON PAGE CHANGE
     * Triggers when component mounts or page number changes
     * Dependencies: [page] - refetches when user clicks "Load More"
     */
    useEffect(() => {
        fetchVideos()
    }, [page])

    /**
     * FETCH VIDEOS FROM API
     * Loads 12 videos per page and appends to existing list
     * Updates hasMore flag based on pagination response
     */
    const fetchVideos = async () => {
        try {
            setLoading(true)
            const response = await getAllVideos({ page, limit: 12 })

            if (response.videos && response.videos.length > 0) {
                setVideos((prev) => [...prev, ...response.videos]) // Append new videos
                setHasMore(response.pagination?.hasNextPage || false)
            } else {
                setHasMore(false) // No more videos available
            }
        } catch (error) {
            toast.error(error.message || "Failed to load videos")
        } finally {
            setLoading(false)
        }
    }

    /**
     * LOAD MORE HANDLER
     * Increments page number to trigger useEffect and fetch next page
     * Only works if not currently loading and more videos exist
     */
    const loadMore = () => {
        if (!loading && hasMore) {
            setPage((prev) => prev + 1)
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Home Feed</h1>

            {/* VIDEO GRID - Responsive columns: 1 → 2 → 3 → 4 based on screen size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                ))}
            </div>

            {/* LOADING SPINNER - Shows while fetching videos */}
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            )}

            {/* LOAD MORE BUTTON - Shows when not loading and more videos exist */}
            {!loading && hasMore && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={loadMore}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Load More
                    </button>
                </div>
            )}

            {/* END MESSAGE - Shows when all videos loaded */}
            {!loading && !hasMore && videos.length > 0 && (
                <p className="text-center text-gray-500 mt-8">
                    You've reached the end
                </p>
            )}

            {/* EMPTY STATE - Shows when no videos exist in database */}
            {!loading && videos.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No videos found</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Be the first to upload!
                    </p>
                </div>
            )}
        </div>
    )
}

export default HomePage
