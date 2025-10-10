// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"  // Fixed: jwt is a default export, not named export

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * GENERATE ACCESS AND REFRESH TOKENS
 * Creates both access and refresh tokens for user authentication
 * - Access Token: Short-lived token for API requests (e.g., 1 day)
 * - Refresh Token: Long-lived token to generate new access tokens (e.g., 10 days)
 * 
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {Object} Object containing accessToken and refreshToken
 * @throws {ApiError} If token generation fails
 */
const generateAcessAndRefreshToken = async (userId) => {
    try {
        // Find user in database by ID
        const user = await User.findById(userId)

        // Generate access token (short-lived, contains user info)
        const acessToken = user.generateAcessToken()

        // Generate refresh token (long-lived, contains only user ID)
        const refreshToken = user.generateRefreshToken()

        // Save refresh token to database for session management
        user.refreshToken = refreshToken

        // Save without running validation (password is already hashed)
        await user.save({ validateBeforeSave: false })

        return { acessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token")
    }
}

// ============================================
// CONTROLLER FUNCTIONS
// ============================================

/**
 * REGISTER NEW USER CONTROLLER
 * Handles the complete user registration process including:
 * - Input validation
 * - Duplicate user check
 * - File uploads (avatar & cover image)
 * - Database entry creation
 * - Secure response (excluding sensitive data)
 * 
 * @route POST /api/v1/users/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
    // STEP 1: Extract user data from request body
    const { fullName, email, username, password } = req.body
    console.log("email ", email)

    // STEP 2: Validate input fields - ensure no field is empty or contains only whitespace
    if (
        [fullName, email, username, password].some((field) => {
            field?.trim() === ""
        })
    ) {
        throw new ApiError(400, "all fields are required")
    }

    // STEP 3: Check if user already exists with the same username or email
    // This prevents duplicate accounts and maintains data integrity
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "user already exists")
    }

    // STEP 4: Extract local file paths for uploaded images
    // Multer middleware stores uploaded files temporarily on the server
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImgLocalPath = req.files?.coverimage[0]?.path
    let coverImgLocalPath;
    if (req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0) {
        coverImgLocalPath = req.files.coverimage[0].path
    }
    console.log(avatarLocalPath)
    console.log(coverImgLocalPath)

    // STEP 5: Validate avatar is provided (mandatory field)
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar is required")
    }

    // STEP 6: Upload images to Cloudinary cloud storage
    // Avatar is mandatory, cover image is optional
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImg = await uploadOnCloudinary(coverImgLocalPath)

    // STEP 7: Verify avatar upload was successful
    if (!avatar) {
        throw new ApiError(400, "avatar upload failed")
    }

    // STEP 8: Create user entry in database with all validated data
    // Password will be automatically hashed by the pre-save middleware in user model
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImg: coverImg?.url || "",  // Optional field, empty string if not provided
        email,
        password,  // Will be hashed before saving
        username: username.toLowerCase()  // Ensure consistency with lowercase usernames
    })

    // STEP 9: Retrieve created user from database, excluding sensitive fields
    // The select() method with "-" prefix removes specified fields from the response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // STEP 10: Verify user was successfully created in database
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user")
    }

    // STEP 11: Send success response with user data (without sensitive information)
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )
})

/**
 * LOGIN USER CONTROLLER
 * Authenticates user credentials and generates session tokens
 * 
 * Process:
 * 1. Extract credentials from request body
 * 2. Validate required fields (username or email + password)
 * 3. Find user in database
 * 4. Verify password using bcrypt comparison
 * 5. Generate access and refresh tokens
 * 6. Set secure HTTP-only cookies
 * 7. Return user data and tokens
 * 
 * @route POST /api/v1/users/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
    // STEP 1: Extract login credentials from request body
    const { email, username, password } = req.body

    // STEP 2: Validate that at least username or email is provided
    // User can login with either username OR email
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    // STEP 3: Find user in database by username OR email
    // $or operator allows matching either field
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    // STEP 4: Check if user exists in database
    if (!user) {
        throw new ApiError(404, "user does not exist")
    }

    // STEP 5: Verify password using bcrypt comparison
    // isPasswordCorrect is a custom method defined in user model
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "invalid user credentials")
    }

    // STEP 6: Generate access and refresh tokens for the user
    const { acessToken, refreshToken } = await generateAcessAndRefreshToken(user._id)

    // STEP 7: Retrieve user data without sensitive information
    const loggedUser = await User.findById(user._id).select("-password -refreshToken")

    // STEP 8: Configure cookie options for security
    const options = {
        httpOnly: true,  // Prevents client-side JavaScript from accessing cookies (XSS protection)
        secure: true     // Ensures cookies are only sent over HTTPS in production
    }

    // STEP 9: Send response with cookies and user data
    return res.status(200)
        .cookie("acessToken", acessToken, options)      // Set access token cookie
        .cookie("refreshToken", refreshToken, options)   // Set refresh token cookie
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedUser,    // User data without sensitive fields
                    acessToken,          // Also send tokens in response body for mobile apps
                    refreshToken
                },
                "User logged in successfully"
            )
        )
})

/**
 * LOGOUT USER CONTROLLER
 * Logs out the user by clearing tokens and session
 * 
 * Process:
 * 1. Get user ID from authenticated request (middleware adds this)
 * 2. Remove refresh token from database
 * 3. Clear cookies from client
 * 4. Send success response
 * 
 * @route POST /api/v1/users/logout
 * @access Private (requires authentication middleware)
 */
const logoutUser = asyncHandler(async (req, res) => {
    // STEP 1: Remove refresh token from database
    // This invalidates the user's session on the server side
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined  // Clear the refresh token
            }
        },
        {
            new: true  // Return the updated document
        }
    )

    // STEP 2: Configure cookie options for clearing
    const options = {
        httpOnly: true,  // Prevent client-side JS access
        secure: true     // Only send over HTTPS
    }

    // STEP 3: Clear cookies and send success response
    return res
        .status(200)
        .clearCookie("acessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

/**
 * REFRESH ACCESS TOKEN CONTROLLER
 * Generates a new access token using a valid refresh token
 * 
 * Purpose:
 * When access token expires, client can use refresh token to get a new access token
 * without requiring user to login again. This provides seamless user experience.
 * 
 * Process:
 * 1. Extract refresh token from cookies or request body
 * 2. Verify refresh token is valid and not expired
 * 3. Decode token to get user ID
 * 4. Find user in database
 * 5. Compare incoming token with stored token (prevent token reuse)
 * 6. Generate new access and refresh tokens
 * 7. Update tokens in database and cookies
 * 8. Return new tokens to client
 * 
 * @route POST /api/v1/users/refreshToken
 * @access Public (but requires valid refresh token)
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        // STEP 1: Extract refresh token from cookies (web) or body (mobile)
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        // STEP 2: Validate refresh token is provided
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request - Refresh token required")
        }

        // STEP 3: Verify and decode the refresh token
        // This checks signature, expiry, and decodes the payload
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        )

        // STEP 4: Find user in database using decoded user ID
        const user = await User.findById(decodedToken?._id)

        // STEP 5: Validate user exists
        if (!user) {
            throw new ApiError(401, "Invalid refresh token - User not found")
        }

        // STEP 6: Compare incoming token with stored token in database
        // This prevents reuse of old/stolen refresh tokens (token rotation)
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or already used")
        }

        // STEP 7: Configure secure cookie options
        const options = {
            httpOnly: true,  // Prevent XSS attacks
            secure: true     // Only send over HTTPS
        }

        // STEP 8: Generate new access and refresh tokens
        const { acessToken, refreshToken: newRefreshToken } = await generateAcessAndRefreshToken(user._id)

        // STEP 9: Send new tokens in cookies and response body
        return res
            .status(200)
            .cookie("acessToken", acessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { 
                        acessToken, 
                        refreshToken: newRefreshToken 
                    },
                    "Access token refreshed successfully"
                )
            )
            
    } catch (error) {
        // Handle JWT errors (expired, invalid signature, malformed, etc.)
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

/**
 * CHANGE CURRENT PASSWORD CONTROLLER
 * Allows authenticated users to change their password
 * 
 * Security Features:
 * - Requires old password verification (prevents unauthorized changes)
 * - Password is automatically hashed by pre-save middleware
 * - Requires authentication (user must be logged in)
 * 
 * Process:
 * 1. Extract old and new passwords from request
 * 2. Validate old password is correct
 * 3. Update password in database (auto-hashed)
 * 4. Return success response
 * 
 * @route POST /api/v1/users/change-password
 * @access Private (requires authentication)
 */
const changeCurrentPassword = asyncHandler(async (req, res) => {
    // STEP 1: Extract passwords from request body
    const { oldPassword, newPassword } = req.body

    // STEP 2: Validate both passwords are provided
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old and new passwords are required")
    }

    // STEP 3: Find user in database (req.user added by auth middleware)
    const user = await User.findById(req.user?._id)

    // STEP 4: Verify old password is correct using bcrypt comparison
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    // STEP 5: Set new password (will be hashed by pre-save middleware)
    user.password = newPassword

    // STEP 6: Save user with new password
    // validateBeforeSave: false skips validation since we're only updating password
    await user.save({ validateBeforeSave: false })

    // STEP 7: Send success response
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

/**
 * GET CURRENT USER CONTROLLER
 * Returns the currently authenticated user's information
 * 
 * Use Case:
 * - Frontend needs to display user profile
 * - Verify user is still authenticated
 * - Refresh user data after updates
 * 
 * Note: req.user is populated by verifyJWT middleware
 * and already excludes password and refreshToken fields
 * 
 * @route GET /api/v1/users/current-user
 * @access Private (requires authentication)
 */
const getCurrentUser = asyncHandler(async (req, res) => {
    // STEP 1: Return authenticated user data from request
    // No database query needed - data comes from middleware
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

/**
 * UPDATE ACCOUNT DETAILS CONTROLLER
 * Updates user's basic account information (fullName, email)
 * 
 * Design Pattern:
 * - Separate endpoint for text updates vs file updates
 * - This prevents unnecessary file uploads when only updating text
 * - Avatar and cover image have their own dedicated endpoints
 * 
 * Process:
 * 1. Extract updated fields from request
 * 2. Validate required fields are provided
 * 3. Update user in database
 * 4. Return updated user data
 * 
 * @route PATCH /api/v1/users/update-account
 * @access Private (requires authentication)
 */
const updateAccountDetails = asyncHandler(async (req, res) => {
    // STEP 1: Extract fields to update from request body
    const { fullName, email } = req.body

    // STEP 2: Validate both fields are provided
    // If only updating one field, consider making this more flexible
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    // STEP 3: Update user in database
    // findByIdAndUpdate is more efficient than find + save for simple updates
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,  // Shorthand for fullName: fullName
                email      // Shorthand for email: email
            }
        },
        { new: true }  // Return updated document instead of original
    ).select("-password")  // Exclude password from response

    // STEP 4: Send success response with updated user data
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})

/**
 * UPDATE USER AVATAR CONTROLLER
 * Updates user's profile picture (avatar)
 * 
 * Features:
 * - Uploads new avatar to Cloudinary
 * - Updates database with new URL
 * - Old avatar remains on Cloudinary (consider cleanup in production)
 * 
 * Process:
 * 1. Extract uploaded file path from multer middleware
 * 2. Validate file was uploaded
 * 3. Upload to Cloudinary cloud storage
 * 4. Update user's avatar URL in database
 * 5. Return updated user data
 * 
 * Note: Uses req.file (single file) not req.files (multiple files)
 * Route should use upload.single('avatar') middleware
 * 
 * @route PATCH /api/v1/users/avatar
 * @access Private (requires authentication + multer middleware)
 */
const updateUserAvatar = asyncHandler(async (req, res) => {
    // STEP 1: Extract local file path from multer middleware
    // req.file is populated by upload.single('avatar') middleware
    const localAvatarPath = req.file?.path

    // STEP 2: Validate file was uploaded
    if (!localAvatarPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    // STEP 3: Upload file to Cloudinary
    // File is temporarily stored locally by multer, then uploaded to cloud
    const avatar = await uploadOnCloudinary(localAvatarPath)

    // STEP 4: Verify Cloudinary upload was successful
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar to cloud storage")
    }

    // STEP 5: Update user's avatar URL in database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url  // Store Cloudinary URL
            }
        },
        { new: true }  // Return updated document
    ).select("-password")

    // STEP 6: Send success response with updated user data
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"))
})

/**
 * UPDATE USER COVER IMAGE CONTROLLER
 * Updates user's cover/banner image
 * 
 * Features:
 * - Uploads new cover image to Cloudinary
 * - Updates database with new URL
 * - Similar to avatar update but for cover image
 * 
 * Process:
 * 1. Extract uploaded file path from multer middleware
 * 2. Validate file was uploaded
 * 3. Upload to Cloudinary cloud storage
 * 4. Update user's cover image URL in database
 * 5. Return updated user data
 * 
 * Note: Uses req.file (single file) not req.files (multiple files)
 * Route should use upload.single('coverImage') middleware
 * 
 * @route PATCH /api/v1/users/cover-image
 * @access Private (requires authentication + multer middleware)
 */
const updateUserCoverImg = asyncHandler(async (req, res) => {
    // STEP 1: Extract local file path from multer middleware
    // req.file is populated by upload.single('coverImage') middleware
    const localCoverImgPath = req.file?.path

    // STEP 2: Validate file was uploaded
    if (!localCoverImgPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    // STEP 3: Upload file to Cloudinary
    const coverImg = await uploadOnCloudinary(localCoverImgPath)

    // STEP 4: Verify Cloudinary upload was successful
    if (!coverImg.url) {
        throw new ApiError(400, "Error while uploading cover image to cloud storage")
    }

    // STEP 5: Update user's cover image URL in database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverimage: coverImg.url  // Fixed: Store URL string, not entire object
            }
        },
        { new: true }  // Return updated document
    ).select("-password")

    // STEP 6: Send success response with updated user data
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully"))
})


/**
 * GET USER CHANNEL PROFILE CONTROLLER
 * Fetches comprehensive channel information including subscriber stats
 * 
 * Purpose:
 * - Display channel page with subscriber count and subscription status
 * - Shows if current user is subscribed to this channel
 * - Uses MongoDB aggregation pipeline for efficient data fetching
 * 
 * Features:
 * - Subscriber count (how many people subscribe to this channel)
 * - Subscribed-to count (how many channels this user subscribes to)
 * - Subscription status (is current user subscribed to this channel?)
 * 
 * Process:
 * 1. Extract username from URL parameters
 * 2. Use aggregation pipeline to:
 *    - Match user by username
 *    - Lookup subscribers (people who subscribed to this channel)
 *    - Lookup subscribed-to channels (channels this user subscribes to)
 *    - Calculate counts and subscription status
 *    - Project only required fields
 * 3. Return channel profile with all stats
 * 
 * @route GET /api/v1/users/c/:username
 * @access Public (can view any channel, but subscription status requires auth)
 */
const getUserChannelProfile = asyncHandler(async (req, res) => {
    // STEP 1: Extract username from URL parameters
    const { username } = req.params
    
    // STEP 2: Validate username is provided and not empty
    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing")
    }

    // STEP 3: MongoDB Aggregation Pipeline to fetch channel data with stats
    const channel = await User.aggregate([
        // STAGE 1: Match the user by username
        // Filter documents to find the specific user/channel
        {
            $match: {
                username: username?.toLowerCase()  // Match username (case-insensitive)
            }
        },
        
        // STAGE 2: Lookup subscribers
        // Find all users who subscribed TO this channel
        {
            $lookup: {
                from: "subscriptions",        // Collection name (lowercase + 's')
                localField: "_id",            // User's ID
                foreignField: "channel",      // Match with channel field in subscriptions
                as: "subscribers"             // Store results in 'subscribers' array
            }
        },
        
        // STAGE 3: Lookup subscribed-to channels
        // Find all channels this user has subscribed TO
        {
            $lookup: {
                from: "subscriptions",        // Same collection, different relationship
                localField: "_id",            // User's ID
                foreignField: "subscriber",   // Match with subscriber field
                as: "subscribedTo"            // Store results in 'subscribedTo' array
            }
        },
        
        // STAGE 4: Add computed fields
        // Calculate subscriber counts and subscription status
        {
            $addFields: {
                // Count total subscribers (people who subscribed to this channel)
                subscribersCount: {
                    $size: "$subscribers"
                },
                
                // Count how many channels this user subscribes to
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                
                // Check if current logged-in user is subscribed to this channel
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        
        // STAGE 5: Project only required fields
        // Select which fields to include in final output
        {
            $project: {
                fullName: 1,                        // Include
                username: 1,                        // Include
                subscribersCount: 1,                // Include (computed)
                channelsSubscribedToCount: 1,       // Include (computed)
                isSubscribed: 1,                    // Include (computed)
                avatar: 1,                          // Include
                coverimage: 1,                      // Include (note: field name from model)
                email: 1                            // Include
            }
        }
    ])

    // STEP 4: Validate channel exists
    // Aggregation returns array, check if it has results
    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist")
    }

    // STEP 5: Send channel profile data
    // channel[0] because aggregation returns array
    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User channel fetched successfully")
        )
})

// ============================================
// EXPORT CONTROLLERS
// ============================================
export { 
    // Authentication Controllers
    registerUser,           // POST /register - Create new user account
    loginUser,              // POST /login - Authenticate and get tokens
    logoutUser,             // POST /logout - Clear tokens and session
    refreshAccessToken,     // POST /refreshToken - Get new access token
    
    // User Profile Controllers
    getCurrentUser,         // GET /current-user - Get authenticated user info
    changeCurrentPassword,  // POST /change-password - Update user password
    updateAccountDetails,   // PATCH /update-account - Update name/email
    updateUserAvatar,       // PATCH /avatar - Update profile picture
    updateUserCoverImg,     // PATCH /cover-image - Update cover/banner image
    getUserChannelProfile
}