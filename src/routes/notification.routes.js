// ============================================
// NOTIFICATION ROUTES
// ============================================
// Defines all API endpoints for notification operations

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from "../controllers/notification.controller.js";

// ============================================
// INITIALIZE ROUTER
// ============================================
const router = Router();

// ============================================
// PROTECTED ROUTES (Authentication Required)
// All notification routes require authentication
// ============================================
router.use(verifyJWT);

/**
 * GET NOTIFICATIONS ROUTE
 * Retrieves paginated list of user's notifications
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - isRead: Filter by read status (optional)
 * 
 * @route GET /api/v1/notifications
 * @access Private
 */
router.route("/").get(getNotifications);

/**
 * MARK ALL AS READ ROUTE
 * Marks all unread notifications as read for the user
 * 
 * @route PATCH /api/v1/notifications/read-all
 * @access Private
 */
router.route("/read-all").patch(markAllAsRead);

/**
 * MARK AS READ & DELETE NOTIFICATION ROUTES
 * Manage individual notification status and lifecycle
 * 
 * PATCH: Mark specific notification as read
 * DELETE: Permanently delete the notification
 * 
 * @route PATCH /api/v1/notifications/:notificationId/read
 * @route DELETE /api/v1/notifications/:notificationId
 * @access Private (only notification recipient)
 */
router.route("/:notificationId/read").patch(markAsRead);
router.route("/:notificationId").delete(deleteNotification);

export default router;
