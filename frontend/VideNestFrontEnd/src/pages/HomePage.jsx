// ============================================
// HOME PAGE - ENHANCED VIDEO & PHOTO FEED
// ============================================
// Modern home page with masonry layout for mixed content.
// Features: mixed feed (videos + tweets), category filtering, Pinterest-style layout.

import { useState, useEffect } from "react"
import { getAllVideos, getMostUsedTags } from "../api/videoApi"
import { getAllTweets } from "../api/tweetApi"
import VideoCard from "../components/video/VideoCard"
import TweetCard from "../components/tweet/TweetCard"
import VideoCardSkeleton from "../components/video/VideoCardSkeleton"
import TweetCardSkeleton from "../components/tweet/TweetCardSkeleton"
import EmptyState from "../components/ui/EmptyState"
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
    MessageSquare,
} from "lucide-react"

// Predefined tags that always show
const PREDEFINED_TAGS = [
    "trending",
    "viral",
    "tutorial",
    "funny",
    "music",
    "gaming",
    "educational",
    "shorts",
]

const HomePage = () => {
    // State management
    const [mixedFeed, setMixedFeed] = useState([]) // Combined list
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState("All")

    const [categories, setCategories] = useState([
        { name: "All", icon: <Film className="w-4 h-4" /> },
    ])
    const [popularTags, setPopularTags] = useState([])
    const [activeTag, setActiveTag] = useState(null) // Track selected tag for filtering

    // Icon mapping for dynamic categories
    const getCategoryIcon = (categoryName) => {
        const lowerName = categoryName.toLowerCase()
        if (lowerName.includes("gam")) return <Gamepad2 className="w-4 h-4" />
        if (lowerName.includes("music")) return <Music className="w-4 h-4" />
        if (lowerName.includes("cod") || lowerName.includes("tech"))
            return <Code className="w-4 h-4" />
        if (lowerName.includes("book") || lowerName.includes("edu"))
            return <BookOpen className="w-4 h-4" />
        if (lowerName.includes("gym") || lowerName.includes("fit"))
            return <Dumbbell className="w-4 h-4" />
        return <TrendingUp className="w-4 h-4" />
    }

    useEffect(() => {
        // Fetch categories and tweets on mount
        const loadCategories = async () => {
            try {
                // 1. Fetch available video categories
                const { data: videoCategories } =
                    await import("../api/videoApi").then((m) =>
                        m.getVideoCategories()
                    )

                // 2. Check if tweets exist
                const tweets = await getAllTweets()
                const hasTweets = Array.isArray(tweets) && tweets.length > 0

                // 3. Build categories list
                const newCategories = [
                    { name: "All", icon: <Film className="w-4 h-4" /> },
                ]

                if (hasTweets) {
                    newCategories.push({
                        name: "Tweets",
                        icon: <MessageSquare className="w-4 h-4" />,
                    })
                }

                // Add dynamic video categories
                if (Array.isArray(videoCategories)) {
                    videoCategories.forEach((cat) => {
                        // Avoid duplicates if 'Tweets' or 'All' somehow comes from backend
                        if (cat !== "All" && cat !== "Tweets") {
                            newCategories.push({
                                name: cat,
                                icon: getCategoryIcon(cat),
                            })
                        }
                    })
                }

                setCategories(newCategories)

                // 4. Fetch popular tags
                try {
                    const { data: tagsData } = await getMostUsedTags(10)

                    // Create predefined tags with count 0
                    const predefinedTagsData = PREDEFINED_TAGS.map((tag) => ({
                        tag,
                        count: 0,
                        isPredefined: true,
                    }))

                    // Merge predefined tags with popular tags from database
                    // Remove duplicates (prefer database counts over predefined)
                    const dbTags = Array.isArray(tagsData) ? tagsData : []
                    const dbTagNames = new Set(
                        dbTags.map((t) => t.tag.toLowerCase())
                    )

                    const uniquePredefined = predefinedTagsData.filter(
                        (pt) => !dbTagNames.has(pt.tag.toLowerCase())
                    )

                    // Combine: database tags first (with counts), then predefined
                    const allTags = [...dbTags, ...uniquePredefined]
                    setPopularTags(allTags)
                } catch (tagError) {
                    console.error("Failed to fetch popular tags:", tagError)
                    // Fallback to predefined tags only
                    setPopularTags(
                        PREDEFINED_TAGS.map((tag) => ({
                            tag,
                            count: 0,
                            isPredefined: true,
                        }))
                    )
                }
            } catch (error) {
                console.error("Failed to load categories:", error)
                // Fallback to default if API fails
            }
        }

        loadCategories()
    }, []) // Run once on mount

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch Videos (Page 1)
                const videoResponse = await getAllVideos({
                    page: 1,
                    limit: 15,
                    category:
                        activeCategory !== "All" && activeCategory !== "Tweets"
                            ? activeCategory
                            : undefined,
                    tags: activeTag || undefined, // Filter by tag if selected
                })
                const videos =
                    videoResponse.videos || videoResponse.data?.videos || []

                // Fetch Tweets (Always fetch for mixed feed)
                let tweets = []
                try {
                    const tweetResponse = await getAllTweets()
                    // API returns array directly
                    tweets = Array.isArray(tweetResponse) ? tweetResponse : []
                    tweets = tweets.map((t) => ({ ...t, isTweet: true }))
                } catch (err) {
                    console.error("Failed to fetch tweets", err)
                }

                // If "Tweets" category selected, only show tweets
                if (activeCategory === "Tweets") {
                    setMixedFeed(tweets)
                } else {
                    // Filter mixed feed based on category if not "All"/ "Tweets" is handled above
                    // Actually, if category is specific (e.g. "Gaming"), getAllVideos handles it.
                    // But we still merge tweets? No, if category is "Gaming", tweets shouldn't show unless they have that category (which they don't seem to have).
                    // So if category is specific, we probably only want videos.

                    let content = [...videos]

                    // If "All", include tweets
                    if (activeCategory === "All") {
                        content = [...content, ...tweets]
                    }

                    // Sort by Date
                    const merged = content.sort(
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
    }, [activeCategory, activeTag])

    return (
        <div className="min-h-screen bg-[#1E2021] pb-20">
            {/* CATEGORY FILTERS with Sliding Animation */}
            {categories.length > 0 && (
                <div className="relative flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-4 md:px-8 lg:px-12 mt-8">
                    {/* Animated Background Slider */}
                    <div
                        className="absolute bottom-2 h-10 bg-red-600 rounded-full shadow-lg shadow-red-500/30 transition-all duration-300 ease-out"
                        style={{
                            width: categories.find(
                                (c) => c.name === activeCategory
                            )
                                ? `${document.getElementById(`cat-${activeCategory}`)?.offsetWidth || 0}px`
                                : "0px",
                            left: categories.find(
                                (c) => c.name === activeCategory
                            )
                                ? `${document.getElementById(`cat-${activeCategory}`)?.offsetLeft || 0}px`
                                : "0px",
                        }}
                    />

                    {categories.map((category) => {
                        const isActive = activeCategory === category.name
                        return (
                            <button
                                id={`cat-${category.name}`}
                                key={category.name}
                                onClick={() => setActiveCategory(category.name)}
                                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${
                                    isActive
                                        ? "text-white"
                                        : "bg-[#2A2D2E] text-gray-400 hover:bg-[#2F3233] hover:text-white"
                                }`}
                            >
                                {category.icon}
                                {category.name}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* POPULAR TAGS */}
            {popularTags.length > 0 && (
                <div className="px-4 md:px-8 lg:px-12 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Popular Tags
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {popularTags.map((tagData) => (
                            <button
                                key={tagData.tag}
                                onClick={() => {
                                    if (activeTag === tagData.tag) {
                                        setActiveTag(null) // Deselect
                                    } else {
                                        setActiveTag(tagData.tag)
                                        setActiveCategory("All") // Reset category when filtering by tag
                                    }
                                }}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                    activeTag === tagData.tag
                                        ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                                        : "bg-[#2A2D2E] text-gray-400 hover:bg-[#2F3233] hover:text-white"
                                }`}
                            >
                                #{tagData.tag}
                                {tagData.count > 0 && (
                                    <span className="ml-1.5 text-xs opacity-70">
                                        {tagData.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* FEED TITLE */}
            <div className="px-4 md:px-8 lg:px-12 mt-8 mb-6">
                <h2 className="text-xl font-bold text-white mb-1">
                    {activeTag
                        ? `#${activeTag}`
                        : activeCategory === "All"
                          ? "For You"
                          : activeCategory}
                </h2>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {mixedFeed.length} Items Found
                </p>
            </div>

            {/* MASONRY GRID LAYOUT */}
            <div className="px-4 md:px-8 lg:px-12">
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) =>
                            i % 3 === 0 ? (
                                <TweetCardSkeleton key={i} />
                            ) : (
                                <VideoCardSkeleton key={i} />
                            )
                        )
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
                        <div className="col-span-full break-inside-avoid">
                            <EmptyState
                                icon={
                                    activeCategory === "Tweets"
                                        ? MessageSquare
                                        : Film
                                }
                                title={`No ${activeCategory.toLowerCase()} found`}
                                description={`Check back later for new ${activeCategory.toLowerCase()} content`}
                                animated={true}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HomePage
