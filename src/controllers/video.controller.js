// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler";  // Wrapper to handle async errors automatically
import { ApiError } from "../utils/ApiError";          // Custom error class for consistent error handling
import { ApiResponse } from "../utils/ApiResponse";    // Custom response class for consistent API responses
import { uploadOnCloudinary } from "../utils/cloudnary"; // Utility function to upload files to Cloudinary
import {video} from "../models/video.model.js"         // Video model for MongoDB operations
import mongoose from "mongoose";                        // MongoDB object modeling tool

// ============================================
// VIDEO UPLOAD CONTROLLER FUNCTION
// ============================================

/**
 * UPLOAD VIDEO FUNCTIONALITY
 * 
 * This controller handles the complete video upload process including:
 * 1. Receiving video metadata (title, description, category, tags) from client
 * 2. Validating all required fields
 * 3. Getting video and thumbnail files from Multer middleware
 * 4. Uploading both files to Cloudinary cloud storage
 * 5. Extracting video metadata (duration) from Cloudinary response
 * 6. Saving video details to MongoDB database
 * 7. Returning the uploaded video with owner information
 * 
 * @route POST /api/v1/videos
 * @access Protected - Requires authentication (verifyJWT middleware)
 * @param {Object} req.body - Contains title, description, category, tags
 * @param {Object} req.files - Contains video and thumbnail files from Multer
 * @param {Object} req.user - User object attached by verifyJWT middleware
 * @returns {Object} - ApiResponse with uploaded video details
 */
const uploadVideo=asyncHandler(async (req,res)=>{
    
    // ============================================
    // STEP 1: EXTRACT VIDEO DETAILS FROM REQUEST BODY
    // ============================================
    // The client sends video metadata through req.body (JSON data)
    // These fields come from the form submitted by the user
    const {title,description,category,tags}=req.body

    // ============================================
    // DEBUGGING: LOG RECEIVED DATA
    // ============================================
    // Helpful for debugging - shows what data we received from client
    // Can be removed in production or kept for logging purposes
    console.log("received: ",{title,description,tags,category})

    // ============================================
    // STEP 2: VALIDATE REQUIRED FIELDS
    // ============================================
    
    // VALIDATION 1: Check if title is provided and not empty
    // Title is required for every video to identify it
    // .trim() removes whitespace from start and end
    if(!title || title.trim()===""){
        throw new ApiError(400,"Title not found")  // 400 = Bad Request (client error)
    }
    
    // VALIDATION 2: Check if category is provided and not empty
    // Category helps in organizing and filtering videos
    if(!category || category.trim()===""){
        throw new ApiError(400,"category is required")
    }

    // ============================================
    // STEP 3: GET UPLOADED FILES FROM MULTER
    // ============================================
    
    // Multer middleware processes file uploads and stores them temporarily
    // Files are stored in req.files object with field names as keys
    // Each field contains an array of files (even if only one file)
    
    // GETTING VIDEO FILE PATH:
    // req.files.video - Array of files uploaded with field name "video"
    // [0] - Get the first (and only) file from the array
    // .path - Local file path where Multer temporarily saved the file (e.g., "public/temp/video.mp4")
    // ?. - Optional chaining: prevents error if any property is undefined
    const videoFileLocalPath=req.files?.video?.[0]?.path

    // GETTING THUMBNAIL FILE PATH:
    // Same process as video file, but for the thumbnail image
    const thumbnailFileLocalPath=req.files?.thumbnail?.[0]?.path

    // ============================================
    // STEP 4: VALIDATE FILE UPLOADS
    // ============================================
    
    // VALIDATION 3: Check if video file was uploaded
    // If Multer didn't receive a video file, the path will be undefined
    if(!videoFileLocalPath){
        throw new ApiError(400,"Video file is required")
    }
    
    // VALIDATION 4: Check if thumbnail file was uploaded
    // Thumbnail is needed for video preview in the UI
    if(!thumbnailFileLocalPath){
        throw new ApiError(400,"Thumbnail file is required")
    }

    // ============================================
    // STEP 5: UPLOAD VIDEO TO CLOUDINARY
    // ============================================
    
    // uploadOnCloudinary() is our utility function that:
    // 1. Uploads the file from local path to Cloudinary cloud storage
    // 2. Returns response with file URL, duration, format, public_id, etc.
    // 3. Automatically deletes the local file after successful upload (cleanup)
    // 4. Returns null if upload fails
    
    // UPLOAD VIDEO FILE:
    // Pass the local file path to upload it to Cloudinary
    // Cloudinary automatically detects file type (video) and processes it
    const videoFile=await uploadOnCloudinary(videoFileLocalPath)  // IMPORTANT: Missing 'await' here!

    // VALIDATION 5: Check if video upload to Cloudinary was successful
    if(!videoFile){
        throw new ApiError(500,"video upload to cloudinary failed")  // 500 = Server Error
    }

    // ============================================
    // STEP 6: UPLOAD THUMBNAIL TO CLOUDINARY
    // ============================================
    
    // UPLOAD THUMBNAIL FILE:
    // Same process as video - upload thumbnail image to Cloudinary
    const thumbnailFile=await uploadOnCloudinary(thumbnailFileLocalPath)  // IMPORTANT: Missing 'await' here!
    
    // VALIDATION 6: Check if thumbnail upload to Cloudinary was successful
    if(!thumbnailFile){
        throw new ApiError(500,"thumbnail upload to cloudinary failed")
    }

    // ============================================
    // SUCCESS LOGS: Display Cloudinary URLs
    // ============================================
    // After successful upload, Cloudinary returns permanent URLs
    // These URLs are used to access the files from anywhere
    console.log("Video URL: ",videoFile.url)
    console.log("thumbnail URL: ",thumbnailFile.url)

    // ============================================
    // STEP 7: EXTRACT VIDEO METADATA
    // ============================================
    
    // Cloudinary automatically analyzes video files and extracts metadata
    // For video files, it provides: duration, format, width, height, bitrate, etc.
    // duration is in seconds (e.g., 125.5 seconds = 2 minutes 5.5 seconds)
    const duration = videoFile.duration || 0  // Default to 0 if not available

    // ============================================
    // STEP 8: SAVE VIDEO DETAILS TO MONGODB
    // ============================================
    
    // Using .create() method to create and save a new video document in one step
    // .create() automatically:
    // 1. Creates a new document with provided data
    // 2. Validates against the schema (required fields, data types, etc.)
    // 3. Saves to database
    // 4. Returns the created document
    
    // Alternative: Use new video() + save() if you need to manipulate data before saving
    const newVideo=await video.create({
        videoFile:videoFile.url,              // Cloudinary URL for video file
        thumbNail:thumbnailFile.url,          // Cloudinary URL for thumbnail (NOTE: Schema uses 'thumbNail', not 'thumbnailFile')
        title:title.trim(),                   // Remove extra whitespace from title
        description:description?.trim(),      // Optional field - trim only if provided
        duration:duration,                    // Video duration in seconds from Cloudinary
        owner:req.user._id,                   // User ID from authenticated user (set by verifyJWT middleware)
        category:category.trim(),             // Video category (e.g., "Education", "Entertainment")
        tags:tags?.trim() || "",              // Optional tags - default to empty string if not provided
        isPublished:true,                     // Video is published by default (visible to public)
        views:0,                              // Initial view count is 0
        likes:0,                              // Initial likes count is 0
        dislikes:0,                           // Initial dislikes count is 0
    })

    // ============================================
    // VALIDATION 7: Check if database save was successful
    // ============================================
    if(!newVideo){
        throw new ApiError(500,"video upload and its details to mongoDB failed")
    }

    // ============================================
    // STEP 9: FETCH COMPLETE VIDEO WITH OWNER DETAILS
    // ============================================
    
    // Although we just created the video, we fetch it again to:
    // 1. Get the complete document with all default values
    // 2. Populate the owner field with user details instead of just the ID
    // 3. Ensure the data matches what's actually stored in the database
    
    // .populate() replaces the owner ObjectId with actual user data
    // First parameter: field name to populate ("owner")
    // Second parameter: which fields to include from User model
    const uploadedVideo=await video.findById(newVideo._id).populate(
        "owner",                              // Field to populate
        "username fullName avatar"            // Only include these user fields (not password, email, etc.)
    )

    // ============================================
    // STEP 10: SEND SUCCESS RESPONSE TO CLIENT
    // ============================================
    
    // Return HTTP 201 (Created) status with the video data
    // ApiResponse provides consistent response format:
    // {
    //   statusCode: 201,
    //   data: uploadedVideo,
    //   message: "video uploaded successfully",
    //   success: true
    // }
    return res
        .status(201)                          // 201 = Created (new resource successfully created)
        .json(
            new ApiResponse(
                201,                          // Status code
                uploadedVideo,                // Video data with owner details
                "video uploaded successfully" // Success message
            )
        )
})

// ============================================
// EXPORT CONTROLLER
// ============================================
// Export the uploadVideo function so it can be used in routes


export {uploadVideo}


