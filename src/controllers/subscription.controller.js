// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { mongo } from "mongoose";
import { subscription } from "../models/subscription.model.js";

// ============================================
// CONTROLLER FUNCTIONS
// ============================================

/**
 * TOGGLE SUBSCRIPTION CONTROLLER
 * Handles subscribing/unsubscribing a user to/from a channel
 * 
 * Purpose:
 * - Subscribe users to channels they're interested in
 * - Unsubscribe from channels when no longer interested
 * - Implements toggle pattern (one click to subscribe/unsubscribe)
 * - Maintains subscriber-channel relationship in database
 * 
 * Process Flow:
 * 1. Extract and validate user ID and channel ID
 * 2. Verify channel exists in the database
 * 3. Check if subscription already exists
 * 4. If exists -> Remove subscription (unsubscribe)
 * 5. If doesn't exist -> Create subscription (subscribe)
 * 6. Return updated subscription status
 * 
 * @route POST /api/v1/subscriptions/c/:channelId
 * @access Private (requires authentication)
 * @param {string} channelId - MongoDB ObjectId of the channel to subscribe/unsubscribe
 * @returns {Object} ApiResponse with subscription status (isSubscribed: true/false)
 */
const toggleSubscription = asyncHandler(async (req, res) => {
    // STEP 1: Extract user and channel identifiers
    const userId = req.user._id
    const { channelId } = req.params

    // STEP 2: Validate channel ID is provided
    // (userId check not needed - auth middleware guarantees it exists)
    if (!channelId) {
        throw new ApiError(400, "Channel ID not provided")
    }

    // STEP 3: Validate channel ID format
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID format")
    }

    // STEP 4: Prevent self-subscription CRITICAL CHECK
    // Users cannot subscribe to themselves
    if (userId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }

    // STEP 5: Verify the channel exists
    const channelExists = await User.findById(channelId)
    if (!channelExists) {
        throw new ApiError(404, "Channel does not exist")
    }

    // STEP 6: Check if subscription relationship already exists
    // This query searches for a matching subscriber-channel pair in the database
    // Result determines whether we subscribe (create) or unsubscribe (delete)
    const existingSubscription = await subscription.findOne({
        subscriber: userId,    // The user performing the action
        channel: channelId     // The channel they want to subscribe/unsubscribe to
    })

    // STEP 7: Initialize MongoDB Transaction Session
    // WHY USE TRANSACTIONS?
    // We need to perform TWO database operations atomically:
    // 1. Add/Remove subscription document
    // 2. Increment/Decrement channel's subscriber count
    // 
    // If one operation succeeds but the other fails, data becomes inconsistent.
    // Transactions ensure BOTH operations succeed or BOTH are rolled back.
    // This maintains data integrity (subscriber count always matches actual subscriptions)
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        // STEP 8: Toggle subscription based on current state
        if (existingSubscription) {
            // ═══════════════════════════════════════════
            // CASE A: UNSUBSCRIBE (Subscription exists)
            // ═══════════════════════════════════════════
            
            // Operation 1: Delete the subscription document from database
            // {session} ensures this is part of the transaction
            await subscription.deleteOne(
                { _id: existingSubscription._id },
                { session }
            )
            
            // Operation 2: Decrement channel's subscriber count by 1
            // $inc operator performs atomic increment/decrement operations
            // Using -1 decreases the count (unsubscribe = one less subscriber)
            await User.findByIdAndUpdate(
                channelId,
                {
                    $inc: { subscriberCount: -1 }
                },
                { session }   // Part of same transaction
            )

            // Commit transaction: Both operations successful, make changes permanent
            await session.commitTransaction()

            // Return success response with unsubscribed state
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { isSubscribed: false },
                        "Unsubscribed successfully"
                    )
                )
        } else {
            // ═══════════════════════════════════════════
            // CASE B: SUBSCRIBE (Subscription doesn't exist)
            // ═══════════════════════════════════════════
            
            // Operation 1: Create new subscription document
            // Links the subscriber (user) to the channel they want to follow
            await subscription.create(
                [{
                    subscriber: userId,
                    channel: channelId
                }],
                { session }   // Must pass session in array format for create()
            )

            // Operation 2: Increment channel's subscriber count by 1
            // $inc with positive value increases the count
            // (new subscription = one more subscriber)
            await User.findByIdAndUpdate(
                channelId,
                {
                    $inc: { subscriberCount: 1 }
                },
                { session }   // Part of same transaction
            )

            // Commit transaction: Both operations successful, make changes permanent
            await session.commitTransaction()
            
            // Return success response with subscribed state
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { isSubscribed: true },
                        "Subscribed successfully"
                    )
                )
        }
    } catch (error) {
        // ERROR HANDLING: If ANY operation in the transaction fails
        // Roll back ALL changes to maintain database consistency
        // Example: If subscription is created but count update fails,
        // the subscription creation will also be undone
        await session.abortTransaction()
        
        // Throw descriptive error for debugging
        throw new ApiError(500, "Subscription operation failed: " + error.message)
    } finally {
        // CLEANUP: Always end the session regardless of success/failure
        // This releases database resources and prevents memory leaks
        // The finally block ensures this runs even if errors occur
        session.endSession()
    }
})





// ============================================
// EXPORT CONTROLLERS
// ============================================
export {
    toggleSubscription, 

}


