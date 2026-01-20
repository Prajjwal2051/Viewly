// ============================================
// DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {
    uploadOnCloudinary,
    getPublicId,
    deleteFromCloudinary,
} from "../utils/cloudnary.js"
import { Video } from "../models/video.model.js"
import mongoose from "mongoose"

// ============================================
// CONTROLLERS
// ============================================

/**
 * Get Video Categories Controller
 *
 * Retrieves all unique categories from published videos.
 * Used for dynamic filtering on the home page.
 *
 * @route   GET /api/v1/videos/categories
 * @access  Public
 * @returns {Object} ApiResponse with list of categories
 */
const getVideoCategories = asyncHandler(async (req, res) => {
    // Aggregate to find distinct categories from published videos
    const categories = await Video.distinct("category", { isPublished: true })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                categories,
                "Video categories fetched successfully"
            )
        )
})

/**
 * Get Most Used Tags Controller
 *
 * Retrieves the most frequently used tags from published videos.
 * Used to display popular tags on home and discover pages.
 *
 * @route   GET /api/v1/videos/tags/popular
 * @access  Public
 * @query   {number} limit - Number of tags to return (default: 15)
 * @returns {Object} ApiResponse with array of popular tags
 */
const getMostUsedTags = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 15

    // Aggregate tags from all published videos
    const tagStats = await Video.aggregate([
        // Match only published videos
        {
            $match: {
                isPublished: true,
                tags: { $exists: true, $ne: "" },
            },
        },
        // Split comma-separated tags into array
        {
            $project: {
                tagsArray: {
                    $split: ["$tags", ","],
                },
            },
        },
        // Unwind to get individual tags
        {
            $unwind: "$tagsArray",
        },
        // Trim whitespace and convert to lowercase
        {
            $project: {
                tag: {
                    $trim: {
                        input: { $toLower: "$tagsArray" },
                    },
                },
            },
        },
        // Filter out empty tags
        {
            $match: {
                tag: { $ne: "" },
            },
        },
        // Group by tag and count occurrences
        {
            $group: {
                _id: "$tag",
                count: { $sum: 1 },
            },
        },
        // Sort by count descending
        {
            $sort: { count: -1 },
        },
        // Limit results
        {
            $limit: limit,
        },
        // Format output
        {
            $project: {
                _id: 0,
                tag: "$_id",
                count: 1,
            },
        },
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tagStats,
                "Most used tags fetched successfully"
            )
        )
})

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
    console.log("\n" + "=".repeat(60))
    console.log(" VIDEO UPLOAD REQUEST INITIATED")
    console.log("=".repeat(60))

    // Extract video metadata from request body
    const { title, description, category, tags } = req.body

    console.log("\n[STEP 1]  Extracting Video Metadata")
    console.log("   Title:", title || "(not provided)")
    console.log("   Category:", category || "(not provided)")
    console.log(
        "   Description:",
        description
            ? `"${description.substring(0, 50)}${description.length > 50 ? "..." : ""}"`
            : "(not provided)"
    )
    console.log("   Tags:", tags || "(none)")
    console.log("   User:", req.user?.username || "Unknown")

    console.log("\n[STEP 2] Validating Required Fields")
    // Validate required fields (title and category are mandatory)
    if (!title || title.trim() === "") {
        console.log("   Validation Failed: Title is missing")
        throw new ApiError(400, "Title is required")
    }
    console.log("   Title validation passed")

    if (!category || category.trim() === "") {
        console.log("   Validation Failed: Category is missing")
        throw new ApiError(400, "Category is required")
    }
    console.log("   Category validation passed")

    console.log("\n[STEP 3]  Checking Uploaded Files")
    // Get file paths from Multer middleware (files stored temporarily)
    const videoFileLocalPath = req.files?.video?.[0]?.path
    const thumbnailFileLocalPath = req.files?.thumbnail?.[0]?.path

    // Validate that both files were uploaded
    if (!videoFileLocalPath) {
        console.log("   Video file missing from request")
        throw new ApiError(400, "Video file is required")
    }
    console.log("   Video file received:", req.files?.video?.[0]?.filename)

    if (!thumbnailFileLocalPath) {
        console.log("   Thumbnail file missing from request")
        throw new ApiError(400, "Thumbnail file is required")
    }
    console.log(
        "   Thumbnail file received:",
        req.files?.thumbnail?.[0]?.filename
    )

    console.log("\n[STEP 4]  Uploading Files to Cloudinary")
    // Upload files to Cloudinary and get URLs
    console.log("   Uploading video file...")
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    if (!videoFile) {
        console.log("   Video upload to Cloudinary failed")
        throw new ApiError(500, "Video upload to Cloudinary failed")
    }
    console.log("   Video uploaded successfully")
    console.log("   Video URL:", videoFile.url)

    console.log("   Uploading thumbnail image...")
    const thumbnailFile = await uploadOnCloudinary(thumbnailFileLocalPath)
    if (!thumbnailFile) {
        console.log("   Thumbnail upload to Cloudinary failed")
        throw new ApiError(500, "Thumbnail upload to Cloudinary failed")
    }
    console.log("   Thumbnail uploaded successfully")
    console.log("   Thumbnail URL:", thumbnailFile.url)

    // Extract video duration from Cloudinary response (in seconds)
    const duration = videoFile.duration || 0
    console.log(
        "   Video Duration:",
        `${duration} seconds (${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, "0")})`
    )

    console.log("\n[STEP 5]  Saving Video to Database")
    // Create video document in MongoDB with all metadata
    const newVideo = await Video.create({
        videoFile: videoFile.url,
        thumbNail: thumbnailFile.url,
        title: title.trim(),
        description: description?.trim(),
        duration: duration,
        owner: req.user._id, // From auth middleware
        category: category.trim(),
        tags: tags?.trim() || "",
        isPublished: true,
        views: 0,
        likes: 0,
        dislikes: 0,
    })

    if (!newVideo) {
        console.log("   Failed to create video document in database")
        throw new ApiError(500, "Failed to save video to database")
    }
    console.log("   Video document created in MongoDB")
    console.log("   Video ID:", newVideo._id)

    console.log("\n[STEP 6]  Fetching Complete Video Details")
    // Fetch created video with populated owner details for response
    const uploadedVideo = await Video.findById(newVideo._id).populate(
        "owner",
        "username fullName avatar"
    )
    console.log("   Owner details populated")

    console.log("\n" + "=".repeat(60))
    console.log("VIDEO UPLOAD SUCCESSFUL")
    console.log("=".repeat(60))
    console.log(`    Title: "${title}"`)
    console.log(`    Owner: @${req.user.username}`)
    console.log(`   🆔 Video ID: ${newVideo._id}`)
    console.log(`    Category: ${category}`)
    console.log("=".repeat(60) + "\n")

    // Send success response
    return res
        .status(201)
        .json(
            new ApiResponse(201, uploadedVideo, "Video uploaded successfully")
        )
})

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
    console.log("\n" + "=".repeat(60))
    console.log(" GET ALL VIDEOS REQUEST")
    console.log("=".repeat(60))

    // Extract query parameters with default values
    const {
        page = 1,
        limit = 10,
        category,
        tags,
        owner,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = req.query

    console.log("\n[STEP 1]  Processing Query Parameters")
    console.log("   Page:", page)
    console.log("   Limit:", limit)
    console.log("   Sort By:", sortBy)
    console.log("   Sort Order:", sortOrder)

    console.log("\n[STEP 2]  Building Filter Criteria")
    // Build filter object (only show published videos by default)
    const filter = { isPublished: true }
    const appliedFilters = ["isPublished: true"]

    // Add category filter if provided
    if (category) {
        filter.category = category
        appliedFilters.push(`category: ${category}`)
        console.log("   Category filter added:", category)
    }

    // Add tags filter with case-insensitive regex search
    if (tags) {
        filter.tags = { $regex: tags, $options: "i" }
        appliedFilters.push(`tags: ${tags}`)
        console.log("   Tags filter added:", tags)
    }

    // Add owner filter with ID validation
    if (owner) {
        if (!mongoose.isValidObjectId(owner)) {
            console.log("   Invalid Owner ID format:", owner)
            throw new ApiError(400, "Invalid Owner ID")
        }
        filter.owner = owner
        appliedFilters.push(`owner: ${owner}`)
        console.log("   Owner filter added:", owner)
    }

    // Add search filter for title and description
    // $or matches if either condition is true
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ]
        appliedFilters.push(`search: "${search}"`)
        console.log("   Search filter added:", search)
    }

    if (!category && !tags && !owner && !search) {
        console.log(
            "   No additional filters applied (showing all published videos)"
        )
    }
    console.log("   Total Filters:", appliedFilters.join(" | "))

    console.log("\n[STEP 3]  Configuring Sort Order")
    // Build sort object (1 = ascending, -1 = descending)
    const sort = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1
    console.log(
        `   Sorting by: ${sortBy} (${sortOrder === "asc" ? "ascending" : "descending"})`
    )

    console.log("\n[STEP 4]  Calculating Pagination")
    // Get videos from database with filters, sorting, and pagination
    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)
    const skip = (pageNumber - 1) * limitNumber
    console.log(`   Skip: ${skip} videos`)
    console.log(`   Limit: ${limitNumber} videos per page`)

    console.log("\n[STEP 5]  Querying Database")
    console.log("   Fetching videos with filters...")
    // Find videos with filters, sort, and pagination
    const videos = await Video.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .populate("owner", "username fullName avatar")
    console.log("   Videos fetched successfully")

    console.log("   Counting total matching videos...")
    // Get total count for pagination metadata
    const totalVideos = await Video.countDocuments(filter)
    const totalPages = Math.ceil(totalVideos / limitNumber)
    console.log("   Count completed")

    console.log("\n" + "=".repeat(60))
    console.log("VIDEOS RETRIEVED SUCCESSFULLY")
    console.log("=".repeat(60))
    console.log(`    Videos on this page: ${videos.length}`)
    console.log(`    Total videos matching filters: ${totalVideos}`)
    console.log(`    Current page: ${pageNumber} of ${totalPages}`)
    console.log(`   ➡️  Has next page: ${pageNumber < totalPages}`)
    console.log(`   ⬅️  Has previous page: ${pageNumber > 1}`)
    console.log("=".repeat(60) + "\n")

    // Build response with pagination metadata
    const response = {
        videos: videos,
        pagination: {
            currentPage: pageNumber,
            totalPages: totalPages,
            totalVideos: totalVideos,
            videosPerPage: limitNumber,
            hasNextPage: pageNumber < totalPages,
            hasPrevPage: pageNumber > 1,
        },
    }

    // Return success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                response,
                `Successfully retrieved ${videos.length} videos`
            )
        )
})

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
    console.log("\n" + "=".repeat(60))
    console.log(" GET VIDEO BY ID REQUEST")
    console.log("=".repeat(60))

    // Extract video ID from URL parameters
    const { videoId } = req.params
    console.log("\n[STEP 1]  Validating Video ID")
    console.log("   Requested Video ID:", videoId)
    console.log(
        "   Requested by:",
        req.user?.username || "Anonymous (Not authenticated)"
    )

    // Check if video ID is provided
    if (!videoId) {
        console.log("   Video ID not provided in request")
        throw new ApiError(500, "Video Not found !!!")
    }

    // Validate if it's a valid MongoDB ObjectId format
    if (!mongoose.isValidObjectId(videoId)) {
        console.log("   Invalid MongoDB ObjectId format")
        throw new ApiError(400, "Invalid object ID")
    }
    console.log("   Video ID format is valid")

    console.log("\n[STEP 2]  Fetching Video from Database")
    // Find video by ID and populate owner details
    const foundVideo = await Video.findById(videoId).populate(
        "owner",
        "username fullName avatar"
    )

    // Check if video exists
    if (!foundVideo) {
        console.log("   Video not found in database")
        throw new ApiError(404, "Video not found")
    }
    console.log("   Video found in database")
    console.log(`   Title: "${foundVideo.title}"`)
    console.log(`   Owner: @${foundVideo.owner?.username}`)
    console.log(`   Current Views: ${foundVideo.views}`)
    console.log(
        `   Published Status: ${foundVideo.isPublished ? "Public" : "Private"}`
    )

    console.log("\n[STEP 3]  Checking Access Permissions")
    // Check if video is private (only owner can access unpublished videos)
    if (
        !foundVideo.isPublished &&
        foundVideo.owner._id.toString() !== req.user?._id.toString()
    ) {
        console.log(
            "   Access Denied: Video is private and user is not the owner"
        )
        throw new ApiError(403, "This video is private")
    }
    console.log("   Access granted")

    console.log("\n[STEP 4]  Incrementing View Count")
    // Increment view count using $inc operator and return updated video
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } }, // Increment views by 1
        { new: true } // Return updated document
    ).populate("owner", "username fullName avatar")
    console.log(
        `   View count updated: ${foundVideo.views} → ${updatedVideo.views}`
    )

    console.log("\n" + "=".repeat(60))
    console.log("VIDEO RETRIEVED SUCCESSFULLY")
    console.log("=".repeat(60))
    console.log(`    Title: "${updatedVideo.title}"`)
    console.log(`    Owner: @${updatedVideo.owner?.username}`)
    console.log(`    Views: ${updatedVideo.views}`)
    console.log(
        `   ⏱️  Duration: ${Math.floor(updatedVideo.duration / 60)}:${String(Math.floor(updatedVideo.duration % 60)).padStart(2, "0")}`
    )
    console.log("=".repeat(60) + "\n")

    // Send success response with video data
    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video fetched successfully"))
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
    console.log("\n" + "=".repeat(60))
    console.log("✏️  UPDATE VIDEO REQUEST")
    console.log("=".repeat(60))

    // Extract video ID from URL and update fields from request
    const { videoId } = req.params
    const { title, description } = req.body
    const thumbnailFileLocalPath = req.file?.path

    console.log("\n[STEP 1]  Analyzing Update Request")
    console.log(`   Video ID: ${videoId}`)
    console.log(`   Requested by: @${req.user?.username}`)
    console.log("   Fields to update:")
    if (title) console.log(`      • Title: "${title}"`)
    if (description !== undefined)
        console.log(
            `      • Description: ${description ? `"${description.substring(0, 50)}${description.length > 50 ? "..." : ""}"` : "(empty)"}`
        )
    if (thumbnailFileLocalPath)
        console.log(`      • Thumbnail: ${req.file?.filename}`)
    if (!title && description === undefined && !thumbnailFileLocalPath) {
        console.log("      (none specified)")
    }

    console.log("\n[STEP 2] Validating Video ID")
    // Validate video ID format
    if (!mongoose.isValidObjectId(videoId)) {
        console.log("   Invalid MongoDB ObjectId format")
        throw new ApiError(400, "Invalid video ID")
    }
    console.log("   Video ID format is valid")

    console.log("\n[STEP 3]  Fetching Video from Database")
    // Find video in database
    const foundVideo = await Video.findById(videoId)

    if (!foundVideo) {
        console.log("   Video not found in database")
        throw new ApiError(404, "Video not found")
    }
    console.log("   Video found in database")
    console.log(`   Current Title: "${foundVideo.title}"`)
    console.log(`   Owner: @${req.user.username}`)

    console.log("\n[STEP 4]  Verifying Authorization")
    // Authorization: Only video owner can update
    // Prevents unauthorized users from modifying others' videos
    if (foundVideo.owner.toString() !== req.user._id.toString()) {
        console.log("   Authorization failed: User is not the video owner")
        throw new ApiError(403, "You are not authorized to update this video")
    }
    console.log("   User authorized to update this video")

    console.log("\n[STEP 5] Validating Update Data")
    // Validation: At least one field must be provided for update
    if (!title && !description && !thumbnailFileLocalPath) {
        console.log("   No fields provided for update")
        throw new ApiError(
            400,
            "Provide at least one field: title, description, or thumbnail"
        )
    }
    console.log("   At least one field provided for update")

    // Validation: Title cannot be empty string (if provided)
    if (title && title.trim() === "") {
        console.log("   Title cannot be empty string")
        throw new ApiError(400, "Title cannot be empty")
    }
    if (title) {
        console.log("   Title validation passed")
    }

    // Upload new thumbnail to Cloudinary (if provided)
    let thumbNailUrlFromCloudinary
    if (thumbnailFileLocalPath) {
        console.log("\n[STEP 6]  Processing Thumbnail Update")
        console.log("   Uploading new thumbnail to Cloudinary...")
        const thumbNailFile = await uploadOnCloudinary(thumbnailFileLocalPath)
        if (!thumbNailFile) {
            console.log("   Thumbnail upload to Cloudinary failed")
            throw new ApiError(500, "Thumbnail upload failed")
        }
        thumbNailUrlFromCloudinary = thumbNailFile.url
        console.log("   New thumbnail uploaded successfully")
        console.log("   New Thumbnail URL:", thumbNailUrlFromCloudinary)

        // Delete old thumbnail from Cloudinary to save storage space
        // Extract public_id from old thumbnail URL and delete it
        console.log("   Deleting old thumbnail from Cloudinary...")
        const oldThumbnailPublicId = await getPublicId(foundVideo.thumbNail)
        if (oldThumbnailPublicId) {
            await deleteFromCloudinary(oldThumbnailPublicId, "image")
            console.log("   Old thumbnail deleted successfully")
            console.log("   Deleted Public ID:", oldThumbnailPublicId)
        } else {
            console.log("    Could not extract old thumbnail public ID")
        }
    }

    console.log("\n[STEP 7]  Building Update Object")
    // Build update object with only provided fields
    // This allows partial updates (update only what's needed)
    const updateData = {}
    if (title) {
        updateData.title = title.trim()
        console.log(`   Title will be updated to: "${title.trim()}"`)
    }
    if (description !== undefined) {
        updateData.description = description.trim()
        console.log(`   Description will be updated`)
    }
    if (thumbNailUrlFromCloudinary) {
        updateData.thumbNail = thumbNailUrlFromCloudinary
        console.log("   Thumbnail URL will be updated")
    }
    console.log(
        `   Total fields to update: ${Object.keys(updateData).length}`
    )

    console.log("\n[STEP 8]  Saving Changes to Database")
    // Update video in database with new data
    // $set: updates only specified fields
    // new: true - returns updated document
    // runValidators: true - runs schema validation on update
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate("owner", "username fullName avatar")
    console.log("   Video updated successfully in database")

    console.log("\n" + "=".repeat(60))
    console.log("VIDEO UPDATE SUCCESSFUL")
    console.log("=".repeat(60))
    console.log(`    Video ID: ${videoId}`)
    console.log(`    Updated Title: "${updatedVideo.title}"`)
    console.log(`    Owner: @${req.user.username}`)
    console.log(`    Fields Updated: ${Object.keys(updateData).join(", ")}`)
    console.log("=".repeat(60) + "\n")

    // Send success response with updated video
    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"))
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
    console.log("\n" + "=".repeat(60))
    console.log(" DELETE VIDEO REQUEST")
    console.log("=".repeat(60))

    // Extract and validate video ID from URL parameters
    const { videoId } = req.params

    console.log("\n[STEP 1]  Validating Video ID")
    console.log(`   Video ID to delete: ${videoId}`)
    console.log(`   Requested by: @${req.user?.username}`)

    if (!mongoose.isValidObjectId(videoId)) {
        console.log("   Invalid MongoDB ObjectId format")
        throw new ApiError(400, "Invalid video ID provided for deletion")
    }
    console.log("   Video ID format is valid")

    console.log("\n[STEP 2]  Fetching Video from Database")
    // Find video in database
    const foundVideo = await Video.findById(videoId)

    if (!foundVideo) {
        console.log("   Video not found in database")
        throw new ApiError(404, "Video not found")
    }
    console.log("   Video found in database")
    console.log(`   Title: "${foundVideo.title}"`)
    console.log(`   Owner: @${req.user.username}`)
    console.log(`   Views: ${foundVideo.views}`)
    console.log(`   Category: ${foundVideo.category}`)

    console.log("\n[STEP 3]  Verifying Authorization")
    // Authorization: Only video owner can delete
    // Prevents unauthorized users from deleting others' videos
    if (foundVideo.owner.toString() !== req.user._id.toString()) {
        console.log("   Authorization failed: User is not the video owner")
        throw new ApiError(403, "You are not authorized to delete this video")
    }
    console.log("   User authorized to delete this video")

    console.log("\n[STEP 4]  Deleting Video File from Cloudinary")
    // Delete video file from Cloudinary
    // Extract public_id from video URL and delete the file
    const videoPublicId = await getPublicId(foundVideo.videoFile)
    console.log("   Extracting video public ID...")

    if (videoPublicId) {
        console.log("   Video Public ID:", videoPublicId)
        console.log("   Deleting video file...")
        const videoDeleteResult = await deleteFromCloudinary(
            videoPublicId,
            "video"
        )

        // Check if video deletion was successful
        if (!videoDeleteResult || videoDeleteResult.result !== "ok") {
            console.log("   Failed to delete video from Cloudinary")
            throw new ApiError(500, "Failed to delete video from cloud storage")
        }
        console.log("   Video file deleted from Cloudinary successfully")
    } else {
        console.log("    Could not extract video public ID")
    }

    console.log("\n[STEP 5]  Deleting Thumbnail from Cloudinary")
    // Delete thumbnail from Cloudinary
    // Extract public_id from thumbnail URL and delete the image
    const thumbNailPublicId = await getPublicId(foundVideo.thumbNail)
    console.log("   Extracting thumbnail public ID...")

    if (thumbNailPublicId) {
        console.log("   Thumbnail Public ID:", thumbNailPublicId)
        console.log("   Deleting thumbnail image...")
        const thumbnailDeleteResult = await deleteFromCloudinary(
            thumbNailPublicId,
            "image"
        )

        // Check if thumbnail deletion was successful
        if (!thumbnailDeleteResult || thumbnailDeleteResult.result !== "ok") {
            console.log("   Failed to delete thumbnail from Cloudinary")
            throw new ApiError(
                500,
                "Failed to delete thumbnail from cloud storage"
            )
        }
        console.log("   Thumbnail deleted from Cloudinary successfully")
    } else {
        console.log("    Could not extract thumbnail public ID")
    }

    console.log("\n[STEP 6]  Deleting Video Document from Database")
    // Delete video document from MongoDB database
    await Video.findByIdAndDelete(videoId)
    console.log("   Video document removed from MongoDB")

    console.log("\n" + "=".repeat(60))
    console.log("VIDEO DELETION COMPLETED")
    console.log("=".repeat(60))
    console.log(`    Deleted Video: "${foundVideo.title}"`)
    console.log(`   🆔 Video ID: ${videoId}`)
    console.log(`    Owner: @${req.user.username}`)
    console.log("    All associated files removed from cloud storage")
    console.log("    Database record deleted")
    console.log("=".repeat(60) + "\n")

    // Send success response with empty data object
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"))
})

// ============================================
// EXPORTS
// ============================================
export {
    uploadVideo, // POST /api/v1/videos - Upload new video
    getAllVideos, // GET /api/v1/videos - List videos with filters
    getVideoById, // GET /api/v1/videos/:videoId - Get single video
    updateVideo, // PATCH /api/v1/videos/:videoId - Update video
    deleteVideo, // DELETE /api/v1/videos/:videoId - Delete video
    getVideoCategories, // GET /api/v1/videos/categories - Get distinct categories
    getMostUsedTags, // GET /api/v1/videos/tags/popular - Get popular tags
}
