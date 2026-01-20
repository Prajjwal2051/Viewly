// ============================================
// NOTIFICATION MODEL - DATABASE SCHEMA
// ============================================
// Defines the structure for notification documents in MongoDB
// Manages user notifications for various platform activities

import mongoose from "mongoose"
import { Schema } from "mongoose"

/**
 * NOTIFICATION SCHEMA
 * Represents a notification sent to a user
 * 
 * Features:
 * - Multiple notification types (like, comment, subscription, video upload)
 * - Links to related content (video, comment)
 * - Read/unread status tracking
 * - Timestamp when notification was read
 * 
 * Notification Types:
 * - LIKE: Someone liked your video/comment
 * - COMMENT: Someone commented on your video
 * - SUBSCRIPTION: Someone subscribed to your channel
 * - VIDEO_UPLOAD: A channel you subscribe to uploaded a new video
 * 
 * Used For:
 * - Notification bell/badge in UI
 * - Keeping users engaged with platform activity
 * - Real-time updates about interactions
 * - User engagement tracking
 */
const notificationSchema = new mongoose.Schema(
    {
        // User who will receive this notification
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",          // Links to User collection
            required: true,       // Every notification must have a recipient
        },

        // User who triggered this notification (who performed the action)
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",          // Links to User collection
            // Optional - some notifications might not have a sender
        },

        // Type of notification (what action occurred)
        type: {
            type: String,
            enum: ["LIKE", "COMMENT", "SUBSCRIPTION", "VIDEO_UPLOAD"],
            required: true,       // Must specify notification type
            // LIKE = someone liked your content
            // COMMENT = someone commented on your video
            // SUBSCRIPTION = someone subscribed to your channel
            // VIDEO_UPLOAD = subscribed channel uploaded new video
        },

        // Related video (if notification is about a video)
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",         // Links to Video collection
            // Optional - only set for video-related notifications
        },

        // Related comment (if notification is about a comment)
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",       // Links to Comment collection
            // Optional - only set for comment-related notifications
        },

        // Human-readable notification message
        message: {
            type: String,
            required: true,       // Every notification needs a message
            // Example: "John liked your video 'How to code'"
        },

        // Whether user has read this notification
        isRead: {
            type: Boolean,
            default: false,       // New notifications are unread
            // Used to show unread notification count
        },

        // Timestamp when notification was marked as read
        readAt: {
            type: Date,
            // Only set when isRead = true
            // Helps track notification engagement
        }
    },
    {
        // Automatically add createdAt and updatedAt timestamps
        timestamps: true
    }
)

// Export the Notification model for use in controllers
export const Notification = mongoose.model("Notification", notificationSchema)
