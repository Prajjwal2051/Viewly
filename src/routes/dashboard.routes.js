// ============================================
// DASHBOARD ROUTES
// ============================================
// Defines API endpoints for channel analytics and statistics

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats } from "../controllers/dashboard.controller.js";

// ============================================
// INITIALIZE ROUTER
// ============================================
const router = Router();

// ============================================
// PROTECTED ROUTES (Authentication Required)
// All dashboard routes require authentication
// ============================================
router.use(verifyJWT);

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
router.route("/stats/:channelId").get(getChannelStats);

export default router;
