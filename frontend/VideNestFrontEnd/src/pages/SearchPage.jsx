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
import { useNavigate } from "react-router-dom"
import { searchVideos } from "../api/videoApi"
import VideoCard from "../components/video/VideoCard"
import VideoCardSkeleton from "../components/video/VideoCardSkeleton"
import SearchFilters from "../components/search/SearchFilters"
import { useSearchParams } from "../hooks/useSearchParams"
import { Search as SearchIcon } from "lucide-react"
import toast from "react-hot-toast"

const SearchPage = () => {
    const { filters, updateFilter, clearFilters } = useSearchParams()
    const navigate = useNavigate()

    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalResults, setTotalResults] = useState(0)

    useEffect(() => {
        const fetchResults = async () => {
            if (!filters.query && !filters.category && !filters.sortBy) {
                // If nothing to search, just show empty or all?
                // Let's settle on showing empty if no query, unless a filter is active
                if (!filters.category && !filters.minDuration) {
                    setResults([])
                    setLoading(false)
                    return
                }
            }

            try {
                setLoading(true)
                const response = await searchVideos({
                    ...filters,
                    page: 1, // Reset to page 1 for now (scrolling can handle "more")
                    limit: 20,
                })

                const data = response.data || response
                setResults(data.videos || [])
                setTotalResults(data.totalVideos || 0)
            } catch (error) {
                console.error("Search failed:", error)
                // Use generic toast only if not cancelled
                if (error.code !== "ERR_CANCELED") {
                    toast.error("Failed to search videos")
                }
            } finally {
                setLoading(false)
            }
        }

        const timeoutId = setTimeout(fetchResults, 300) // Debounce
        return () => clearTimeout(timeoutId)
    }, [filters])

    return (
        <div className="min-h-screen bg-[#1E2021] text-white pt-6 pb-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Search Results</h1>
                    {filters.query && (
                        <p className="text-gray-400">
                            Showing results for:{" "}
                            <span className="text-white font-semibold">
                                "{filters.query}"
                            </span>
                        </p>
                    )}
                </div>

                {/* Filters */}
                <SearchFilters
                    filters={filters}
                    onFilterChange={updateFilter}
                    onClearFilters={clearFilters}
                />

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
                            Found {totalResults} result
                            {totalResults !== 1 ? "s" : ""}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {results.map((video) => (
                                <VideoCard key={video._id} video={video} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
                        <SearchIcon className="text-gray-500 mb-4" size={64} />
                        <h3 className="text-2xl font-semibold text-gray-400 mb-2">
                            No videos found
                        </h3>
                        {filters.query ||
                        Object.values(filters).some(Boolean) ? (
                            <p className="text-gray-500 text-center max-w-md">
                                We couldn't find any videos matching your
                                filters. <br />
                                Try adjusting your search keywords or removing
                                some filters.
                            </p>
                        ) : (
                            <p className="text-gray-500 text-center max-w-md">
                                Enter a search query or select a category to
                                find videos.
                            </p>
                        )}
                        <button
                            onClick={clearFilters}
                            className="mt-6 text-red-500 hover:text-red-400 font-medium"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchPage
