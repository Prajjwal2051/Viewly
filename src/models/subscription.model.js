// ============================================
// SUBSCRIPTION MODEL - DATABASE SCHEMA
// ============================================
// Defines the structure for subscription documents in MongoDB
// Tracks channel subscriptions (user following other users)

import mongoose, { mongo, Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

/**
 * SUBSCRIPTION SCHEMA
 * Represents a subscription relationship between users
 * 
 * Concept:
 * - User A subscribes to User B's channel
 * - subscriber = User A (the follower)
 * - channel = User B (the content creator being followed)
 * 
 * Features:
 * - Track who is subscribed to whom
 * - Calculate subscriber counts per channel
 * - Get list of channels a user subscribes to
 * - Support for subscription notifications
 * 
 * Database Design:
 * - Simple two-field relationship
 * - Both fields reference User model (users can be both subscribers and channels)
 * - Timestamps track when subscription was created
 * 
 * Used For:
 * - Building "My Subscriptions" page
 * - Showing subscriber count on channel pages
 * - Filtering videos by subscribed channels
 * - Sending notifications for new content from subscribed channels
 */
const subscriptionSchema = new mongoose.Schema(
    {
        // User who is subscribing (the follower)
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User",          // Links to User collection
            // Example: User A subscribes to User B
            //          subscriber = User A
        },

        // User being subscribed to (the channel owner)
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User",          // Links to User collection
            // Example: User A subscribes to User B
            //          channel = User B
        },
    },
    {
        // Automatically track when subscription was created/updated
        timestamps: true,
    }
)

// Enable pagination for subscription queries (subscriber lists, etc.)
subscriptionSchema.plugin(mongooseAggregatePaginate)

// Export the Subscription model for use in controllers
export const subscription = mongoose.model("Subscription", subscriptionSchema)
