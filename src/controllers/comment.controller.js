// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { comment } from "../models/comment.model.js";
import { video } from "../models/video.model.js";
import mongoose from "mongoose";

/**
 * @desc    Add a comment to a video
 * @route   POST /api/v1/comments
 * @access  Private (Authenticated users only)
 */
const addComment=asyncHandler(async (req,res)=>{
    // Extract comment content and target video ID from request body
    const {content,videoId}=req.body

    // Validate comment content
    // Check if content exists and is not empty after trimming whitespace
    if(!content || content.trim()===""){
        console.log("Comment not Provided")
        throw new ApiError(400,"Comment not Provided")
    }
    
    // Ensure comment has at least 1 character
    if(content.trim().length<1){
        console.log("comment cannot be empty")
        throw new ApiError(400,"Comment cannot be empty")
    }
    
    // Enforce maximum comment length of 500 characters
    if(content.trim().length>500){
        console.log("Comment is longer than 500 characters")
        throw new ApiError(400,"Comment cannot be longer than 500 characters")
    }

    // Validate video ID
    // Check if videoId is provided in the request
    if(!videoId){
        console.log("Video Id for commenting not Provided")
        throw new ApiError(400,"Video ID for commenting not provided")
    }
    
    // Verify that the provided videoId is a valid MongoDB ObjectId
    if(!mongoose.isValidObjectId(videoId)){
        console.log("Invalid Video ID provided for commenting")
        throw new ApiError(400,"Video ID for commenting not provided")
    }

    // Log received comment data for debugging purposes
    console.log(" Comment recevied: ",{content,videoId})

    // Verify video existence and publication status
    // Fetch the video from database to ensure it exists
    const videoExists=await video.findById(videoId)
    if(!videoExists){
        console.log("video does not exists for commenting")
        throw new ApiError(404,"video not found")
    }
    
    // Prevent comments on unpublished videos (only published videos can be commented on)
    if(!videoExists.isPublished){
        console.log("Video is unpublished")
        throw new ApiError(403,"cannot comment on a unpublished video")
    }

    // Create new comment document in database
    // Store comment with content, associated video, owner (authenticated user), and initial metadata
    const newComment=await comment.create({
        content:content.trim(),
        video:videoId,
        owner:req.user._id,  // User ID from authentication middleware
        likes:0,              // Initialize with zero likes
        parentComment:null    // Top-level comment (not a reply)
        
    })
    
    // Validate successful comment creation
    if(!newComment){
        console.log("failed to create new comment object")
        throw new ApiError(500,"Failed to create a comment")
    }

    // Fetch the created comment with populated user details
    // Populate owner field with username, fullname, and avatar for the response
    const createdComment=await comment.findById(newComment._id).populate("owner","username fullname avatar")

    // Send success response with created comment data
    return res  
        .status(201)
        .json(
            new ApiResponse(
                201,
                createdComment,
                "comment added sucessfully"
            )
        )



})







export { 
    addComment, // this fucntion adds comment

}