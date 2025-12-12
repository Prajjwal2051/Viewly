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
        <div className="group relative w-full mb-6 break-inside-avoid rounded-2xl overflow-hidden shadow-lg bg-[#2A2D2E] border border-transparent flex flex-col">
            {/* Thumbnail Skeleton */}
            <div className="relative w-full h-64 bg-gradient-to-r from-[#1E2021] via-[#2A2D2E] to-[#1E2021] bg-[length:200%_100%] animate-shimmer">
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 h-5 w-12 bg-[#1E2021] rounded-md" />
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col gap-3">
                {/* Title Lines */}
                <div className="space-y-2">
                    <div className="h-4 bg-gradient-to-r from-[#1E2021] via-[#2A2D2E] to-[#1E2021] bg-[length:200%_100%] animate-shimmer rounded w-full" />
                    <div className="h-4 bg-gradient-to-r from-[#1E2021] via-[#2A2D2E] to-[#1E2021] bg-[length:200%_100%] animate-shimmer rounded w-3/4" />
                </div>

                {/* Owner Info */}
                <div className="flex items-center gap-3 mt-2">
                    {/* Avatar */}
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#1E2021] via-[#2A2D2E] to-[#1E2021] bg-[length:200%_100%] animate-shimmer" />
                    {/* Name & Stats */}
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gradient-to-r from-[#1E2021] via-[#2A2D2E] to-[#1E2021] bg-[length:200%_100%] animate-shimmer rounded w-24" />
                        <div className="h-2 bg-gradient-to-r from-[#1E2021] via-[#2A2D2E] to-[#1E2021] bg-[length:200%_100%] animate-shimmer rounded w-32" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoCardSkeleton
