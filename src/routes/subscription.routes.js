// ============================================
// SUBSCRIPTION ROUTES
// ============================================
// Defines API endpoints for channel subscription operations
// Handles subscribe/unsubscribe, subscriber lists, and subscribed channels

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js"

// Initialize Express router
const router = Router()

/**
 * TOGGLE SUBSCRIPTION ROUTE
 * Subscribe or unsubscribe from a channel
 * 
 * @route POST /api/v1/subscriptions/c/:channelId
 * @access Private (requires authentication)
 * @param {string} channelId - MongoDB ObjectId of channel to subscribe/unsubscribe
 * @middleware verifyJWT - Ensures user is logged in
 * @returns {Object} Subscription status (isSubscribed: true/false)
 */
router.route("/c/:channelId")
    .post(verifyJWT, toggleSubscription)

/**
 * GET CHANNEL SUBSCRIBERS ROUTE
 * Get list of users subscribed to a specific channel
 * 
 * @route GET /api/v1/subscriptions/c/:channelId/subscribers
 * @access Public (anyone can view subscriber count and list)
 * @param {string} channelId - MongoDB ObjectId of channel
 * @returns {Object} Paginated list of subscribers with details
 */
router.route("/c/:channelId/subscribers")
    .get(getUserChannelSubscribers)

/**
 * GET SUBSCRIBED CHANNELS ROUTE
 * Get list of channels the current user is subscribed to
 * 
 * @route GET /api/v1/subscriptions/subscribed
 * @access Private (requires authentication)
 * @middleware verifyJWT - Identifies current user
 * @returns {Object} List of channels with latest videos
 */
router.route("/subscribed")
    .get(verifyJWT, getSubscribedChannels)

// Export router for use in app.js
export default router