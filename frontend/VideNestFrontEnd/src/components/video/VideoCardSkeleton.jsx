import { Skeleton } from "@/components/ui/skeleton"

const VideoCardSkeleton = () => {
    return (
        <div className="group relative w-full mb-6 break-inside-avoid rounded-2xl overflow-hidden shadow-lg bg-card border border-border flex flex-col">
            {/* Thumbnail Skeleton */}
            <Skeleton className="relative w-full h-64 rounded-none">
                {/* Duration Badge */}
                <Skeleton className="absolute bottom-2 right-2 h-5 w-12 rounded-md bg-black/50" />
            </Skeleton>

            {/* Content Section */}
            <div className="p-4 flex flex-col gap-3">
                {/* Title Lines */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Owner Info */}
                <div className="flex items-center gap-3 mt-2">
                    {/* Avatar */}
                    <Skeleton className="h-8 w-8 rounded-full" />
                    {/* Name & Stats */}
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2 w-32" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoCardSkeleton
