// ============================================
// VIDEO CARD SKELETON - LOADING PLACEHOLDER
// ============================================
// Displays animated placeholder while videos are loading.
// Matches VideoCard layout for seamless transition.

const VideoCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
            {/* Thumbnail skeleton */}
            <div className="aspect-video bg-gray-300"></div>
            
            {/* Info section skeleton */}
            <div className="p-4">
                <div className="flex gap-3">
                    {/* Avatar skeleton */}
                    <div className="h-10 w-10 rounded-full bg-gray-300 shrink-0"></div>
                    
                    <div className="flex-1 space-y-2">
                        {/* Title skeleton - 2 lines */}
                        <div className="h-4 bg-gray-300 rounded w-full"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        
                        {/* Channel name skeleton */}
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        
                        {/* Stats skeleton */}
                        <div className="flex gap-3">
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                            <div className="h-3 bg-gray-200 rounded w-12"></div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoCardSkeleton
