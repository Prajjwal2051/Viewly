// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken" // Fixed: jwt is a default export, not named export
import mongoose from "mongoose"

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
const generateAccessAndRefreshToken = async (userId) => {
    try {
        // Find user in database by ID
        const user = await User.findById(userId)

        // Generate access token (short-lived, contains user info)
        const accessToken = user.generateAccessToken()

        // Generate refresh token (long-lived, contains only user ID)
        const refreshToken = user.generateRefreshToken()

        // Save refresh token to database for session management
        user.refreshToken = refreshToken

        // Save without running validation (password is already hashed)
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(
            500,
            "something went wrong while generating refresh and access token"
        )
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
    console.log("\n========================================")
    console.log("👤 [USER REGISTRATION] Request received")
    console.log("========================================")
    console.log("📧 Email:", email)
    console.log("👤 Username:", username)
    console.log("📝 Full Name:", fullName)

    // STEP 2: Validate input fields - ensure no fiel   d is empty or contains only whitespace
    if (
        [fullName, email, username, password].some((field) => {
            field?.trim() === ""
        })
    ) {
        throw new ApiError(400, "all fields are required")
    }

    // STEP 3: Check if user already exists with the same username or email
    // This prevents duplicate accounts and maintains data integrity
    console.log("🔍 [STEP 3] Checking for existing user in database...")
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    })
    if (existedUser) {
        console.log(
            "❌ REGISTRATION FAILED: User already exists with this username or email"
        )
        throw new ApiError(409, "user already exists")
    }
    console.log("✅ No duplicate found - proceeding with registration")

    // STEP 4: Extract local file paths for uploaded images
    // Multer middleware stores uploaded files temporarily on the server
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImgLocalPath = req.files?.coverimage[0]?.path
    let coverImgLocalPath
    if (
        req.files &&
        Array.isArray(req.files.coverimage) &&
        req.files.coverimage.length > 0
    ) {
        coverImgLocalPath = req.files.coverimage[0].path
    }
    console.log("📂 [STEP 4] Files received:")
    console.log(
        "   - Avatar:",
        avatarLocalPath ? "✅ " + avatarLocalPath : "❌ Missing"
    )
    console.log(
        "   - Cover Image:",
        coverImgLocalPath
            ? "✅ " + coverImgLocalPath
            : "⚠️  Optional (not provided)"
    )

    // STEP 5: Validate avatar is provided (mandatory field)
    if (!avatarLocalPath) {
        console.log("❌ REGISTRATION FAILED: Avatar is required")
        throw new ApiError(400, "avatar is required")
    }

    // STEP 6: Upload images to Cloudinary cloud storage
    // Avatar is mandatory, cover image is optional
    console.log("☁️  [STEP 6] Uploading files to Cloudinary...")
    console.log("   - Uploading avatar...")
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log("   - Avatar upload:", avatar ? "✅ Success" : "❌ Failed")

    if (coverImgLocalPath) {
        console.log("   - Uploading cover image...")
    }
    const coverImg = await uploadOnCloudinary(coverImgLocalPath)
    if (coverImgLocalPath) {
        console.log(
            "   - Cover image upload:",
            coverImg ? "✅ Success" : "❌ Failed"
        )
    }

    // STEP 7: Verify avatar upload was successful
    if (!avatar) {
        console.log(
            "❌ REGISTRATION FAILED: Avatar upload to Cloudinary failed"
        )
        throw new ApiError(400, "avatar upload failed")
    }
    console.log("✅ All files uploaded successfully to Cloudinary")

    // STEP 8: Create user entry in database with all validated data
    // Password will be automatically hashed by the pre-save middleware in user model
    console.log("💾 [STEP 8] Creating user in database...")
    console.log("   - Username:", username.toLowerCase())
    console.log("   - Email:", email)
    console.log("   - Avatar URL:", avatar.url)
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImg: coverImg?.url || "", // Optional field, empty string if not provided
        email,
        password, // Will be hashed before saving
        username: username.toLowerCase(), // Ensure consistency with lowercase usernames
    })
    console.log("✅ User created with ID:", user._id)

    // STEP 9: Retrieve created user from database, excluding sensitive fields
    // The select() method with "-" prefix removes specified fields from the response
    console.log(
        "🔍 [STEP 9] Fetching created user (excluding sensitive data)..."
    )
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // STEP 10: Verify user was successfully created in database
    if (!createdUser) {
        console.log("❌ REGISTRATION FAILED: User creation verification failed")
        throw new ApiError(
            500,
            "something went wrong while registering the user"
        )
    }

    console.log("========================================")
    console.log(`✅ REGISTRATION SUCCESS: @${username}`)
    console.log(`   User ID: ${user._id}`)
    console.log("========================================\n")

    // STEP 11: Send success response with user data (without sensitive information)
    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "user registered successfully"))
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
    // Accept either the combined 'usernameOrEmail' field (from frontend) or separate fields
    const { email, username, password, usernameOrEmail } = req.body

    // Use usernameOrEmail if provided, otherwise fall back to separate fields
    const loginIdentifier = usernameOrEmail || username || email

    console.log("\n========================================")
    console.log("🔐 [USER LOGIN] Request received")
    console.log("========================================")
    console.log("📧 Login with:", loginIdentifier)

    // STEP 2: Validate that at least username or email is provided
    // User can login with either username OR email
    if (!loginIdentifier) {
        console.log("❌ LOGIN FAILED: No username or email provided")
        throw new ApiError(400, "username or email is required")
    }

    // STEP 3: Find user in database by username OR email
    // $or operator allows matching either field
    console.log("🔍 [STEP 3] Searching for user in database...")
    const user = await User.findOne({
        $or: [{ username: loginIdentifier }, { email: loginIdentifier }],
    })

    // STEP 4: Check if user exists in database
    if (!user) {
        console.log("❌ LOGIN FAILED: User not found in database")
        throw new ApiError(404, "user does not exist")
    }

    console.log(`✅ User found: @${user.username} (ID: ${user._id})`)

    // STEP 5: Verify password using bcrypt comparison
    // isPasswordCorrect is a custom method defined in user model
    console.log("🔑 [STEP 5] Verifying password...")
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        console.log("❌ LOGIN FAILED: Invalid password")
        throw new ApiError(401, "invalid user credentials")
    }

    console.log("✅ Password verified successfully")

    // STEP 6: Generate access and refresh tokens for the user
    console.log("🎫 [STEP 6] Generating access and refresh tokens...")
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    )
    console.log("✅ Tokens generated successfully")

    // STEP 7: Retrieve user data without sensitive information
    console.log(
        "🔍 [STEP 7] Fetching user data (excluding password & refresh token)..."
    )
    const loggedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // STEP 8: Configure cookie options for security
    const options = {
        httpOnly: true, // Prevents client-side JavaScript from accessing cookies (XSS protection)
        secure: true, // Ensures cookies are only sent over HTTPS in production
    }

    console.log("🍪 [STEP 8] Setting secure cookies...")
    console.log("========================================")
    console.log(`✅ LOGIN SUCCESS: @${user.username}`)
    console.log(`   User ID: ${user._id}`)
    console.log(`   Email: ${user.email}`)
    console.log("========================================\n")

    // STEP 9: Send response with cookies and user data
    return res
        .status(200)
        .cookie("accessToken", accessToken, options) // Set access token cookie
        .cookie("refreshToken", refreshToken, options) // Set refresh token cookie
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedUser, // User data without sensitive fields
                    accessToken, // Also send tokens in response body for mobile apps
                    refreshToken,
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
    console.log("\n========================================")
    console.log("🚪 [USER LOGOUT] Request received")
    console.log("========================================")
    console.log(`👤 User: @${req.user?.username}`)
    console.log(`   User ID: ${req.user?._id}`)

    // STEP 1: Remove refresh token from database
    // This invalidates the user's session on the server side
    console.log("🗑️ [STEP 1] Clearing refresh token from database...")
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined, // Clear the refresh token
            },
        },
        {
            new: true, // Return the updated document
        }
    )
    console.log("✅ Refresh token cleared from database")

    // STEP 2: Configure cookie options for clearing
    const options = {
        httpOnly: true, // Prevent client-side JS access
        secure: true, // Only send over HTTPS
    }

    console.log("🍪 [STEP 2] Clearing cookies from client...")
    console.log("========================================")
    console.log(`✅ LOGOUT SUCCESS: @${req.user?.username}`)
    console.log("========================================\n")

    // STEP 3: Clear cookies and send success response
    return res
        .status(200)
        .clearCookie("accessToken", options)
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
        console.log("\n========================================")
        console.log("🔄 [TOKEN REFRESH] Request received")
        console.log("========================================")

        // STEP 1: Extract refresh token from cookies (web) or body (mobile)
        const incomingRefreshToken =
            req.cookies.refreshToken || req.body.refreshToken

        // STEP 2: Validate refresh token is provided
        if (!incomingRefreshToken) {
            console.log("❌ REFRESH FAILED: No refresh token provided")
            throw new ApiError(
                401,
                "Unauthorized request - Refresh token required"
            )
        }

        console.log(
            "🔍 [STEP 3] Verifying refresh token signature and expiry..."
        )

        // STEP 3: Verify and decode the refresh token
        // This checks signature, expiry, and decodes the payload
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        console.log(
            "✅ Token signature valid, decoded user ID:",
            decodedToken?._id
        )

        // STEP 4: Find user in database using decoded user ID
        console.log("🔍 [STEP 4] Finding user in database...")
        const user = await User.findById(decodedToken?._id)

        // STEP 5: Validate user exists
        if (!user) {
            console.log("❌ REFRESH FAILED: User not found for token")
            throw new ApiError(401, "Invalid refresh token - User not found")
        }

        console.log(`✅ User found: @${user.username}`)

        // STEP 6: Compare incoming token with stored token in database
        // This prevents reuse of old/stolen refresh tokens (token rotation)
        console.log("🔒 [STEP 6] Validating token against database...")
        if (incomingRefreshToken !== user?.refreshToken) {
            console.log(
                "❌ REFRESH FAILED: Token mismatch - possible reuse or theft detected"
            )
            throw new ApiError(401, "Refresh token is expired or already used")
        }
        console.log("✅ Token matches database record")

        // STEP 7: Configure secure cookie options
        const options = {
            httpOnly: true, // Prevent XSS attacks
            secure: true, // Only send over HTTPS
        }

        // STEP 8: Generate new access and refresh tokens
        console.log("🎫 [STEP 8] Generating new token pair...")
        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshToken(user._id)

        console.log("========================================")
        console.log(`✅ REFRESH SUCCESS: @${user.username}`)
        console.log("   New tokens generated and stored")
        console.log("========================================\n")

        // STEP 9: Send new tokens in cookies and response body
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "Access token refreshed successfully"
                )
            )
    } catch (error) {
        // Handle JWT errors (expired, invalid signature, malformed, etc.)
        console.log("========================================")
        console.log("❌ TOKEN REFRESH ERROR")
        console.log("   Error:", error.message)
        console.log("========================================\n")
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
    console.log("🔒 [CHANGE PASSWORD] Request received")
    console.log(`👤 User: @${req.user?.username}`)

    // STEP 1: Extract passwords from request body
    const { oldPassword, newPassword } = req.body

    // STEP 2: Validate both passwords are provided
    if (!oldPassword || !newPassword) {
        console.log("❌ Missing password fields")
        throw new ApiError(400, "Both old and new passwords are required")
    }

    // STEP 3: Find user in database (req.user added by auth middleware)
    const user = await User.findById(req.user?._id)

    // STEP 4: Verify old password is correct using bcrypt comparison
    console.log("🔑 Verifying old password...")
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        console.log("❌ Old password incorrect")
        throw new ApiError(400, "Invalid old password")
    }

    console.log("✅ Old password verified")

    // STEP 5: Set new password (will be hashed by pre-save middleware)
    user.password = newPassword

    // STEP 6: Save user with new password
    // validateBeforeSave: false skips validation since we're only updating password
    console.log("💾 Updating password in database...")
    await user.save({ validateBeforeSave: false })

    console.log(`✅ Password changed successfully for @${user.username}`)

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
    console.log("👤 [GET CURRENT USER] Request received")
    console.log(`📋 Fetching data for: @${req.user?.username}`)

    // STEP 1: Return authenticated user data from request
    // No database query needed - data comes from middleware
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current user fetched successfully")
        )
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
    console.log("✏️ [UPDATE ACCOUNT] Request received")
    console.log(`👤 User: @${req.user?.username}`)

    // STEP 1: Extract fields to update from request body
    const { fullName, email } = req.body

    // STEP 2: Validate both fields are provided
    // If only updating one field, consider making this more flexible
    if (!fullName || !email) {
        console.log("❌ Missing required fields")
        throw new ApiError(400, "All fields are required")
    }

    console.log(`📝 Updating: Name="${fullName}", Email="${email}"`)

    // STEP 3: Update user in database
    // findByIdAndUpdate is more efficient than find + save for simple updates
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName, // Shorthand for fullName: fullName
                email, // Shorthand for email: email
            },
        },
        { new: true } // Return updated document instead of original
    ).select("-password") // Exclude password from response

    console.log(`✅ Account details updated for @${req.user?.username}`)

    // STEP 4: Send success response with updated user data
    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        )
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
    console.log("🖼️ [UPDATE AVATAR] Request received")
    console.log(`👤 User: @${req.user?.username}`)

    const localAvatarPath = req.file?.path

    if (!localAvatarPath) {
        console.log("❌ No avatar file uploaded")
        throw new ApiError(400, "Avatar file is missing")
    }

    console.log("📁 Avatar file received:", req.file?.originalname)

    // Upload NEW avatar
    console.log("☁️ Uploading avatar to Cloudinary...")
    const avatar = await uploadOnCloudinary(localAvatarPath)

    if (!avatar.url) {
        console.log("❌ Cloudinary upload failed")
        throw new ApiError(400, "Error while uploading avatar to cloud storage")
    }

    console.log("✅ Avatar uploaded to cloud")

    // DELETE OLD AVATAR (Cleanup)
    if (req.user?.avatar) {
        console.log("🧹 Cleaning up old avatar from Cloudinary...")
        const oldAvatarPublicId = await getPublicId(req.user.avatar)
        if (oldAvatarPublicId) {
            await deleteFromCloudinary(oldAvatarPublicId, "image")
            console.log("✅ Old avatar deleted")
        }
    }

    console.log("💾 Updating database...")
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password")

    console.log(`✅ Avatar updated successfully for @${req.user?.username}`)

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"))
})

const updateUserCoverImg = asyncHandler(async (req, res) => {
    console.log("🖼️ [UPDATE COVER IMAGE] Request received")
    console.log(`👤 User: @${req.user?.username}`)

    const localCoverImgPath = req.file?.path

    if (!localCoverImgPath) {
        console.log("❌ No cover image file uploaded")
        throw new ApiError(400, "Cover image file is missing")
    }

    console.log("📁 Cover image file received:", req.file?.originalname)

    // Upload NEW cover image
    console.log("☁️ Uploading cover image to Cloudinary...")
    // Use resize/crop options for cover image to save more bandwidth?
    // Let's stick to auto/auto for now as per plan, user can optimize more later.
    const coverImg = await uploadOnCloudinary(localCoverImgPath)

    if (!coverImg.url) {
        console.log("❌ Cloudinary upload failed")
        throw new ApiError(
            400,
            "Error while uploading cover image to cloud storage"
        )
    }

    console.log("✅ Cover image uploaded to cloud")

    // DELETE OLD COVER IMAGE (Cleanup)
    const oldCoverUrl = req.user?.coverimage || req.user?.coverImg // Check both legacy fields just in case
    if (oldCoverUrl) {
        console.log("🧹 Cleaning up old cover image from Cloudinary...")
        const oldCoverPublicId = await getPublicId(oldCoverUrl)
        if (oldCoverPublicId) {
            await deleteFromCloudinary(oldCoverPublicId, "image")
            console.log("✅ Old cover image deleted")
        }
    }

    console.log("💾 Updating database...")
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverimage: coverImg.url,
            },
        },
        { new: true }
    ).select("-password")

    console.log(
        `✅ Cover image updated successfully for @${req.user?.username}`
    )

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
    console.log("📺 [GET CHANNEL PROFILE] Request received")

    // STEP 1: Extract username from URL parameters
    const { username } = req.params
    console.log(`🔍 Looking for channel: @${username}`)

    // STEP 2: Validate username is provided and not empty
    if (!username?.trim()) {
        console.log("❌ Username missing in request")
        throw new ApiError(400, "Username is missing")
    }

    console.log("🔄 Running aggregation pipeline...")

    // STEP 3: MongoDB Aggregation Pipeline to fetch channel data with stats
    const channel = await User.aggregate([
        // STAGE 1: Match the user by username
        // Filter documents to find the specific user/channel
        {
            $match: {
                username: username?.toLowerCase(), // Match username (case-insensitive)
            },
        },

        // STAGE 2: Lookup subscribers
        // Find all users who subscribed TO this channel
        {
            $lookup: {
                from: "subscriptions", // Collection name (lowercase + 's')
                localField: "_id", // User's ID
                foreignField: "channel", // Match with channel field in subscriptions
                as: "subscribers", // Store results in 'subscribers' array
            },
        },

        // STAGE 3: Lookup subscribed-to channels
        // Find all channels this user has subscribed TO
        {
            $lookup: {
                from: "subscriptions", // Same collection, different relationship
                localField: "_id", // User's ID
                foreignField: "subscriber", // Match with subscriber field
                as: "subscribedTo", // Store results in 'subscribedTo' array
            },
        },

        // STAGE 4: Add computed fields
        // Calculate subscriber counts and subscription status
        {
            $addFields: {
                // Count total subscribers (people who subscribed to this channel)
                subscribersCount: {
                    $size: "$subscribers",
                },

                // Count how many channels this user subscribes to
                channelsSubscribedToCount: {
                    $size: "$subscribedTo",
                },

                // Check if current logged-in user is subscribed to this channel
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },

        // STAGE 5: Project only required fields
        // Select which fields to include in final output
        {
            $project: {
                fullName: 1, // Include
                username: 1, // Include
                subscribersCount: 1, // Include (computed)
                channelsSubscribedToCount: 1, // Include (computed)
                isSubscribed: 1, // Include (computed)
                avatar: 1, // Include
                coverimage: 1, // Include (note: field name from model)
                email: 1, // Include
            },
        },
    ])

    // STEP 4: Validate channel exists
    // Aggregation returns array, check if it has results
    if (!channel?.length) {
        console.log(`❌ Channel @${username} not found`)
        throw new ApiError(404, "Channel does not exist")
    }

    console.log(
        `✅ Channel @${username} profile fetched (${channel[0].subscribersCount} subscribers)`
    )

    // STEP 5: Send channel profile data
    // channel[0] because aggregation returns array
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "User channel fetched successfully"
            )
        )
})

/**
 * GET WATCH HISTORY CONTROLLER
 * Fetches authenticated user's video watch history with complete video and owner details
 *
 * Purpose:
 * - Display user's recently watched videos
 * - Show video details along with channel/owner information
 * - Uses nested aggregation pipeline (sub-pipeline) for efficient data fetching
 *
 * Features:
 * - Fetches all videos from watch history array
 * - Includes video owner details (channel name, avatar)
 * - Uses sub-pipeline to populate nested references
 * - Returns complete video objects with owner information
 *
 * Aggregation Pipeline Architecture:
 * Main Pipeline → Match User → Lookup Videos
 *                                    ↓
 *                         Sub-Pipeline → Lookup Video Owner → Project Owner Fields
 *
 * Process:
 * 1. Match current authenticated user
 * 2. Lookup videos from watchHistory array (with sub-pipeline)
 *    2a. For each video, lookup its owner (channel)
 *    2b. Project only required owner fields
 *    2c. Convert owner array to object
 * 3. Return watch history with complete video and owner data
 *
 * @route GET /api/v1/users/watch-history
 * @access Private (requires authentication)
 */
const getWatchHistory = asyncHandler(async (req, res) => {
    console.log("📜 [GET WATCH HISTORY] Request received")
    console.log(`👤 User: @${req.user?.username}`)
    console.log("🔄 Running nested aggregation pipeline...")

    // STEP 1: MongoDB Aggregation Pipeline with nested lookups
    const user = await User.aggregate([
        // STAGE 1: Match current authenticated user
        // Convert string ID to MongoDB ObjectId for matching
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },

        // STAGE 2: Lookup videos from watch history
        // This is the MAIN LOOKUP - gets all videos user has watched
        {
            $lookup: {
                from: "videos", // Videos collection
                localField: "watchHistory", // Array of video IDs in user document
                foreignField: "_id", // Match with video's _id
                as: "watchHistory", // Replace watchHistory array with full video documents

                // SUB-PIPELINE: Executes for EACH video in watch history
                // This is a nested aggregation that runs on the video documents
                pipeline: [
                    // SUB-STAGE 1: Lookup video owner (channel) details
                    // For each video, find who uploaded it
                    {
                        $lookup: {
                            from: "users", // Users collection
                            localField: "owner", // Video's owner field (user ID who uploaded)
                            foreignField: "_id", // Match with user's _id
                            as: "owner", // Store owner details in 'owner' array

                            // NESTED SUB-PIPELINE: Executes for the owner
                            // Controls what owner data to include
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1, // Include channel full name
                                        username: 1, // Include channel username
                                        avatar: 1, // Include channel avatar
                                    },
                                },
                            ],
                        },
                    },

                    // SUB-STAGE 2: Convert owner array to single object
                    // $lookup returns array, but we want single owner object
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner", // Get first (and only) element from owner array
                            },
                        },
                    },
                ],
            },
        },
    ])

    console.log(
        `✅ Watch history fetched (${user[0]?.watchHistory?.length || 0} videos)`
    )

    // STEP 2: Send watch history data
    // user[0] because aggregation returns array with single user document
    // Access watchHistory field which now contains full video objects with owner details
    return res.status(200).json(
        new ApiResponse(
            200,
            user[0].watchHistory, // Fixed: was user[0].getWatchHistory (typo)
            "Watch history fetched successfully"
        )
    )
})

// ============================================
// PASSWORD RESET CONTROLLERS
// ============================================

/**
 * FORGOT PASSWORD CONTROLLER
 * Sends password reset email to user
 *
 * Process:
 * 1. Validate email input
 * 2. Find user by email
 * 3. Generate reset token and save to database
 * 4. Send reset email
 * 5. Handle errors gracefully
 *
 * Security Note: Don't reveal if user exists
 *
 * @route POST /api/v1/users/forgot-password
 * @access Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body

    // Validate email
    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
        // Don't reveal if user exists (security best practice)
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "If an account exists with this email, a password reset link has been sent"
                )
            )
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken()
    await user.save({ validateBeforeSave: false })

    try {
        // Send email
        const { sendPasswordResetEmail } = await import(
            "../utils/emailService.js"
        )
        await sendPasswordResetEmail(email, resetToken, user.fullName)

        res.status(200).json(
            new ApiResponse(200, {}, "Password reset link sent to your email")
        )
    } catch (error) {
        // Clear reset token if email fails
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false })

        console.error("Email sending error:", error)
        throw new ApiError(500, "Error sending email. Please try again later.")
    }
})

/**
 * RESET PASSWORD CONTROLLER
 * Resets user password using token from email
 *
 * Process:
 * 1. Validate inputs (password, confirmPassword)
 * 2. Hash token from URL
 * 3. Find user with valid, non-expired token
 * 4. Update password
 * 5. Clear reset token
 *
 * @route POST /api/v1/users/reset-password/:token
 * @access Public
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params
    const { password, confirmPassword } = req.body

    // Validate inputs
    if (!password || !confirmPassword) {
        throw new ApiError(400, "Password and confirm password are required")
    }

    if (password !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match")
    }

    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters")
    }

    // Hash the token from URL (to match hashed token in DB)
    const crypto = require("crypto")
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    // Find user with valid token
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }, // Token not expired
    })

    if (!user) {
        throw new ApiError(400, "Invalid or expired reset token")
    }

    // Update password
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password reset successful. Please login with your new password."
        )
    )
})

// ============================================
// EXPORT CONTROLLERS
// ============================================
export {
    // Authentication Controllers
    registerUser, // POST /register - Create new user account
    loginUser, // POST /login - Authenticate and get tokens
    logoutUser, // POST /logout - Clear tokens and session
    refreshAccessToken, // POST /refreshToken - Get new access token

    // User Profile Controllers
    getCurrentUser, // GET /current-user - Get authenticated user info
    changeCurrentPassword, // POST /change-password - Update user password
    updateAccountDetails, // PATCH /update-account - Update name/email
    updateUserAvatar, // PATCH /avatar - Update profile picture
    updateUserCoverImg, // PATCH /cover-image - Update cover/banner image

    // Channel & History Controllers
    getUserChannelProfile, // GET /c/:username - Get channel profile with subscriber stats
    getWatchHistory, // GET /watch-history - Get user's watched videos with owner details

    // Password Reset Controllers
    forgotPassword, // POST /forgot-password - Send password reset email
    resetPassword, // POST /reset-password/:token - Reset password with token
}
