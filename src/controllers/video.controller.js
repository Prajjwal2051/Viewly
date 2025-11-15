// ============================================
// DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadOnCloudinary } from "../utils/cloudnary";
import { video } from "../models/video.model.js";
import mongoose, { mongo } from "mongoose";

// ============================================
// CONTROLLERS
// ============================================

/**
 * Upload Video Controller
 * 
 * Handles the complete video upload workflow:
 * - Validates video metadata (title, description, category, tags)
 * - Processes video and thumbnail files via Multer
 * - Uploads files to Cloudinary storage
 * - Saves video details to MongoDB
 * - Returns uploaded video with populated owner information
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
    console.log("Received:", { title, description, tags, category });

    // Validate required fields
    if (!title || title.trim() === "") {
        throw new ApiError(400, "Title is required");
    }
    if (!category || category.trim() === "") {
        throw new ApiError(400, "Category is required");
    }

    // Get file paths from Multer middleware
    // Files are temporarily stored locally before Cloudinary upload
    const videoFileLocalPath = req.files?.video?.[0]?.path;
    const thumbnailFileLocalPath = req.files?.thumbnail?.[0]?.path;

    // Validate file uploads
    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
    if (!thumbnailFileLocalPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    // Upload files to Cloudinary
    // Returns URL, duration, format, and other metadata
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    if (!videoFile) {
        throw new ApiError(500, "Video upload to Cloudinary failed");
    }

    const thumbnailFile = await uploadOnCloudinary(thumbnailFileLocalPath);
    if (!thumbnailFile) {
        throw new ApiError(500, "Thumbnail upload to Cloudinary failed");
    }

    console.log("Video URL:", videoFile.url);
    console.log("Thumbnail URL:", thumbnailFile.url);

    // Extract video duration from Cloudinary response
    const duration = videoFile.duration || 0;

    // Create video document in MongoDB
    const newVideo = await video.create({
        videoFile: videoFile.url,
        thumbNail: thumbnailFile.url,
        title: title.trim(),
        description: description?.trim(),
        duration: duration,
        owner: req.user._id,
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

    // Fetch created video with populated owner details
    const uploadedVideo = await video.findById(newVideo._id).populate(
        "owner",
        "username fullName avatar"
    );

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
 * Retrieves videos with advanced filtering, sorting, and pagination:
 * - Pagination: Splits results into pages for performance
 * - Filtering: Filter by category, tags, owner, or search term
 * - Sorting: Sort by views, date, likes (ascending/descending)
 * - Search: Full-text search in title and description
 * 
 * @route   GET /api/v1/videos
 * @access  Public
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Videos per page (default: 10)
 * @query   {string} category - Filter by category
 * @query   {string} tags - Filter by tags (case-insensitive regex)
 * @query   {string} owner - Filter by owner ID
 * @query   {string} search - Search in title and description
 * @query   {string} sortBy - Sort field: views, createdAt, likes (default: createdAt)
 * @query   {string} sortOrder - Sort direction: asc or desc (default: desc)
 * @returns {Object} ApiResponse with paginated video list
 */
const getAllVideos = asyncHandler(async (req, res) => {
    // Extract and set default values for query parameters
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

    console.log("Query params:", {
        page, limit, category, tags, owner, search, sortBy, sortOrder
    });

    // Build dynamic filter object
    // Only published videos are shown by default
    const filter = { isPublished: true };

    // Add category filter if provided
    if (category) {
        filter.category = category;
        console.log("Filtering by category:", category);
    }

    // Add tags filter with case-insensitive regex
    if (tags) {
        filter.tags = { $regex: tags, $options: 'i' };
        console.log("Filtering by tags:", tags);
    }

    // Add owner filter if provided (validate ObjectId format)
    if (owner) {
        if (!mongoose.isValidObjectId(owner)) {
            throw new ApiError(400, "Invalid Owner ID");
        }
        filter.owner = owner;
        console.log("Filtering by owner:", owner);
    }

    // Add search filter for title and description
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
        console.log("Searching for:", search);
    }

    console.log("Final filter:", filter);

    // Build sort object
    // sortOrder: "asc" = 1 (ascending), "desc" = -1 (descending)
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    console.log("Sorting by:", sort);

    // TODO: Implement MongoDB aggregation pipeline with pagination
    // - Apply filter to match videos
    // - Sort results based on sortBy and sortOrder
    // - Skip and limit for pagination
    // - Populate owner details
    // - Return paginated results with metadata
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

    // Check if video ID is provided
    if (!videoId) {
        throw new ApiError(500, "Video Not found !!!")
    }

    // Validate if it's a valid MongoDB ObjectId format
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid object ID")
    }

    // Find video by ID and populate owner details
    const foundVideo = await video.findById(videoId).populate('owner', 'username fullName avatar');

    // Check if video exists
    if (!foundVideo) {
        throw new ApiError(404, "Video not found")
    }

    // Check if video is private (only owner can access unpublished videos)
    if (!foundVideo.isPublished && foundVideo.owner._id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "This video is private");
    }

    // Increment view count using $inc operator and return updated video
    const updatedVideo = await video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },  // Increment views by 1
        { new: true }            // Return updated document
    ).populate('owner', 'username fullName avatar')

    // Send success response with video data
    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video fetched successfully"
        )
    )
})



// ============================================
// EXPORTS
// ============================================
export { uploadVideo };


