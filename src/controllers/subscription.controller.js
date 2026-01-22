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
    console.log("\n" + "=".repeat(60));
    console.log(" TOGGLE SUBSCRIPTION REQUEST");
    console.log("=".repeat(60));

    // STEP 1: Extract user and channel identifiers
    const userId = req.user._id
    const { channelId } = req.params

    console.log("\n[STEP 1]  Extracting Request Data");
    console.log("   User ID:", userId);
    console.log("   Channel ID:", channelId);
    console.log("   User:", req.user?.username);

    console.log("\n[STEP 2] Validating Channel ID");
    // STEP 2: Validate channel ID is provided
    // (userId check not needed - auth middleware guarantees it exists)
    if (!channelId) {
        console.log("   Channel ID not provided");
        throw new ApiError(400, "Channel ID not provided")
    }
    console.log("   Channel ID provided");

    // STEP 3: Validate channel ID format
    if (!mongoose.isValidObjectId(channelId)) {
        console.log("   Invalid MongoDB ObjectId format");
        throw new ApiError(400, "Invalid channel ID format")
    }
    console.log("   Channel ID format is valid");

    console.log("\n[STEP 3]  Checking Self-Subscription");
    // STEP 4: Prevent self-subscription CRITICAL CHECK
    // Users cannot subscribe to themselves
    if (userId.toString() === channelId.toString()) {
        console.log("   User attempting to subscribe to themselves");
        throw new ApiError(400, "You cannot subscribe to yourself")
    }
    console.log("   Not a self-subscription attempt");

    console.log("\n[STEP 4]  Verifying Channel Exists");
    // STEP 5: Verify the channel exists
    const channelExists = await User.findById(channelId)
    if (!channelExists) {
        console.log("   Channel not found in database");
        throw new ApiError(404, "Channel does not exist")
    }
    console.log("   Channel found:", channelExists.username);
    console.log("   Current Subscriber Count:", channelExists.subscriberCount || 0);

    console.log("\n[STEP 5]  Checking Existing Subscription");
    // STEP 6: Check if subscription relationship already exists
    // This query searches for a matching subscriber-channel pair in the database
    // Result determines whether we subscribe (create) or unsubscribe (delete)
    const existingSubscription = await subscription.findOne({
        subscriber: userId,    // The user performing the action
        channel: channelId     // The channel they want to subscribe/unsubscribe to
    })

    if (existingSubscription) {
        console.log("   Status: Already subscribed - will UNSUBSCRIBE");
    } else {
        console.log("   Status: Not subscribed - will SUBSCRIBE");
    }

    console.log("\n[STEP 6]  Starting Database Transaction");
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
    console.log("   Transaction session started");

    try {
        // STEP 8: Toggle subscription based on current state
        if (existingSubscription) {
            console.log("\n[STEP 7]  Processing UNSUBSCRIBE");
            // 
            // CASE A: UNSUBSCRIBE (Subscription exists)
            // 

            console.log("   Deleting subscription document...");
            // Operation 1: Delete the subscription document from database
            // {session} ensures this is part of the transaction
            await subscription.deleteOne(
                { _id: existingSubscription._id },
                { session }
            )
            console.log("   Subscription document deleted");

            console.log("   Decrementing subscriber count...");
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
            console.log("   Subscriber count decremented");

            // Commit transaction: Both operations successful, make changes permanent
            await session.commitTransaction()
            console.log("   Transaction committed successfully");

            console.log("\n" + "=".repeat(60));
            console.log("UNSUBSCRIBED SUCCESSFULLY");
            console.log("=".repeat(60));
            console.log("    User:", req.user.username);
            console.log("    Channel:", channelExists.username);
            console.log("    New Subscriber Count:", (channelExists.subscriberCount || 1) - 1);
            console.log("=".repeat(60) + "\n");

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
            console.log("\n[STEP 7]  Processing SUBSCRIBE");
            // 
            // CASE B: SUBSCRIBE (Subscription doesn't exist)
            // 

            console.log("   Creating subscription document...");
            // Operation 1: Create new subscription document
            // Links the subscriber (user) to the channel they want to follow
            await subscription.create(
                [{
                    subscriber: userId,
                    channel: channelId
                }],
                { session }   // Must pass session in array format for create()
            )
            console.log("   Subscription document created");

            console.log("   Incrementing subscriber count...");
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
            console.log("   Subscriber count incremented");

            // Commit transaction: Both operations successful, make changes permanent
            await session.commitTransaction()
            console.log("   Transaction committed successfully");

            console.log("\n" + "=".repeat(60));
            console.log("SUBSCRIBED SUCCESSFULLY");
            console.log("=".repeat(60));
            console.log("    User:", req.user.username);
            console.log("    Channel:", channelExists.username);
            console.log("    New Subscriber Count:", (channelExists.subscriberCount || 0) + 1);
            console.log("=".repeat(60) + "\n");

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
        console.log("\nTRANSACTION FAILED");
        console.log("   Error:", error.message);
        console.log("   Rolling back all changes...");

        // ERROR HANDLING: If ANY operation in the transaction fails
        // Roll back ALL changes to maintain database consistency
        // Example: If subscription is created but count update fails,
        // the subscription creation will also be undone
        await session.abortTransaction()
        console.log("   Transaction rolled back successfully\n");

        // Throw descriptive error for debugging
        throw new ApiError(500, "Subscription operation failed: " + error.message)
    } finally {
        // CLEANUP: Always end the session regardless of success/failure
        // This releases database resources and prevents memory leaks
        // The finally block ensures this runs even if errors occur
        session.endSession()
    }
})

/**
 * GET USER CHANNEL SUBSCRIBERS CONTROLLER
 * Retrieves paginated list of subscribers for a specific channel
 * 
 * Purpose:
 * - Display all users who have subscribed to a channel
 * - Show subscriber details (username, avatar, full name)
 * - Support pagination for channels with many subscribers
 * - Sort by most recent subscriptions first
 * 
 * Use Cases:
 * - Channel owner viewing their subscriber list
 * - Analytics dashboard showing subscriber growth
 * - Displaying "Subscribers" tab on channel page
 * 
 * Features:
 * - Pagination (default: 10 subscribers per page)
 * - Sorted by subscription date (newest first)
 * - Includes subscriber profile information
 * - Returns total subscriber count
 * 
 * Process Flow:
 * 1. Extract and validate channel ID from URL
 * 2. Parse pagination parameters (page, limit)
 * 3. Verify channel exists in database
 * 4. Build MongoDB aggregation pipeline to fetch subscriber details
 * 5. Execute paginated query
 * 6. Return formatted subscriber list with metadata
 * 
 * @route GET /api/v1/subscriptions/c/:channelId/subscribers
 * @access Public (anyone can see channel subscribers)
 * @param {string} channelId - MongoDB ObjectId of the channel
 * @query {number} page - Page number for pagination (default: 1)
 * @query {number} limit - Number of subscribers per page (default: 10)
 * @returns {Object} ApiResponse with paginated subscriber list and metadata
 */
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // STEP 1: Extract channel ID from URL parameters
    const { channelId } = req.params

    // STEP 2: Extract pagination parameters from query string
    // Default values: page 1, 10 subscribers per page
    // Users can override: ?page=2&limit=20
    const { page = 1, limit = 10 } = req.query

    // STEP 3: Validate channel ID is provided
    if (!channelId) {
        throw new ApiError(400, "Channel Id not provided")
    }

    // STEP 4: Validate channel ID format
    // MongoDB ObjectIds must be 24-character hex strings
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel Id is not valid")
    }

    // STEP 5: Verify channel exists in database
    // Prevents querying subscribers for non-existent or deleted channels
    const existingChannel = await User.findById(channelId)
    if (!existingChannel) {
        throw new ApiError(404, "Channel not found")
    }

    // STEP 6: Build MongoDB Aggregation Pipeline
    // WHY AGGREGATION?
    // We need to:
    // 1. Filter subscriptions for this specific channel
    // 2. Join with User collection to get subscriber details
    // 3. Format the response with only needed fields
    // 4. Sort by subscription date
    // 
    // Aggregation pipelines process data in stages (like Unix pipes)
    const aggregationPipeline = [
        // STAGE 1: $match - Filter subscriptions for this channel only
        // Similar to WHERE clause in SQL
        // Converts channelId string to MongoDB ObjectId for comparison
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },

        // STAGE 2: $lookup - Join with User collection (SQL JOIN equivalent)
        // Fetches complete subscriber information from User collection
        // 
        // How it works:
        // - from: "users" → which collection to join with
        // - localField: "subscriber" → field in subscription document
        // - foreignField: "_id" → matching field in users collection
        // - as: "subscriberDetails" → name for the joined data array
        {
            $lookup: {
                from: "users",              // Collection name (lowercase, pluralized)
                localField: "subscriber",   // subscription.subscriber (ObjectId)
                foreignField: "_id",        // users._id (ObjectId)
                as: "subscriberDetails"     // Output array with matched user docs
            }
        },

        // STAGE 3: $unwind - Convert array to object
        // $lookup returns an array even for single matches
        // $unwind deconstructs the array to make each subscriber a separate document
        // 
        // Before: { subscriberDetails: [{ username: "john", ... }] }
        // After:  { subscriberDetails: { username: "john", ... } }
        {
            $unwind: "$subscriberDetails"
        },

        // STAGE 4: $project - Select specific fields to return
        // Controls which fields appear in final output (like SQL SELECT)
        // Value "1" means include the field, "0" would exclude it
        // 
        // Why project?
        // - Reduces data transfer (only send needed fields)
        // - Hides sensitive information (passwords, tokens, etc.)
        // - Improves frontend performance (less data to parse)
        {
            $project: {
                "subscriberDetails._id": 1,          // Subscriber's user ID
                "subscriberDetails.username": 1,     // Subscriber's username
                "subscriberDetails.fullName": 1,     // Subscriber's full name
                "subscriberDetails.avatar": 1,       // Subscriber's profile picture
                "subscribedAt": "$createdAt",        // When they subscribed (renamed)
                "_id": 1                             // Subscription document ID
            }
        },

        // STAGE 5: $sort - Order results by subscription date
        // -1 = descending order (newest first)
        // +1 = ascending order (oldest first)
        // 
        // Shows most recent subscribers at the top of the list
        {
            $sort: {
                subscribedAt: -1    // Newest subscriptions first
            }
        }
    ]

    // STEP 7: Create aggregation cursor
    // Doesn't execute yet - just prepares the pipeline
    const aggregate = subscription.aggregate(aggregationPipeline)

    // STEP 8: Configure pagination options
    // Uses mongoose-aggregate-paginate-v2 plugin
    const options = {
        page: parseInt(page),       // Convert string to number
        limit: parseInt(limit),     // Convert string to number
        customLabels: {
            docs: "subscribers",            // Rename 'docs' to 'subscribers'
            totalDocs: "totalSubscribers"   // Rename 'totalDocs' to 'totalSubscribers'
        }
    }

    // STEP 9: Execute paginated aggregation query
    // Returns object with:
    // - subscribers: array of subscriber documents
    // - totalSubscribers: total count across all pages
    // - page: current page number
    // - totalPages: number of pages available
    // - hasNextPage, hasPrevPage: navigation helpers
    const result = await subscription.aggregatePaginate(aggregate, options)

    // STEP 10: Send success response with subscriber data
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                "Channel subscribers fetched successfully"
            )
        )
})

/**
 * GET SUBSCRIBED CHANNELS CONTROLLER
 * Retrieves paginated list of channels that a user has subscribed to
 * 
 * Purpose:
 * - Display all channels a user is following
 * - Show channel details (username, avatar, full name)
 * - Support pagination for users following many channels
 * - Sort by most recent subscriptions first
 * 
 * Use Cases:
 * - User's "Subscriptions" page showing all channels they follow
 * - Creating a personalized feed from subscribed channels
 * - Managing subscription list (unsubscribe, view channel)
 * - Analytics showing subscription preferences
 * 
 * Features:
 * - Pagination (default: 10 channels per page)
 * - Sorted by subscription date (newest first)
 * - Includes channel profile information
 * - Returns total subscribed channel count
 * 
 * Difference from getUserChannelSubscribers:
 * - getUserChannelSubscribers: Shows WHO subscribed to a channel
 * - getSubscribedChannels: Shows WHICH channels a user subscribed to
 * 
 * Process Flow:
 * 1. Extract user ID from authenticated request
 * 2. Parse pagination parameters
 * 3. Validate user ID
 * 4. Build aggregation pipeline to fetch channel details
 * 5. Execute paginated query
 * 6. Return formatted channel list with metadata
 * 
 * @route GET /api/v1/subscriptions/u/:userId/subscribed
 * @access Private (user can see their own subscriptions)
 * @query {number} page - Page number for pagination (default: 1)
 * @query {number} limit - Number of channels per page (default: 10)
 * @returns {Object} ApiResponse with paginated subscribed channels list
 */
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // STEP 1: Extract user ID from authenticated request
    // Comes from auth middleware which validates and attaches user to request
    const userId = req.user._id

    // STEP 2: Extract pagination parameters from query string
    // Default values: page 1, 10 channels per page
    // Example: /api/v1/subscriptions/subscribed?page=2&limit=15
    const { page = 1, limit = 10 } = req.query

    // STEP 3: Validate user ID exists
    // This should always pass due to auth middleware, but we check for safety
    if (!userId) {
        throw new ApiError(400, "User Id not provided")
    }

    // STEP 4: Validate user ID format
    // Ensures it's a valid MongoDB ObjectId (24-character hex string)
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Provide a valid UserId")
    }

    // STEP 5: Build MongoDB Aggregation Pipeline
    // WHY AGGREGATION?
    // We need to:
    // 1. Filter subscriptions where this user is the subscriber
    // 2. Join with User collection to get CHANNEL details (not subscriber details)
    // 3. Format the response with only needed fields
    // 4. Sort by subscription date
    // 
    // Think of it as: "Find all channels THIS user has subscribed to"
    const aggregationPipeline = [
        // STAGE 1: $match - Filter subscriptions where user is the subscriber
        // Finds all subscription documents where subscriber field = userId
        // This gives us all channels the user has subscribed to
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(userId)
            }
        },

        // STAGE 2: $lookup - Join with User collection to get channel details
        // IMPORTANT FIX: We join on "channel" field, not "subscriber"
        // 
        // Logic:
        // - We have subscription docs with channel IDs (the channels user subscribed to)
        // - We need to fetch details of those channels from User collection
        // - localField: "channel" → the channel ID in subscription document
        // - foreignField: "_id" → the user ID in users collection
        // 
        // Why "users" collection? Because channels ARE users in this system
        {
            $lookup: {
                from: "users",                      // Collection to join with
                localField: "channel",              // subscription.channel (the channel user subscribed to)
                foreignField: "_id",                // users._id (the channel's user account)
                as: "subscribedChannelDetails"      // Output array with channel info
            }
        },

        // STAGE 3: $unwind - Convert array to object
        // $lookup returns array even for single match
        // $unwind deconstructs it into individual documents
        // 
        // Before: { subscribedChannelDetails: [{ username: "techChannel", ... }] }
        // After:  { subscribedChannelDetails: { username: "techChannel", ... } }
        {
            $unwind: "$subscribedChannelDetails"
        },

        // STAGE 4: $project - Select specific fields to return
        // Controls which fields appear in response (security & performance)
        // 
        // Field selection:
        // - Channel username, avatar, fullName for display
        // - subscribedAt timestamp to show when user subscribed
        // - Excludes sensitive data (email, password, tokens)
        {
            $project: {
                "subscribedChannelDetails._id": 1,        // Channel's user ID
                "subscribedChannelDetails.username": 1,   // Channel's username
                "subscribedChannelDetails.avatar": 1,     // Channel's profile picture
                "subscribedChannelDetails.fullName": 1,   // Channel's full name
                "subscribedAt": "$createdAt",             // When user subscribed (renamed from createdAt)
                "_id": 1                                  // Subscription document ID
            }
        },

        // STAGE 5: $sort - Order by subscription date
        // -1 = descending (newest subscriptions first)
        // This shows recently subscribed channels at the top
        {
            $sort: {
                subscribedAt: -1    // Most recent subscriptions appear first
            }
        }
    ]

    // STEP 6: Create aggregation cursor
    // Prepares the pipeline but doesn't execute yet
    const aggregate = subscription.aggregate(aggregationPipeline)

    // STEP 7: Configure pagination options
    // Uses mongoose-aggregate-paginate-v2 plugin for automatic pagination
    const options = {
        page: parseInt(page),       // Current page number (convert string to number)
        limit: parseInt(limit),     // Items per page (convert string to number)
        customLabels: {
            docs: "subscribedChannels",         // Rename default 'docs' field
            totalDocs: "totalSubscribedChannels" // Rename default 'totalDocs' field
        }
    }

    // STEP 8: Execute paginated aggregation query
    // Returns comprehensive pagination object:
    // {
    //   subscribedChannels: [...],      // Array of channel documents
    //   totalSubscribedChannels: 45,    // Total count across all pages
    //   page: 1,                        // Current page
    //   totalPages: 5,                  // Total pages available
    //   hasNextPage: true,              // Boolean for navigation
    //   hasPrevPage: false,             // Boolean for navigation
    //   nextPage: 2,                    // Next page number (if exists)
    //   prevPage: null                  // Previous page number (if exists)
    // }
    const result = await subscription.aggregatePaginate(aggregate, options)

    // STEP 9: Send success response with subscribed channels data
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                "Subscribed channels fetched successfully"
            )
        )
})





// ============================================
// EXPORT CONTROLLERS
// ============================================
// All subscription-related controller functions are exported here
// These handlers manage the complete subscription lifecycle in the application

export {
    // Toggle subscribe/unsubscribe for a channel
    // Used when user clicks subscribe/unsubscribe button
    toggleSubscription,

    // Get list of subscribers for a specific channel
    // Used to display "Subscribers" list on channel page
    getUserChannelSubscribers,

    // Get list of channels that a user has subscribed to
    // Used to display user's "Subscriptions" or "Following" page
    getSubscribedChannels,
}


