// ============================================
// IMPORT DEPENDENCIES
// ============================================
import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
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

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

/**
 * USER LOGOUT ROUTE
 * Logs out authenticated user by clearing tokens
 * 
 * Middleware:
 * - verifyJWT - Validates access token and attaches user to request
 * 
 * @route POST /api/v1/users/logout
 * @access Private
 */
router.route("/logout").post(verifyJWT, logoutUser)  // Fixed: Changed 'route' to 'router'

// ============================================
// EXPORT ROUTER
// ============================================
export default router