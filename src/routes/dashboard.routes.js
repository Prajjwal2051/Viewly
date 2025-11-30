// ============================================
// DASHBOARD ROUTES
// ============================================
// Defines API endpoints for channel analytics and statistics

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

// ============================================
// INITIALIZE ROUTER
// ============================================
const router = Router();

/**
 * GET CHANNEL STATISTICS ROUTE
 * Retrieves comprehensive analytics for a channel
 * 
 * Returns:
 * - Total counts (videos, views, likes, subscribers, comments)
 * - Growth metrics by month
 * - 30-day performance comparison
 * - Engagement metrics
 * - Most popular video
 * 
 * @route GET /api/v1/dashboard/stats/:channelId
 * @access Private (only channel owner)
 */
router.route("/stats/:channelId").get(verifyJWT, getChannelStats);

/**
 * GET CHANNEL VIDEOS ROUTE
 * Retrieves paginated list of videos from a channel
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Videos per page (default: 10)
 * - sortBy: Sort field - views, createdAt, likes (default: createdAt)
 * - sortOrder: asc or desc (default: desc)
 * 
 * Privacy:
 * - Public: Shows only published videos
 * - Owner: Shows all videos (including unpublished)
 * 
 * @route GET /api/v1/dashboard/videos/:channelId
 * @access Public (with privacy filtering)
 */
router.route("/videos/:channelId").get(getChannelVideos);

export default router;
