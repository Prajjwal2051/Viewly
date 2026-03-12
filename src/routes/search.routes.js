// ============================================================
// Copyright (c) 2026 Prajjwal (github.com/Prajjwal2051)
// Project : VidNest — Video Sharing Platform
// License : Proprietary — All Rights Reserved
// Unauthorized copying, modification, or distribution of this
// file, via any medium, is strictly prohibited.
// ============================================================
// ============================================
// SEARCH ROUTES
// ============================================
// Defines API endpoints for video search functionality

import { Router } from "express";
import { searchVideos } from "../controllers/search.controller.js";

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET /api/v1/search
 * Search videos with filters and pagination
 * Query parameters: query, category, startDate, endDate, minDuration, maxDuration, sortBy, page, limit
 * @access Public
 */
router.route("/").get(searchVideos)

export default router