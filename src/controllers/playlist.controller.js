// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { Playlist } from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import mongoose, { mongo } from "mongoose"

// ============================================
// CONTROLLER FUNCTIONS
// ============================================

/**
 * CREATE PLAYLIST CONTROLLER
 * Creates a new playlist for the authenticated user
 *
 * Purpose:
 * - Allow users to organize their videos into custom playlists
 * - Create named collections of videos for easy access
 * - Support public and private playlists
 * - Initialize empty playlists that can be populated later
 *
 * Use Cases:
 * - Creating "Watch Later" playlist
 * - Organizing educational content by topic
 * - Building custom video collections for sharing
 * - Curating favorite videos from different channels
 *
 * Features:
 * - Name validation (required, max 100 characters)
 * - Optional description (max 500 characters)
 * - Public/private visibility toggle
 * - Automatic owner assignment from authenticated user
 * - Returns playlist with populated owner details
 *
 * Process Flow:
 * 1. Extract playlist data from request body
 * 2. Validate playlist name (required, length check)
 * 3. Validate description (optional, length check)
 * 4. Create playlist document in database
 * 5. Fetch created playlist with owner details
 * 6. Return formatted playlist response
 *
 * @route POST /api/v1/playlists
 * @access Private (requires authentication)
 * @body {string} name - Playlist name (required, max 100 chars)
 * @body {string} description - Playlist description (optional, max 500 chars)
 * @body {boolean} isPublic - Visibility setting (default: true)
 * @returns {Object} ApiResponse with created playlist data
 */
const createPlayList = asyncHandler(async (req, res) => {
    console.log("\n" + "=".repeat(60))
    console.log(" CREATE PLAYLIST REQUEST")
    console.log("=".repeat(60))

    // STEP 1: Extract playlist data from request body
    // name: Playlist title (required)
    // description: Optional description of playlist content
    // isPublic: Visibility flag - true = public, false = private (default: true)
    const { name, description, isPublic = true } = req.body

    // STEP 2: Get authenticated user ID from request
    // Populated by auth middleware after JWT verification
    const userId = req.user._id

    console.log("\n[STEP 1]  Extracting Playlist Data")
    console.log("   Name:", name || "(not provided)")
    console.log(
        "   Description:",
        description
            ? `"${description.substring(0, 50)}${description.length > 50 ? "..." : ""}"`
            : "(not provided)"
    )
    console.log("   Visibility:", isPublic ? "Public" : "Private")
    console.log("   User:", req.user?.username)

    console.log("\n[STEP 2] Validating Playlist Name")
    // STEP 3: Validate playlist name is provided and not empty
    // Trim whitespace to prevent names with only spaces
    if (!name || name.trim() === "") {
        console.log("   Playlist name is required")
        throw new ApiError(400, "Playlist name is required")
    }
    console.log("   Name is provided")

    // STEP 4: Validate playlist name length
    // Prevents excessively long names that could break UI
    // Note: .length is a property, not a method (removed parentheses)
    if (name.trim().length > 100) {
        console.log(
            "   Name exceeds 100 character limit (",
            name.trim().length,
            "characters)"
        )
        throw new ApiError(400, "Name cannot be more than 100 characters")
    }
    console.log(
        "   Name length is valid (",
        name.trim().length,
        "characters)"
    )

    console.log("\n[STEP 3] Validating Description")
    // STEP 5: Validate description length (if provided)
    // Description is optional, but if provided must be under 500 chars
    if (description && description.trim().length > 500) {
        console.log("   Description exceeds 500 character limit")
        throw new ApiError(400, "Description cannot exceed 500 characters")
    }
    if (description) {
        console.log("   Description length is valid")
    } else {
        console.log("   No description provided")
    }

    // STEP 6: Create new playlist document in database
    // Initialize with empty videos array that can be populated later
    const newPlaylist = await Playlist.create({
        name: name.trim(), // Remove whitespace from name
        description: description?.trim() || "", // Remove whitespace or empty string
        owner: userId, // Link to authenticated user
        isPublic: isPublic, // Visibility setting
        videos: [], // Empty array initially
    })

    // STEP 7: Verify playlist was created successfully
    // MongoDB create() should throw error if it fails, but we check to be safe
    if (!newPlaylist) {
        throw new ApiError(500, "Playlist failed to be created")
    }

    // STEP 8: Fetch the created playlist with populated owner details
    // populate() fetches related user data for better response
    // Returns owner's username, fullName, and avatar for display
    const createdPlaylist = await Playlist.findById(newPlaylist._id).populate(
        "owner",
        "username fullName avatar"
    )

    // STEP 9: Send success response with playlist data
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                createdPlaylist,
                "Playlist created successfully"
            )
        )
})

/**
 * GET USER PLAYLISTS CONTROLLER
 * Retrieves paginated list of playlists created by a specific user
 *
 * Purpose:
 * - Display all playlists belonging to a user
 * - Show playlist metadata (name, description, video count)
 * - Support pagination for users with many playlists
 * - Include owner details for each playlist
 *
 * Use Cases:
 * - User's profile page showing their playlists
 * - Channel page displaying public playlists
 * - Admin dashboard viewing user content
 * - Playlist management interface
 *
 * Features:
 * - Pagination (default: 10 playlists per page)
 * - Sorted by creation date (newest first)
 * - Includes video count for each playlist
 * - Shows owner profile information
 * - Returns total playlist count
 *
 * Process Flow:
 * 1. Extract and validate user ID from URL parameters
 * 2. Parse pagination parameters from query string
 * 3. Verify user exists in database
 * 4. Build aggregation pipeline to fetch playlist details
 * 5. Execute paginated query
 * 6. Return formatted playlist list with metadata
 *
 * @route GET /api/v1/playlists/user/:userId
 * @access Public (anyone can see user's public playlists)
 * @param {string} userId - MongoDB ObjectId of the user
 * @query {number} page - Page number for pagination (default: 1)
 * @query {number} limit - Number of playlists per page (default: 10)
 * @returns {Object} ApiResponse with paginated playlist list and metadata
 */
const getUserPlaylist = asyncHandler(async (req, res) => {
    // STEP 1: Extract user ID from URL parameters
    // Example: /api/v1/playlists/user/507f1f77bcf86cd799439011
    const { userId } = req.params

    // STEP 2: Extract pagination parameters from query string
    // Default values: page 1, 10 playlists per page
    // Example: /api/v1/playlists/user/123?page=2&limit=20
    const { page = 1, limit = 10 } = req.query

    // STEP 3: Validate user ID is provided
    if (!userId) {
        throw new ApiError(400, "User ID not provided")
    }

    // STEP 4: Validate user ID format
    // MongoDB ObjectIds must be 24-character hex strings
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID provided")
    }

    // STEP 5: Verify user exists in database
    // Prevents querying playlists for non-existent or deleted users
    const existsUser = await User.findById(userId)
    if (!existsUser) {
        throw new ApiError(404, "User not found")
    }

    // STEP 6: Build MongoDB Aggregation Pipeline
    // WHY AGGREGATION?
    // We need to:
    // 1. Filter playlists for this specific user
    // 2. Join with User collection to get owner details
    // 3. Calculate video count for each playlist
    // 4. Format response with only needed fields
    // 5. Sort by creation date
    const aggregationPipeline = [
        // STAGE 1: $match - Filter playlists owned by this user
        // Similar to WHERE clause in SQL
        // Converts userId string to MongoDB ObjectId for comparison
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },

        // STAGE 2: $lookup - Join with User collection (SQL JOIN equivalent)
        // Fetches complete owner information from User collection
        //
        // How it works:
        // - from: "users" → collection to join with
        // - localField: "owner" → field in playlist document
        // - foreignField: "_id" → matching field in users collection
        // - as: "ownerDetails" → name for the joined data array
        {
            $lookup: {
                from: "users", // Collection name (lowercase, pluralized)
                localField: "owner", // playlist.owner (ObjectId)
                foreignField: "_id", // users._id (ObjectId)
                as: "ownerDetails", // Output array with matched user docs
            },
        },

        // STAGE 3: $unwind - Convert array to object
        // $lookup returns an array even for single matches
        // $unwind deconstructs the array to make owner details easily accessible
        //
        // Before: { ownerDetails: [{ username: "john", ... }] }
        // After:  { ownerDetails: { username: "john", ... } }
        {
            $unwind: "$ownerDetails",
        },

        // STAGE 4: $addFields - Add computed fields
        // Calculate the number of videos in each playlist
        // $size operator counts array elements
        //
        // This creates a new field "videoCount" containing the length of videos array
        // Useful for displaying "5 videos" without fetching all video details
        {
            $addFields: {
                videoCount: { $size: "$videos" },
            },
        },

        // STAGE 5: $project - Select specific fields to return
        // Controls which fields appear in final output (like SQL SELECT)
        // Value "1" means include the field
        //
        // Why project?
        // - Reduces data transfer (only send needed fields)
        // - Hides sensitive information
        // - Improves frontend performance
        {
            $project: {
                name: 1, // Playlist name
                description: 1, // Playlist description
                isPublic: 1, // Visibility status
                videos: 1, // Video IDs array (needed for frontend to check if video is in playlist)
                videoCount: 1, // Computed video count
                createdAt: 1, // Creation timestamp
                updatedAt: 1, // Last update timestamp
                "ownerDetails.username": 1, // Owner's username
                "ownerDetails.fullName": 1, // Owner's full name
                "ownerDetails.avatar": 1, // Owner's profile picture
            },
        },

        // STAGE 6: $sort - Order results by creation date
        // -1 = descending order (newest first)
        // +1 = ascending order (oldest first)
        //
        // Shows most recently created playlists at the top
        {
            $sort: {
                createdAt: -1,
            },
        },
    ]

    // STEP 7: Configure pagination options
    // Uses mongoose-aggregate-paginate-v2 plugin
    const options = {
        page: parseInt(page), // Convert string to number
        limit: parseInt(limit), // Convert string to number
        customLabels: {
            docs: "playlists", // Rename 'docs' to 'playlists'
            totalDocs: "totalPlaylists", // Rename 'totalDocs' to 'totalPlaylists'
        },
    }

    // STEP 8: Execute paginated aggregation query
    // Returns object with:
    // - playlists: array of playlist documents
    // - totalPlaylists: total count across all pages
    // - page: current page number
    // - totalPages: number of pages available
    // - hasNextPage, hasPrevPage: navigation helpers
    const result = await Playlist.aggregatePaginate(
        Playlist.aggregate(aggregationPipeline),
        options
    )

    // STEP 9: Send success response with playlist data
    return res
        .status(200)
        .json(
            new ApiResponse(200, result, "User playlists fetched successfully")
        )
})

/**
 * GET PLAYLIST BY ID CONTROLLER
 * Retrieves detailed information about a specific playlist including all videos
 *
 * Purpose:
 * - Display complete playlist details with all associated videos
 * - Show playlist metadata (name, description, owner, visibility)
 * - Fetch populated video information with owner details
 * - Enforce privacy rules for private playlists
 * - Calculate and include total video count
 *
 * Use Cases:
 * - Playlist page showing all videos in the playlist
 * - Sharing a specific playlist with others
 * - Playing all videos in a playlist sequentially
 * - Managing playlist content (add/remove videos)
 *
 * Features:
 * - Fetches complete playlist with nested populations
 * - Includes owner details (username, fullName, avatar)
 * - Populates all videos with their owner information
 * - Privacy enforcement (private playlists only visible to owner)
 * - Returns video count for playlist metadata
 *
 * Privacy Rules:
 * - Public playlists: Accessible to everyone (authenticated or not)
 * - Private playlists: Only accessible to the playlist owner
 * - Authentication required for private playlist access
 * - 401 if not authenticated, 403 if not the owner
 *
 * Process Flow:
 * 1. Extract and validate playlist ID from URL parameters
 * 2. Fetch playlist with populated owner and video details
 * 3. Verify playlist exists in database
 * 4. Check privacy settings and enforce access control
 * 5. Calculate video count and format response
 * 6. Return complete playlist data
 *
 * @route GET /api/v1/playlists/:playlistId
 * @access Public for public playlists, Private for private playlists
 * @param {string} playlistId - MongoDB ObjectId of the playlist
 * @returns {Object} ApiResponse with complete playlist data including videos
 */
const getPlaylistById = asyncHandler(async (req, res) => {
    // STEP 1: Extract playlist ID from URL parameters
    // Example: /api/v1/playlists/507f1f77bcf86cd799439011
    const { playlistId } = req.params

    // STEP 2: Get authenticated user ID (if user is logged in)
    // May be undefined if user is not authenticated
    // Used later for privacy checks on private playlists
    const userId = req.user?._id

    // STEP 3: Validate playlist ID is provided
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID not provided")
    }

    // STEP 4: Validate playlist ID format
    // MongoDB ObjectIds must be 24-character hex strings
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID provided")
    }

    // STEP 5: Fetch playlist from database with nested population
    // WHY NESTED POPULATE?
    // We need complete information for displaying the playlist:
    // 1. Playlist owner details (username, avatar, fullName)
    // 2. All videos in the playlist
    // 3. Owner details for each video (nested populate)
    //
    // This gives a complete picture of the playlist content in one query
    const existsPlaylist = await Playlist.findById(playlistId)
        // First populate: Get playlist owner information
        .populate("owner", "username fullName avatar")
        // Second populate: Get all videos AND their owner information (nested)
        .populate({
            path: "videos", // Populate the videos array
            populate: {
                path: "owner", // For each video, also populate its owner
                select: "username fullName avatar", // Select specific owner fields
            },
        })

    // STEP 6: Verify playlist exists
    // If playlist ID is valid but doesn't exist in database
    if (!existsPlaylist) {
        throw new ApiError(404, "Playlist not found")
    }

    // STEP 7: Enforce privacy rules for private playlists
    // Private playlists should only be accessible to their owners
    if (!existsPlaylist.isPublic) {
        // SUBSTEP 7A: Check if user is authenticated
        // Private content requires authentication
        if (!req.user) {
            throw new ApiError(
                401,
                "Authentication required to view this playlist"
            )
        }

        // SUBSTEP 7B: Check if authenticated user is the playlist owner
        // Compare playlist owner ID with requesting user ID
        // toString() ensures proper comparison of ObjectIds
        if (existsPlaylist.owner._id.toString() !== req.user._id.toString()) {
            throw new ApiError(
                403,
                "You don't have permission to view this playlist"
            )
        }
    }

    // STEP 8: Format playlist response with video count
    // Add computed field for total number of videos
    // toObject() converts Mongoose document to plain JavaScript object
    // Spread operator (...) copies all existing fields
    const playlistWithCount = {
        ...existsPlaylist.toObject(),
        videoCount: existsPlaylist.videos.length, // Add video count field
    }

    // STEP 9: Send success response with complete playlist data
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlistWithCount,
                "Playlist fetched successfully"
            )
        )
})

/**
 * ADD VIDEO TO PLAYLIST CONTROLLER
 * Adds a video to an existing playlist with validation and permission checks
 *
 * Purpose:
 * - Allow users to add videos to their playlists
 * - Validate video exists and is published
 * - Prevent duplicate videos in same playlist
 * - Enforce ownership permissions for private playlists
 *
 * Process Flow:
 * 1. Validate playlist ID and video ID
 * 2. Verify playlist exists and check permissions
 * 3. Verify video exists and is published
 * 4. Check for duplicate videos
 * 5. Add video to playlist
 * 6. Return updated playlist
 *
 * @route POST /api/v1/playlists/add
 * @access Private (requires authentication)
 * @body {string} playlistId - MongoDB ObjectId of the playlist
 * @body {string} videoId - MongoDB ObjectId of the video to add
 * @returns {Object} ApiResponse with updated playlist data
 */
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    // STEP 1: Extract playlist and video IDs from request params
    const { playlistId, videoId } = req.params

    // STEP 2: Validate playlist ID
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID not provided")
    }
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID provided")
    }

    // STEP 3: Validate video ID
    if (!videoId) {
        throw new ApiError(400, "Video ID not provided")
    }
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID provided")
    }

    // STEP 4: Fetch and verify playlist exists
    const existsPlaylist = await Playlist.findById(playlistId)
    if (!existsPlaylist) {
        throw new ApiError(404, "Playlist not found")
    }

    // STEP 5: Check permissions for private playlists
    // Only owner can add videos to their private playlists
    if (!existsPlaylist.isPublic) {
        if (!req.user) {
            throw new ApiError(
                401,
                "Authentication required to add video to this playlist"
            )
        }
        if (existsPlaylist.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(
                403,
                "You don't have permission to add video to this playlist"
            )
        }
    }

    // STEP 6: Fetch and verify video exists
    const existingVideo = await Video.findById(videoId)
    if (!existingVideo) {
        throw new ApiError(404, "Video not found")
    }

    // STEP 7: Check if video is published
    // Only published videos can be added to playlists
    if (!existingVideo.isPublished) {
        throw new ApiError(400, "Cannot add unpublished video to playlist")
    }

    // STEP 8: Check if video already exists in playlist
    // Prevents duplicate entries
    if (existsPlaylist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in playlist")
    }

    // STEP 9: Add video to playlist using $addToSet (prevents duplicates)
    // Returns updated playlist with populated fields
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $addToSet: { videos: videoId } }, // $addToSet ensures no duplicates
        { new: true } // Return updated document
    )
        .populate("videos") // Populate video details
        .populate("owner", "username fullName avatar") // Populate owner details

    // STEP 10: Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Video added to playlist successfully"
            )
        )
})

/**
 * REMOVE VIDEO FROM PLAYLIST CONTROLLER
 * Removes a specific video from an existing playlist
 *
 * Purpose:
 * - Allow users to remove videos from their playlists
 * - Maintain playlist organization and relevance
 * - Enforce ownership permissions
 *
 * Process Flow:
 * 1. Validate playlist ID and video ID
 * 2. Verify playlist exists and check ownership
 * 3. Check if video exists in playlist
 * 4. Remove video from playlist
 * 5. Return updated playlist
 *
 * @route DELETE /api/v1/playlists/remove
 * @access Private (requires authentication)
 * @body {string} playlistId - MongoDB ObjectId of the playlist
 * @body {string} videoId - MongoDB ObjectId of the video to remove
 * @returns {Object} ApiResponse with updated playlist data
 */
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // STEP 1: Extract playlist and video IDs from request params
    const { playlistId, videoId } = req.params
    const userId = req.user._id

    // STEP 2: Validate playlist ID
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID not provided")
    }
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID provided")
    }

    // STEP 3: Validate video ID
    if (!videoId) {
        throw new ApiError(400, "Video ID not provided")
    }
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID provided")
    }

    // STEP 4: Fetch and verify playlist exists
    const existsPlaylist = await Playlist.findById(playlistId)
    if (!existsPlaylist) {
        throw new ApiError(404, "Playlist not found")
    }

    // STEP 5: Check ownership - only owner can remove videos
    if (existsPlaylist.owner.toString() !== userId.toString()) {
        throw new ApiError(
            403,
            "You don't have permission to modify this playlist"
        )
    }

    // STEP 6: Check if video exists in playlist
    if (!existsPlaylist.videos.includes(videoId)) {
        throw new ApiError(400, "Video not found in playlist")
    }

    // STEP 7: Remove video from playlist using $pull operator
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } }, // $pull removes matching element
        { new: true } // Return updated document
    )
        .populate("videos")
        .populate("owner", "username fullName avatar")

    // STEP 8: Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Video removed from playlist successfully"
            )
        )
})

/**
 * UPDATE PLAYLIST CONTROLLER
 * Updates playlist name, description, and privacy settings
 *
 * Purpose:
 * - Allow users to modify playlist metadata
 * - Update visibility settings (public/private)
 * - Keep playlist information current and relevant
 *
 * Process Flow:
 * 1. Validate playlist ID
 * 2. Verify playlist exists and check ownership
 * 3. Validate update fields
 * 4. Update playlist with new data
 * 5. Return updated playlist
 *
 * @route PATCH /api/v1/playlists/:playlistId
 * @access Private (requires authentication)
 * @param {string} playlistId - MongoDB ObjectId of the playlist
 * @body {string} name - New playlist name (optional, max 100 chars)
 * @body {string} description - New description (optional, max 500 chars)
 * @body {boolean} isPublic - New visibility setting (optional)
 * @returns {Object} ApiResponse with updated playlist data
 */
const updatePlaylist = asyncHandler(async (req, res) => {
    // STEP 1: Extract playlist ID and update data
    const { playlistId } = req.params
    const { name, description, isPublic } = req.body
    const userId = req.user._id

    // STEP 2: Validate playlist ID
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID not provided")
    }
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID provided")
    }

    // STEP 3: Validate at least one field is provided for update
    if (
        name === undefined &&
        description === undefined &&
        isPublic === undefined
    ) {
        throw new ApiError(
            400,
            "At least one field (name, description, or isPublic) must be provided"
        )
    }

    // STEP 4: Fetch and verify playlist exists
    const existsPlaylist = await Playlist.findById(playlistId)
    if (!existsPlaylist) {
        throw new ApiError(404, "Playlist not found")
    }

    // STEP 5: Check ownership - only owner can update playlist
    if (existsPlaylist.owner.toString() !== userId.toString()) {
        throw new ApiError(
            403,
            "You don't have permission to update this playlist"
        )
    }

    // STEP 6: Validate name if provided
    if (name !== undefined) {
        if (!name || name.trim() === "") {
            throw new ApiError(400, "Playlist name cannot be empty")
        }
        if (name.trim().length > 100) {
            throw new ApiError(400, "Name cannot be more than 100 characters")
        }
    }

    // STEP 7: Validate description if provided
    if (description !== undefined && description.trim().length > 500) {
        throw new ApiError(400, "Description cannot exceed 500 characters")
    }

    // STEP 8: Build update object with only provided fields
    const updateData = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (isPublic !== undefined) updateData.isPublic = isPublic

    // STEP 9: Update playlist in database
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $set: updateData },
        { new: true, runValidators: true } // Return updated doc and run validators
    ).populate("owner", "username fullName avatar")

    // STEP 10: Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Playlist updated successfully"
            )
        )
})

/**
 * DELETE PLAYLIST CONTROLLER
 * Permanently deletes a playlist from the database
 *
 * Purpose:
 * - Allow users to remove unwanted playlists
 * - Clean up unused or obsolete playlists
 * - Enforce ownership permissions
 *
 * Process Flow:
 * 1. Validate playlist ID
 * 2. Verify playlist exists and check ownership
 * 3. Delete playlist from database
 * 4. Return success confirmation
 *
 * @route DELETE /api/v1/playlists/:playlistId
 * @access Private (requires authentication)
 * @param {string} playlistId - MongoDB ObjectId of the playlist to delete
 * @returns {Object} ApiResponse with deletion confirmation
 */
const deletePlaylist = asyncHandler(async (req, res) => {
    // STEP 1: Extract playlist ID from URL parameters
    const { playlistId } = req.params
    const userId = req.user._id

    // STEP 2: Validate playlist ID
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID not provided")
    }
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID provided")
    }

    // STEP 3: Fetch and verify playlist exists
    const existsPlaylist = await Playlist.findById(playlistId)
    if (!existsPlaylist) {
        throw new ApiError(404, "Playlist not found")
    }

    // STEP 4: Check ownership - only owner can delete playlist
    if (existsPlaylist.owner.toString() !== userId.toString()) {
        throw new ApiError(
            403,
            "You don't have permission to delete this playlist"
        )
    }

    // STEP 5: Delete playlist from database
    await Playlist.findByIdAndDelete(playlistId)

    // STEP 6: Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { deletedPlaylistId: playlistId },
                "Playlist deleted successfully"
            )
        )
})

// ============================================
// EXPORT CONTROLLERS
// ============================================
// All playlist-related controller functions are exported here
// These handlers manage complete playlist lifecycle

export {
    // Create a new playlist for authenticated user
    createPlayList,

    // Get all playlists created by a specific user
    getUserPlaylist,

    // Get detailed information about a specific playlist by ID
    getPlaylistById,

    // Add a video to an existing playlist
    addVideoToPlaylist,

    // Remove a video from an existing playlist
    removeVideoFromPlaylist,

    // Update playlist name, description, or privacy settings
    updatePlaylist,

    // Delete a playlist permanently
    deletePlaylist,
}
