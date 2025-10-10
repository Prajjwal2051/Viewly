// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { Router } from "express";
import { 
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImg
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// ============================================
// INITIALIZE ROUTER
// ============================================
const router = Router()

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * USER REGISTRATION ROUTE
 * Allows new users to create an account
 * 
 * Middleware:
 * - upload.fields() - Handles multipart/form-data for file uploads
 *   - avatar: Required profile picture (max 1 file)
 *   - coverimage: Optional cover image (max 1 file)
 * 
 * @route POST /api/v1/users/register
 * @access Public
 */
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",      // Field name for profile picture
            maxCount: 1          // Only allow 1 avatar file
        },
        {
            name: "coverimage",  // Field name for cover image
            maxCount: 1          // Only allow 1 cover image file
        }
    ]),
    registerUser  // Controller function to handle registration
)

/**
 * USER LOGIN ROUTE
 * Authenticates user and returns access/refresh tokens
 * 
 * @route POST /api/v1/users/login
 * @access Public
 */
router.route("/login").post(loginUser)

/**
 * REFRESH ACCESS TOKEN ROUTE
 * Generates new access token using valid refresh token
 * Allows users to stay logged in without re-entering credentials
 * 
 * Note: Placed here because it's technically a public route
 * (doesn't require verifyJWT middleware, just a valid refresh token)
 * 
 * @route POST /api/v1/users/refresh-token
 * @access Public (requires valid refresh token in cookie or body)
 */
router.route("/refresh-token").post(refreshAccessToken)

// ============================================
// PROTECTED ROUTES (Authentication Required)
// All routes below require verifyJWT middleware
// ============================================

/**
 * USER LOGOUT ROUTE
 * Logs out authenticated user by clearing tokens and session
 * 
 * Middleware:
 * - verifyJWT - Validates access token and attaches user to request
 * 
 * @route POST /api/v1/users/logout
 * @access Private
 */
router.route("/logout").post(verifyJWT, logoutUser)

/**
 * GET CURRENT USER ROUTE
 * Returns currently authenticated user's profile information
 * 
 * Use Cases:
 * - Display user profile in navbar/header
 * - Verify authentication status
 * - Refresh user data after updates
 * 
 * Middleware:
 * - verifyJWT - Ensures user is authenticated
 * 
 * @route GET /api/v1/users/current-user
 * @access Private
 */
router.route("/current-user").get(verifyJWT, getCurrentUser)

/**
 * CHANGE PASSWORD ROUTE
 * Allows authenticated user to change their password
 * 
 * Security:
 * - Requires old password verification
 * - New password is automatically hashed
 * 
 * Middleware:
 * - verifyJWT - Ensures user is authenticated
 * 
 * @route POST /api/v1/users/change-password
 * @access Private
 */
router.route("/change-password").post(verifyJWT, changeCurrentPassword)

/**
 * UPDATE ACCOUNT DETAILS ROUTE
 * Updates user's basic text information (fullName, email)
 * 
 * Design Note:
 * - Separate from file uploads for efficiency
 * - No need for multipart/form-data middleware
 * 
 * Middleware:
 * - verifyJWT - Ensures user is authenticated
 * 
 * @route PATCH /api/v1/users/update-account
 * @access Private
 */
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

/**
 * UPDATE AVATAR ROUTE
 * Updates user's profile picture (avatar)
 * 
 * File Upload:
 * - Accepts single image file
 * - Field name must be 'avatar'
 * - File temporarily stored by multer, then uploaded to Cloudinary
 * 
 * Middleware:
 * - verifyJWT - Ensures user is authenticated
 * - upload.single('avatar') - Handles file upload
 * 
 * @route PATCH /api/v1/users/avatar
 * @access Private
 */
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

/**
 * UPDATE COVER IMAGE ROUTE
 * Updates user's cover/banner image
 * 
 * File Upload:
 * - Accepts single image file
 * - Field name must be 'coverImage'
 * - File temporarily stored by multer, then uploaded to Cloudinary
 * 
 * Middleware:
 * - verifyJWT - Ensures user is authenticated
 * - upload.single('coverImage') - Handles file upload
 * 
 * @route PATCH /api/v1/users/cover-image
 * @access Private
 */
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImg)

/**
 * GET USER CHANNEL PROFILE ROUTE
 * Fetches comprehensive channel information by username
 * 
 * Features:
 * - Subscriber count (how many people follow this channel)
 * - Subscribed-to count (how many channels this user follows)
 * - Subscription status (is current user subscribed?)
 * - Uses MongoDB aggregation for efficient querying
 * 
 * URL Parameters:
 * - username: Channel username to fetch
 * 
 * Note: Technically public (anyone can view channels)
 * but subscription status only shown if user is authenticated
 * 
 * @route GET /api/v1/users/c/:username
 * @access Public (subscription status requires auth)
 */
router.route("/c/:username").get(getUserChannelProfile)

/**
 * GET WATCH HISTORY ROUTE
 * Fetches authenticated user's video watch history
 * 
 * Features:
 * - Returns all watched videos with complete details
 * - Includes video owner/channel information
 * - Uses nested aggregation pipeline for efficiency
 * 
 * Response includes:
 * - Video details (title, thumbnail, duration, etc.)
 * - Owner details (channel name, avatar)
 * 
 * Middleware:
 * - verifyJWT - Ensures user is authenticated
 * 
 * @route GET /api/v1/users/watch-history
 * @access Private
 */
router.route("/watch-history").get(verifyJWT, getWatchHistory)

// ============================================
// EXPORT ROUTER
// ============================================
export default router