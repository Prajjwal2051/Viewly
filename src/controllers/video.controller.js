// ============================================
// DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, getPublicId, deleteFromCloudinary } from "../utils/cloudnary.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

// ============================================
// CONTROLLERS
// ============================================

/**
 * Upload Video Controller
 * 
 * Handles complete video upload workflow including file upload to Cloudinary
 * and saving metadata to MongoDB.
 * 
 * @route   POST /api/v1/videos
 * @access  Protected (requires authentication)
 * @body    {string} title - Video title (required)
 * @body    {string} description - Video description (optional)
 * @body    {string} category - Video category (required)
 * @body    {string} tags - Comma-separated tags (optional)
 * @files   video - Video file (required)
 * @files   thumbnail - Thumbnail image (required)
 * @returns {Object} ApiResponse with uploaded video details
 */
const uploadVideo = asyncHandler(async (req, res) => {
    // Extract video metadata from request body
    const { title, description, category, tags } = req.body;
    console.log("📹 [VIDEO UPLOAD] Request received");
    console.log("📝 Metadata:", { title, category, tags: tags || "none", description: description ? "provided" : "none" });

    // Validate required fields (title and category are mandatory)
    if (!title || title.trim() === "") {
        throw new ApiError(400, "Title is required");
    }
    if (!category || category.trim() === "") {
        throw new ApiError(400, "Category is required");
    }

    // Get file paths from Multer middleware (files stored temporarily)
    const videoFileLocalPath = req.files?.video?.[0]?.path;
    const thumbnailFileLocalPath = req.files?.thumbnail?.[0]?.path;

    // Validate that both files were uploaded
    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
    if (!thumbnailFileLocalPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }
    console.log("📂 Files received - Video & Thumbnail ready for upload");

    // Upload files to Cloudinary and get URLs
    console.log("☁️  Uploading video to Cloudinary...");
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    if (!videoFile) {
        throw new ApiError(500, "Video upload to Cloudinary failed");
    }
    console.log("✅ Video uploaded successfully");

    console.log("☁️  Uploading thumbnail to Cloudinary...");
    const thumbnailFile = await uploadOnCloudinary(thumbnailFileLocalPath);
    if (!thumbnailFile) {
        throw new ApiError(500, "Thumbnail upload to Cloudinary failed");
    }
    console.log("✅ Thumbnail uploaded successfully");

    // Extract video duration from Cloudinary response (in seconds)
    const duration = videoFile.duration || 0;
    console.log(`⏱️  Video duration: ${duration} seconds`);

    // Create video document in MongoDB with all metadata
    console.log("💾 Saving video to database...");
    const newVideo = await Video.create({
        videoFile: videoFile.url,
        thumbNail: thumbnailFile.url,
        title: title.trim(),
        description: description?.trim(),
        duration: duration,
        owner: req.user._id,        // From auth middleware
        category: category.trim(),
        tags: tags?.trim() || "",
        isPublished: true,
        views: 0,
        likes: 0,
        dislikes: 0,
    });

    if (!newVideo) {
        throw new ApiError(500, "Failed to save video to database");
    }

    // Fetch created video with populated owner details for response
    const uploadedVideo = await Video.findById(newVideo._id).populate(
        "owner",
        "username fullName avatar"
    );

    console.log(`✅ Video "${title}" uploaded successfully by @${req.user.username}`);
    console.log(`🆔 Video ID: ${newVideo._id}`);

    // Send success response
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                uploadedVideo,
                "Video uploaded successfully"
            )
        )
});

/**
 * Get All Videos Controller
 * 
 * Retrieves videos with filtering, sorting, and pagination.
 * Supports category filter, tag search, owner filter, and text search.
 * 
 * @route   GET /api/v1/videos
 * @access  Public
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Videos per page (default: 10)
 * @query   {string} category - Filter by category
 * @query   {string} tags - Filter by tags (case-insensitive)
 * @query   {string} owner - Filter by owner ID
 * @query   {string} search - Search in title and description
 * @query   {string} sortBy - Sort field: views, createdAt, likes (default: createdAt)
 * @query   {string} sortOrder - Sort direction: asc or desc (default: desc)
 * @returns {Object} ApiResponse with paginated video list
 */
const getAllVideos = asyncHandler(async (req, res) => {
    // Extract query parameters with default values
    const {
        page = 1,
        limit = 10,
        category,
        tags,
        owner,
        search,
        sortBy = "createdAt",
        sortOrder = "desc"
    } = req.query;

    console.log("📋 [GET ALL VIDEOS] Request received");
    console.log("📄 Pagination:", { page, limit });
    
    // Build filter object (only show published videos by default)
    const filter = { isPublished: true };
    const appliedFilters = [];

    // Add category filter if provided
    if (category) {
        filter.category = category;
        appliedFilters.push(`category: ${category}`);
    }

    // Add tags filter with case-insensitive regex search
    if (tags) {
        filter.tags = { $regex: tags, $options: 'i' };
        appliedFilters.push(`tags: ${tags}`);
    }

    // Add owner filter with ID validation
    if (owner) {
        if (!mongoose.isValidObjectId(owner)) {
            throw new ApiError(400, "Invalid Owner ID");
        }
        filter.owner = owner;
        appliedFilters.push(`owner: ${owner}`);
    }

    // Add search filter for title and description
    // $or matches if either condition is true
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
        appliedFilters.push(`search: "${search}"`);
    }

    console.log(`🔍 Filters applied: ${appliedFilters.length > 0 ? appliedFilters.join(', ') : 'none'}`);

    // Build sort object (1 = ascending, -1 = descending)
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    console.log(`🔄 Sorting by: ${sortBy} (${sortOrder})`);

    // Get videos from database with filters, sorting, and pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    console.log("💾 Fetching videos from database...");
    // Find videos with filters, sort, and pagination
    const videos = await Video.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .populate('owner', 'username fullName avatar');

    // Get total count for pagination metadata
    const totalVideos = await Video.countDocuments(filter);
    const totalPages = Math.ceil(totalVideos / limitNumber);

    console.log(`✅ Retrieved ${videos.length} videos (Total: ${totalVideos}, Page: ${pageNumber}/${totalPages})`);

    // Build response with pagination metadata
    const response = {
        videos: videos,
        pagination: {
            currentPage: pageNumber,
            totalPages: totalPages,
            totalVideos: totalVideos,
            videosPerPage: limitNumber,
            hasNextPage: pageNumber < totalPages,
            hasPrevPage: pageNumber > 1
        }
    };

    // Return success response
    return res
        .status(200)
        .json(
            new ApiResponse(200, response, `Successfully retrieved ${videos.length} videos`)
        );
});

/**
 * Get Video By ID Controller
 * 
 * Retrieves a single video by its ID, populates owner information,
 * and increments the view count.
 * 
 * @route   GET /api/v1/videos/:videoId
 * @access  Public
 * @param   {string} videoId - MongoDB ObjectId of the video
 * @returns {Object} ApiResponse with video details and owner info
 */
const getVideoById = asyncHandler(async (req, res) => {
    // Extract video ID from URL parameters
    const { videoId } = req.params;
    console.log(`🎬 [GET VIDEO BY ID] Request for video: ${videoId}`);

    // Check if video ID is provided
    if (!videoId) {
        throw new ApiError(500, "Video Not found !!!")
    }

    // Validate if it's a valid MongoDB ObjectId format
    if (!mongoose.isValidObjectId(videoId)) {
        console.log("❌ Invalid ObjectId format");
        throw new ApiError(400, "Invalid object ID")
    }

    console.log("💾 Fetching video from database...");
    // Find video by ID and populate owner details
    const foundVideo = await Video.findById(videoId).populate('owner', 'username fullName avatar');

    // Check if video exists
    if (!foundVideo) {
        console.log("❌ Video not found in database");
        throw new ApiError(404, "Video not found")
    }

    console.log(`✅ Found video: "${foundVideo.title}"`);

    // Check if video is private (only owner can access unpublished videos)
    if (!foundVideo.isPublished && foundVideo.owner._id.toString() !== req.user?._id.toString()) {
        console.log("🔒 Unpublished video - access denied");
        throw new ApiError(403, "This video is private");
    }

    console.log("👁️  Incrementing view count...");
    // Increment view count using $inc operator and return updated video
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },  // Increment views by 1
        { new: true }            // Return updated document
    ).populate('owner', 'username fullName avatar')

    console.log(`✅ Video retrieved successfully (Views: ${updatedVideo.views})`);

    // Send success response with video data
    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video fetched successfully"
        )
    )
})

/**
 * Update Video Controller
 * 
 * Allows video owner to update title, description, and/or thumbnail.
 * Old thumbnail is automatically deleted from Cloudinary when replaced.
 * 
 * @route   PATCH /api/v1/videos/:videoId
 * @access  Protected (owner only)
 * @param   {string} videoId - MongoDB ObjectId of the video
 * @body    {string} title - New video title (optional)
 * @body    {string} description - New description (optional)
 * @file    thumbnail - New thumbnail image (optional)
 * @returns {Object} ApiResponse with updated video details
 */
const updateVideo = asyncHandler(async (req, res) => {
    // Extract video ID from URL and update fields from request
    const { videoId } = req.params
    const { title, description } = req.body 
    const thumbnailFileLocalPath = req.file?.path
    
    console.log(`✏️  [UPDATE VIDEO] Request for video: ${videoId}`);
    console.log(`📝 Fields to update: ${title ? 'title' : ''} ${description !== undefined ? 'description' : ''} ${thumbnailFileLocalPath ? 'thumbnail' : ''}`.trim() || 'none');

    // Validate video ID format
    if (!mongoose.isValidObjectId(videoId)) {
        console.log("❌ Invalid ObjectId format");
        throw new ApiError(400, "Invalid video ID")
    }

    console.log("💾 Fetching video from database...");
    // Find video in database
    const foundVideo = await Video.findById(videoId)

    if (!foundVideo) {
        console.log("❌ Video not found in database");
        throw new ApiError(404, "Video not found")
    }

    console.log(`✅ Found video: "${foundVideo.title}" by @${req.user.username}`);

    // Authorization: Only video owner can update
    // Prevents unauthorized users from modifying others' videos
    if (foundVideo.owner.toString() !== req.user._id.toString()) {
        console.log("🔒 Authorization failed - not the owner");
        throw new ApiError(403, "You are not authorized to update this video")
    }

    // Validation: At least one field must be provided for update
    if (!title && !description && !thumbnailFileLocalPath) {
        throw new ApiError(400, "Provide at least one field: title, description, or thumbnail")
    }

    // Validation: Title cannot be empty string (if provided)
    if (title && title.trim() === "") {
        throw new ApiError(400, "Title cannot be empty")
    }

    // Upload new thumbnail to Cloudinary (if provided)
    let thumbNailUrlFromCloudinary;
    if (thumbnailFileLocalPath) {
        console.log("☁️  Uploading new thumbnail to Cloudinary...");
        const thumbNailFile = await uploadOnCloudinary(thumbnailFileLocalPath)
        if (!thumbNailFile) {
            throw new ApiError(500, "Thumbnail upload failed")
        }
        thumbNailUrlFromCloudinary = thumbNailFile.url
        console.log("✅ New thumbnail uploaded successfully");

        // Delete old thumbnail from Cloudinary to save storage space
        // Extract public_id from old thumbnail URL and delete it
        console.log("🗑️  Deleting old thumbnail from Cloudinary...");
        const oldThumbnailPublicId = await getPublicId(foundVideo.thumbNail)
        if (oldThumbnailPublicId) {
            await deleteFromCloudinary(oldThumbnailPublicId, "image")
            console.log("✅ Old thumbnail deleted successfully");
        }
    }

    // Build update object with only provided fields
    // This allows partial updates (update only what's needed)
    const updateData = {};
    if (title) {
        updateData.title = title.trim()
    }
    if (description !== undefined) {
        updateData.description = description.trim()
    }
    if (thumbNailUrlFromCloudinary) {
        updateData.thumbNail = thumbNailUrlFromCloudinary
    }

    console.log("💾 Updating video in database...");
    // Update video in database with new data
    // $set: updates only specified fields
    // new: true - returns updated document
    // runValidators: true - runs schema validation on update
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate('owner', 'username fullName avatar')

    console.log(`✅ Video "${updatedVideo.title}" updated successfully`);

    // Send success response with updated video
    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedVideo, "Video updated successfully")
        )
})

/**
 * Delete Video Controller
 * 
 * Permanently deletes a video and its associated files (video file and thumbnail)
 * from both Cloudinary storage and MongoDB database.
 * 
 * @route   DELETE /api/v1/videos/:videoId
 * @access  Protected (owner only)
 * @param   {string} videoId - MongoDB ObjectId of the video
 * @returns {Object} ApiResponse with deletion confirmation
 */
const deleteVideo = asyncHandler(async (req, res) => {
    // Extract and validate video ID from URL parameters
    const { videoId } = req.params
    
    console.log(`🗑️  [DELETE VIDEO] Request for video: ${videoId}`);
    
    if (!mongoose.isValidObjectId(videoId)) {
        console.log("❌ Invalid ObjectId format");
        throw new ApiError(400, "Invalid video ID provided for deletion")
    }
    
    console.log("💾 Fetching video from database...");
    // Find video in database
    const foundVideo = await Video.findById(videoId)
    
    if (!foundVideo) {
        console.log("❌ Video not found in database");
        throw new ApiError(404, "Video not found")
    }

    console.log(`✅ Found video: "${foundVideo.title}"`);

    // Authorization: Only video owner can delete
    // Prevents unauthorized users from deleting others' videos
    if (foundVideo.owner.toString() !== req.user._id.toString()) {
        console.log("🔒 Authorization failed - not the owner");
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    // Delete video file from Cloudinary
    // Extract public_id from video URL and delete the file
    console.log("☁️  Deleting video file from Cloudinary...");
    const videoPublicId = await getPublicId(foundVideo.videoFile)
    
    if (videoPublicId) {
        const videoDeleteResult = await deleteFromCloudinary(videoPublicId, "video")
        
        // Check if video deletion was successful
        if (!videoDeleteResult || videoDeleteResult.result !== 'ok') {
            throw new ApiError(500, "Failed to delete video from cloud storage")
        }
        console.log("✅ Video file deleted from Cloudinary");
    }

    // Delete thumbnail from Cloudinary
    // Extract public_id from thumbnail URL and delete the image
    console.log("☁️  Deleting thumbnail from Cloudinary...");
    const thumbNailPublicId = await getPublicId(foundVideo.thumbNail)
    
    if (thumbNailPublicId) {
        const thumbnailDeleteResult = await deleteFromCloudinary(thumbNailPublicId, "image")
        
        // Check if thumbnail deletion was successful
        if (!thumbnailDeleteResult || thumbnailDeleteResult.result !== "ok") {
            throw new ApiError(500, "Failed to delete thumbnail from cloud storage")
        }
        console.log("✅ Thumbnail deleted from Cloudinary");
    }

    // Delete video document from MongoDB database
    console.log("💾 Deleting video from database...");
    await Video.findByIdAndDelete(videoId)
    
    console.log(`✅ Video "${foundVideo.title}" deleted successfully (ID: ${videoId})`);

    // Send success response with empty data object
    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Video deleted successfully")
        )
})

// ============================================
// EXPORTS
// ============================================
export { 
    uploadVideo,      // POST /api/v1/videos - Upload new video
    getAllVideos,     // GET /api/v1/videos - List videos with filters
    getVideoById,     // GET /api/v1/videos/:videoId - Get single video
    updateVideo,      // PATCH /api/v1/videos/:videoId - Update video
    deleteVideo       // DELETE /api/v1/videos/:videoId - Delete video
};


