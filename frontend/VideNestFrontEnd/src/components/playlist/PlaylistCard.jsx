import React from "react"
import { useNavigate } from "react-router-dom"
import { ListVideo, Lock, Globe } from "lucide-react"
import { Card } from "@/components/ui/card"

const PlaylistCard = ({ playlist }) => {
    const navigate = useNavigate()

    const thumbnail = playlist.videos?.[0]?.thumbnail || null
    const videoCount = playlist.videoCount || playlist.videos?.length || 0

    return (
        <Card
            onClick={() => navigate(`/playlists/${playlist._id}`)}
            className="group cursor-pointer overflow-hidden hover:border-primary transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
        >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-background flex items-center justify-center overflow-hidden">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={playlist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ListVideo size={48} strokeWidth={1.5} />
                        <p className="text-sm mt-2">No videos yet</p>
                    </div>
                )}

                {/* Video Count Overlay */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <ListVideo size={14} className="text-white" />
                    <span className="text-white text-sm font-semibold">
                        {videoCount}
                    </span>
                </div>

                {/* Privacy Indicator */}
                <div className="absolute bottom-2 left-2">
                    {playlist.isPublic ? (
                        <div className="bg-green-600/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                            <Globe size={12} className="text-white" />
                            <span className="text-white text-xs font-medium">
                                Public
                            </span>
                        </div>
                    ) : (
                        <div className="bg-muted/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                            <Lock size={12} className="text-white" />
                            <span className="text-white text-xs font-medium">
                                Private
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-semibold text-foreground text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                    {playlist.name}
                </h3>
                {playlist.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                        {playlist.description}
                    </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                        {videoCount} {videoCount === 1 ? "video" : "videos"}
                    </span>
                    {playlist.updatedAt && (
                        <>
                            <span>•</span>
                            <span>
                                Updated{" "}
                                {new Date(
                                    playlist.updatedAt
                                ).toLocaleDateString()}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </Card>
    )
}

export default PlaylistCard
