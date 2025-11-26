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