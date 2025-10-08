// ============================================
// IMPORT DEPENDENCIES
// ============================================
import jwt from "jsonwebtoken";  // Fixed: Should be default import, not named import
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * VERIFY JWT TOKEN MIDDLEWARE
 * Authenticates incoming requests by verifying JWT access tokens
 * 
 * Process:
 * 1. Extract token from cookies or Authorization header
 * 2. Verify token validity using JWT secret
 * 3. Decode token to get user ID
 * 4. Fetch user from database
 * 5. Attach user object to request for use in route handlers
 * 
 * Token Sources (in order of priority):
 * - Cookie: req.cookies.accessToken
 * - Header: Authorization: Bearer <token>
 * 
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ApiError} 401 - If token is missing, invalid, or user not found
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // STEP 1: Extract token from cookies or Authorization header
        // Check cookies first (web apps), then Authorization header (mobile/API clients)
        const token = req.cookies?.acessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        // STEP 2: Validate token exists
        if (!token) {
            throw new ApiError(401, "Unauthorized access - No token provided")
        }
        
        // STEP 3: Verify and decode the JWT token
        // This checks if token is valid, not expired, and signed with our secret
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        // STEP 4: Fetch user from database using decoded user ID
        // Exclude sensitive fields (password, refreshToken) from the result
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        
        // STEP 5: Validate user exists (token might be valid but user deleted)
        if (!user) {
            throw new ApiError(401, "Invalid access token - User not found")
        }
    
        // STEP 6: Attach user object to request for use in protected routes
        // Now route handlers can access authenticated user via req.user
        req.user = user
        
        // STEP 7: Continue to next middleware or route handler
        next()
        
    } catch (error) {
        // Handle JWT verification errors (expired, malformed, invalid signature, etc.)
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})