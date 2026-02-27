import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

const TweetCardSkeleton = () => {
    return (
        <div className="group relative w-full mb-6 break-inside-avoid rounded-2xl overflow-hidden shadow-lg bg-card border border-border flex flex-col">
            {/* Image Skeleton */}
            <Skeleton className="relative w-full h-64 rounded-none" />

            {/* Content Section */}
            <div className="p-5 flex flex-col gap-4">
                {/* Text Lines */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>

                {/* Owner Info & Likes */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <Skeleton className="h-10 w-10 rounded-full" />
                        {/* Name & Date */}
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-2 w-16" />
                        </div>
                    </div>

                    {/* Like Count */}
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-3 w-8" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TweetCardSkeleton
