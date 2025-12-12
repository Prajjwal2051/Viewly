// ============================================
// HOME PAGE - ENHANCED VIDEO & PHOTO FEED
// ============================================
// Modern home page with masonry layout for mixed content.
// Features: mixed feed (videos + tweets), category filtering, Pinterest-style layout.

import { useState, useEffect } from "react"
import { getAllVideos } from "../api/videoApi"
import { getAllTweets } from "../api/tweetApi"
import VideoCard from "../components/video/VideoCard"
import TweetCard from "../components/tweet/TweetCard"
import VideoCardSkeleton from "../components/video/VideoCardSkeleton"
import toast from "react-hot-toast"
import {
    Loader2,
    Film,
    TrendingUp,
    Gamepad2,
    Music,
    Code,
    BookOpen,
    Dumbbell,
    Image as ImageIcon,
} from "lucide-react"

const HomePage = () => {
    // State management
    const [mixedFeed, setMixedFeed] = useState([]) // Combined list
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState("All")

    // Category options
    const categories = [
        { name: "All", icon: <Film className="w-4 h-4" /> },
        { name: "Photos", icon: <ImageIcon className="w-4 h-4" /> },
        { name: "Trending", icon: <TrendingUp className="w-4 h-4" /> },
        { name: "Gaming", icon: <Gamepad2 className="w-4 h-4" /> },
        { name: "Music", icon: <Music className="w-4 h-4" /> },
        { name: "Coding", icon: <Code className="w-4 h-4" /> },
    ]

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch Videos (Page 1)
                const videoResponse = await getAllVideos({
                    page: 1,
                    limit: 15,
                    category:
                        activeCategory !== "All" && activeCategory !== "Photos"
                            ? activeCategory
                            : undefined,
                })
                const videos =
                    videoResponse.videos || videoResponse.data?.videos || []

                // Fetch Tweets (Always fetch for mixed feed)
                let tweets = []
                try {
                    const tweetResponse = await getAllTweets()
                    tweets = tweetResponse.data || []
                    tweets = tweets.map((t) => ({ ...t, isTweet: true }))
                } catch (err) {
                    console.error("Failed to fetch tweets", err)
                }

                // If "Photos" category selected, only show tweets
                if (activeCategory === "Photos") {
                    setMixedFeed(tweets)
                } else {
                    // Merge and Sort by Date for ALL other categories
                    const merged = [...videos, ...tweets].sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    setMixedFeed(merged)
                }
            } catch (error) {
                console.error("Failed to fetch feed:", error)
                toast.error("Could not load feed")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [activeCategory])

    return (
        <div className="min-h-screen bg-black pb-20">
            {/* CATEGORY FILTERS */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-4 md:px-8 lg:px-12 mt-8">
                {categories.map((category) => {
                    const isActive = activeCategory === category.name
                    return (
                        <button
                            key={category.name}
                            onClick={() => setActiveCategory(category.name)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                                isActive
                                    ? "bg-white text-black shadow-lg"
                                    : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white"
                            }`}
                        >
                            {category.icon}
                            {category.name}
                        </button>
                    )
                })}
            </div>

            {/* FEED TITLE */}
            <div className="px-4 md:px-8 lg:px-12 mt-8 mb-6">
                <h2 className="text-xl font-bold text-white mb-1">
                    {activeCategory === "All" ? "For You" : activeCategory}
                </h2>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {mixedFeed.length} Items Found
                </p>
            </div>

            {/* MASONRY GRID LAYOUT */}
            <div className="px-4 md:px-8 lg:px-12">
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <VideoCardSkeleton key={i} />
                        ))
                    ) : mixedFeed.length > 0 ? (
                        mixedFeed.map((item) =>
                            // Render based on type
                            item.isTweet || item.image ? (
                                <TweetCard key={item._id} tweet={item} />
                            ) : (
                                <VideoCard key={item._id} video={item} />
                            )
                        )
                    ) : (
                        <div className="col-span-full text-center py-20 bg-gray-900 rounded-2xl break-inside-avoid">
                            <p className="text-gray-400 text-lg">
                                No content found.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HomePage
