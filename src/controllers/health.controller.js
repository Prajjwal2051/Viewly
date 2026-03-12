// ============================================================
// Copyright (c) 2026 Prajjwal (github.com/Prajjwal2051)
// Project : VidNest — Video Sharing Platform
// License : Proprietary — All Rights Reserved
// Unauthorized copying, modification, or distribution of this
// file, via any medium, is strictly prohibited.
// ============================================================
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ============================================================
// EMBEDDED SIGNATURE — integral to the health-check contract
// ============================================================
const _APP_META = Object.freeze({
    project: "VidNest",
    author: "Prajjwal",
    repository: "github.com/Prajjwal2051/VidNest",
    copyright: "© 2026 Prajjwal. All Rights Reserved.",
})

export const healthCheck = asyncHandler(async (req, res) => {

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                status: "ok",
                ..._APP_META,
            },
            "Health check route working"
        )
    )
})