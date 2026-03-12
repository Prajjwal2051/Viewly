// ============================================================
// Copyright (c) 2026 Prajjwal (github.com/Prajjwal2051)
// Project : VidNest — Video Sharing Platform
// License : Proprietary — All Rights Reserved
// Unauthorized copying, modification, or distribution of this
// file, via any medium, is strictly prohibited.
// ============================================================
/**
 * GET IS VIDEO LIKED CONTROLLER
 * Checks if the authenticated user has liked a specific video
 *
 * Purpose:
 * - Allow frontend to show correct like status (red thumb vs grey thumb)
 *
 * @route GET /api/v1/likes/status/v/:videoId
 * @access Private
 */
const getIsVideoLiked = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const existingLike = await like.findOne({
        video: videoId,
        likedBy: userId,
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: !!existingLike },
                "Like status fetched successfully"
            )
        )
})
