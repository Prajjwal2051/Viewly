import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js"

/**
 * CREATE TWEET / PHOTO POST CONTROLLER
 * Allows authenticated users to create a new photo post
 *
 * Features:
 * - Image Upload: Handles file upload via Cloudinary
 * - Validation: Ensures Image is provided (mandatory for photo posts)
 * - Metadata: Associates post with current user
 *
 * @route POST /api/v1/tweets
 * @access Private
 */
const createTweet = asyncHandler(async (req, res) => {
    console.log("\n" + "=".repeat(60))
    console.log("📸 CREATE TWEET/PHOTO POST REQUEST")
    console.log("=".repeat(60))

    // STEP 1: Extract content from request body
    const { content } = req.body
    console.log("\n[STEP 1] 📝 Extracting Data")
    console.log("   ➜ Content:", content || "(no caption)")

    // Validate: content is required
    if (!content || content.trim() === "") {
        console.log("   ❌ Validation Failed: Content is required")
        throw new ApiError(400, "Tweet content is required")
    }

    // STEP 2: Check for image file (OPTIONAL for tweets)
    const imageLocalPath = req.file?.path
    console.log(
        "   ➜ Image File:",
        imageLocalPath ? "Provided" : "Not provided (optional)"
    )

    let imageUrl = null
    if (imageLocalPath) {
        console.log("\n[STEP 2] ☁️ Uploading Image to Cloudinary")
        const image = await uploadOnCloudinary(imageLocalPath)

        if (!image) {
            console.log("   ❌ Cloudinary Upload Failed")
            throw new ApiError(500, "Failed to upload image")
        }
        imageUrl = image.url
        console.log("   ✓ Image Uploaded:", imageUrl)
    } else {
        console.log("\n[STEP 2] ⏭️ Skipping image upload (no image provided)")
    }

    console.log("\n[STEP 3] 💾 Saving Tweet to Database")
    const tweet = await Tweet.create({
        content: content,
        image: imageUrl, // Will be null if no image
        owner: req.user?._id,
        likes: 0, // Initialize likes count
    })

    if (!tweet) {
        console.log("   ❌ DB Creation Failed")
        throw new ApiError(500, "Failed to create tweet")
    }

    console.log("   ✓ Tweet Created ID:", tweet._id)
    console.log("=".repeat(60) + "\n")

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet created successfully"))
})

/**
 * GET USER TWEETS CONTROLLER
 * Fetches all tweets/photos created by a specific user
 *
 * Features:
 * - Aggregation: Joins with User collection for owner details
 * - Sorting: Newest first
 *
 * @route GET /api/v1/tweets/user/:userId
 * @access Public/Private
 */
const getUserTweets = asyncHandler(async (req, res) => {
    console.log("\n" + "=".repeat(60))
    console.log("👤 GET USER TWEETS REQUEST")
    console.log("=".repeat(60))

    const { userId } = req.params
    console.log("   ➜ Target User ID:", userId)

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    console.log("\n[STEP 1] 🔍 Aggregating Tweets")
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$ownerDetails",
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
    ])

    console.log(`   ✓ Found ${tweets.length} tweets`)
    console.log("=".repeat(60) + "\n")

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"))
})

/**
 * GET ALL TWEETS CONTROLLER (FEED)
 * Fetches all tweets from all users for the community feed
 *
 * Features:
 * - Global Feed: Returns latest photos from the community
 * - Sorting: Newest first
 *
 * @route GET /api/v1/tweets
 * @access Public
 */
const getAllTweets = asyncHandler(async (req, res) => {
    console.log("\n" + "=".repeat(60))
    console.log("🌍 GET ALL TWEETS (FEED) REQUEST")
    console.log("=".repeat(60))

    const tweets = await Tweet.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$ownerDetails",
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
    ])

    console.log(`   ✓ Fetched ${tweets.length} community posts`)

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "All tweets fetched successfully"))
})

/**
 * UPDATE TWEET CONTROLLER
 * Allows owner to edit the caption of their tweet
 *
 * @route PATCH /api/v1/tweets/:tweetId
 * @access Private (Owner only)
 */
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            },
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
})

/**
 * DELETE TWEET CONTROLLER
 * Allows owner to delete their tweet
 *
 * @route DELETE /api/v1/tweets/:tweetId
 * @access Private (Owner only)
 */
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this tweet")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet deleted successfully"))
})

/**
 * GET TWEET BY ID CONTROLLER
 * Fetches a single tweet/photo by its ID
 *
 * @route GET /api/v1/tweets/:tweetId
 * @access Public/Private
 */
const getTweetById = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(tweetId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            email: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$ownerDetails",
        },
    ])

    if (!tweet?.length) {
        throw new ApiError(404, "Tweet not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet[0], "Tweet fetched successfully"))
})

export {
    createTweet,
    getUserTweets,
    getAllTweets,
    getTweetById, // New export
    updateTweet,
    deleteTweet,
}
