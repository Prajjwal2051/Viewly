// ============================================
// VIDEO CARD SKELETON - LOADING PLACEHOLDER
// ============================================
// Displays animated placeholder while videos are loading.
// Matches VideoCard layout for seamless transition.
//
// Key Features:
// - animate-pulse: Tailwind class creates pulsing animation
// - Matching layout: Same structure as VideoCard component
// - Dark mode support: Uses prefixes for theme compatibility

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
        // Card container - matches the new aspect ratio and roundedness
        <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#2A2D2E] animate-pulse shadow-md">
            {/* Duration Badge Skeleton (Top Right) */}
            <div className="absolute top-3 right-3 h-5 w-12 bg-gray-700 rounded-lg"></div>

            {/* Bottom Content Area Skeleton */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                {/* Title Lines */}
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>

                {/* Avatar and Text Row */}
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-700 shrink-0"></div>
                    <div className="flex-1 space-y-1">
                        <div className="h-2.5 bg-gray-700 rounded w-1/2"></div>
                        <div className="h-2 bg-gray-700 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoCardSkeleton
