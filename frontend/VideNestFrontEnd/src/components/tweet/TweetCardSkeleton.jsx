import React from "react"

const TweetCardSkeleton = () => {
    return (
        <div className="group relative w-full mb-6 break-inside-avoid rounded-2xl overflow-hidden shadow-lg bg-[#2A2D2E] border border-transparent flex flex-col animate-pulse">
            {/* Image Skeleton */}
            <div className="relative w-full h-64 bg-gradient-to-r from-[#1E2021] via-[#2A2D2E] to-[#1E2021] bg-[length:200%_100%] animate-shimmer" />

            {/* Content Section */}
            <div className="p-5 flex flex-col gap-4">
                {/* Text Lines */}
                <div className="space-y-2">
                    <div className="h-4 bg-gradient-to-r from-[#1E2021] via-[#2A2D2E] to-[#1E2021] bg-[length:200%_100%] animate-shimmer rounded w-3/4" />
                    <div className="h-4 bg-gradient-to-r from-[#1E2021] via-[#2A2D2E] to-[#1E2021] bg-[length:200%_100%] animate-shimmer rounded w-1/2" />
                </div>

                {/* Owner Info & Likes */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#1E2021] via-[#2A2D2E] to-[#1E2021] bg-[length:200%_100%] animate-shimmer" />
                        {/* Name & Date */}
                        <div className="flex flex-col gap-2">
                            <div className="h-3 bg-gradient-to-r from-[#1E2021] via-[#2A2D2E] to-[#1E2021] bg-[length:200%_100%] animate-shimmer rounded w-24" />
                            <div className="h-2 bg-gradient-to-r from-[#1E2021] via-[#2A2D2E] to-[#1E2021] bg-[length:200%_100%] animate-shimmer rounded w-16" />
                        </div>
                    </div>

                    {/* Like Count */}
                    <div className="flex items-center gap-1.5">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-[#1E2021] via-[#2A2D2E] to-[#1E2021] bg-[length:200%_100%] animate-shimmer" />
                        <div className="h-3 bg-gradient-to-r from-[#1E2021] via-[#2A2D2E] to-[#1E2021] bg-[length:200%_100%] animate-shimmer rounded w-8" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TweetCardSkeleton
