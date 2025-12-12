// ============================================
// SEARCH PAGE - VIDEO SEARCH FUNCTIONALITY
// ============================================
// Allows users to search for videos by query
// Features:
// - URL query parameter parsing (/search?q=query)
// - Grid display of search results
// - Empty state for no results
// - Loading states

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { getAllVideos } from "../api/videoApi"
import VideoCard from "../components/video/VideoCard"
import VideoCardSkeleton from "../components/video/VideoCardSkeleton"
import { Search as SearchIcon } from "lucide-react"
import toast from "react-hot-toast"

const SearchPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const query = searchParams.get("q") || ""

    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults([])
                setLoading(false)
                return
            }

            try {
                setLoading(true)

                // Fetch all videos
                const response = await getAllVideos()
                const allVideos = response.data?.videos || response.videos || []

                // Filter by search query (case-insensitive)
                const searchLower = query.toLowerCase()
                const filtered = allVideos.filter(
                    (video) =>
                        video.title?.toLowerCase().includes(searchLower) ||
                        video.description
                            ?.toLowerCase()
                            .includes(searchLower) ||
                        video.owner?.username
                            ?.toLowerCase()
                            .includes(searchLower)
                )

                setResults(filtered)
            } catch (error) {
                console.error("Search failed:", error)
                toast.error("Failed to search videos")
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [query])

    return (
        <div className="min-h-screen bg-black text-white pt-6 pb-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Search Results</h1>
                    {query && (
                        <p className="text-gray-400">
                            Showing results for:{" "}
                            <span className="text-white font-semibold">
                                "{query}"
                            </span>
                        </p>
                    )}
                </div>

                {/* Results */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <VideoCardSkeleton key={i} />
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="mb-4 text-gray-400">
                            Found {results.length} result
                            {results.length !== 1 ? "s" : ""}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {results.map((video) => (
                                <VideoCard key={video._id} video={video} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <SearchIcon className="text-gray-700 mb-4" size={64} />
                        <h3 className="text-2xl font-semibold text-gray-400 mb-2">
                            {query ? "No videos found" : "Enter a search query"}
                        </h3>
                        <p className="text-gray-500 text-center max-w-md">
                            {query
                                ? `No results found for "${query}". Try different keywords.`
                                : "Use the search bar above to find videos"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchPage
