// ============================================
// VIDEO CARD SKELETON - LOADING PLACEHOLDER
// ============================================
// Displays animated placeholder while videos are loading.
// Matches VideoCard layout for seamless transition.
//
// Key Features:
// - animate-pulse: Tailwind class creates pulsing animation
// - Matching layout: Same structure as VideoCard component
// - Dark mode support: Uses dark: prefixes for theme compatibility

/**
 * VIDEO CARD SKELETON COMPONENT
 * Shows during loading states to improve perceived performance
 * 
 * Usage:
 * {loading && <VideoCardSkeleton />}
 * {videos.map(video => <VideoCard key={video.id} video={video} />)}
 */
const VideoCardSkeleton = () => {
    return (
        // Card container - animate-pulse creates shimmer effect
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse border dark:border-gray-700">
            {/* Thumbnail skeleton - 16:9 aspect ratio */}
            <div className="aspect-video bg-gray-300 dark:bg-gray-700"></div>

            {/* Info section skeleton - matches VideoCard padding */}
            <div className="p-4">
                <div className="flex gap-3">
                    {/* Avatar skeleton - circular, matches avatar size */}
                    <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 shrink-0"></div>

                    <div className="flex-1 space-y-2">
                        {/* Title skeleton - 2 lines to match line-clamp-2 */}
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>

                        {/* Channel name skeleton */}
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>

                        {/* Stats skeleton - matches video stats layout (views, likes, date) */}
                        <div className="flex gap-3">
                            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoCardSkeleton
