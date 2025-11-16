// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { comment } from "../models/comment.model.js"
import { video } from "../models/video.model.js"
import mongoose from "mongoose"

/**
 * @desc    Add a comment to a video
 * @route   POST /api/v1/comments
 * @access  Private
 */
const addComment = asyncHandler(async (req, res) => {
    const { content, videoId } = req.body

    // Validate comment content (1-500 characters)
    if (!content || content.trim() === "") {
        console.log("Comment not Provided")
        throw new ApiError(400, "Comment not Provided")
    }

    if (content.trim().length < 1) {
        console.log("comment cannot be empty")
        throw new ApiError(400, "Comment cannot be empty")
    }

    if (content.trim().length > 500) {
        console.log("Comment is longer than 500 characters")
        throw new ApiError(400, "Comment cannot be longer than 500 characters")
    }

    // Validate video ID format
    if (!videoId) {
        console.log("Video Id for commenting not Provided")
        throw new ApiError(400, "Video ID for commenting not provided")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        console.log("Invalid Video ID provided for commenting")
        throw new ApiError(400, "Video ID for commenting not provided")
    }

    console.log(" Comment recevied: ", { content, videoId })

    // Check if video exists and is published
    const videoExists = await video.findById(videoId)
    if (!videoExists) {
        console.log("video does not exists for commenting")
        throw new ApiError(404, "video not found")
    }

    if (!videoExists.isPublished) {
        console.log("Video is unpublished")
        throw new ApiError(403, "cannot comment on a unpublished video")
    }

    // Create comment document
    const newComment = await comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id,
        likes: 0,
        parentComment: null, // Top-level comment
    })

    if (!newComment) {
        console.log("failed to create new comment object")
        throw new ApiError(500, "Failed to create a comment")
    }

    // Fetch created comment with owner details
    const createdComment = await comment
        .findById(newComment._id)
        .populate("owner", "username fullname avatar")

    return res
        .status(201)
        .json(new ApiResponse(201, createdComment, "comment added sucessfully"))
})

const getAllComment = asyncHandler(async (req, res) => {
    // okay first of all we will get the video id from the req url and validate it
    const { videoId } = req.params
    console.log("fetching comments for the video: ", videoId)

    // okay now lets set the partaamters how much comments do we want to extract per page
    // for that  lets make an object which has all the parameters by default
    const { page = 1, limit = 10 } = req.query

    console.log("pagination: ", { page, limit })

    // now lets find that video and befre that validate the vidoe id
    if (!videoId) {
        console.log("Video ID is not Provided")
        throw new ApiError(400, "Video Id is required")
    }
    if (!mongoose.isValidObjectId(videoId)) {
        console.log("Invalid Video ID")
        throw new ApiError(400, "Invalid Video ID format")
    }
    // now check if that video exists or not
    const videoExists = await video.findById(videoId)
    if (!videoExists) {
        console.log("Video not Found")
        throw new ApiError(404, "Video Not Found")
    }
    console.log("Video exists: ", videoExists.title)

    // okay now we will use the aggregation pipleline for filtering comments and populate the owner details of comment with their id and sort also...basically doing multiple operations together

    const aggregate = comment.aggregate([
        // first of all we will match the comments ar efor this video na
        {
            $match: {
                // what it does is show me the only comments not replies of that video
                video: new mongoose.Types.ObjectId(videoId),
                parentComment: null,
            },
        },
        {
            // now for each comment go fetch the user who wrote it
            $lookup: {
                from: "users",
                localField: "onwer", // from here we will match
                foreignField: "_id", // and to here we will match
                as: "ownerDetails",
            },
        },

        // now we will convert the ownerDetials array to a object
        {
            $unwind: "$onwerDetails",
        },

        // now in the final we will format the output as we want means only shows this fields and hide everything
        {
            $project: {
                content: 1,
                likes: 1,
                createdAt: 1,
                updateAt: 1,
                "ownerDetails.username": 1,
                "ownerDetails.fullName": 1,
                "ownerDetails.avatar": 1,
            },
        },
        // now just sort our comments innewest first (optional)
        {
            $sort: { createdAt: -1 }, // means in the descednign order
        },
    ])
    console.log("🔧 Aggregation pipeline built")

    // now we have to do the pagination so first configure the global options
    const options = {
        page: parseInt(page), // this tells at which page number we are
        limit: parseInt(limit), // this tells how many items are their per page
        // then we have to rename our docs to comments and totaldocs to total comments
        docs: "comments",
        totalDocs: "totalComments",
    }
    // now we will give this request to mongoDB and it will aggregate all the things based on our need and return it
    const comments = await comment.aggregatePaginate(aggregate, options)
    console.log(`✅ Found ${comments.totalComments} total comments`)
    console.log(`📄 Returning page ${comments.page} of ${comments.totalPages}`)

    // then after getting the comments we just return it
    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

export {
    addComment, // this fucntion adds comment
    getAllComment, // this function gets all the comment froma a particular video
}
