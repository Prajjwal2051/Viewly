// ============================================================
// Copyright (c) 2026 Prajjwal (github.com/Prajjwal2051)
// Project : VidNest — Video Sharing Platform
// License : Proprietary — All Rights Reserved
// Unauthorized copying, modification, or distribution of this
// file, via any medium, is strictly prohibited.
// ============================================================
// ============================================
// IMPORT DEPENDENCIES
// ============================================
import jwt from "jsonwebtoken" // Fixed: Should be default import, not named import
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { getCache, setCache, deleteCache, deleteCachePattern } from "../db/redis.js"

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
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "")

        // STEP 2: Validate token exists
        if (!token) {
            throw new ApiError(401, "Unauthorized access - No token provided")
        }

        // STEP 3: Verify and decode the JWT token
        // This checks if token is valid, not expired, and signed with our secret
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // first we will verify session from the redis
        const sessionKey = `session:${decodedToken._id}:${token}`
        // now i will try to get user frok redis session
        let RedisUser = await getCache(sessionKey)
        if (RedisUser) {
            console.log(
                `Session Cache Hit for User: ${decodedToken._id}:${token}`
            )
            req.user = RedisUser
            return next()
        }
        console.log(`Session cache MISS for user ${decodedToken._id}`)

        // STEP 4: Fetch user from database using decoded user ID
        // Exclude sensitive fields (password, refreshToken) from the result
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )

        // STEP 5: Validate user exists (token might be valid but user deleted)
        if (!user) {
            throw new ApiError(401, "Invalid access token - User not found")
        }

        // making a user session (ttl= 1day= 86400 seconds)
        await setCache(sessionKey, user, 86400)

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

/**
 * LOGOUT WITH SESSION INVALIDATION
 * Clears Redis session cache on logout
 */
export const logout = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const token = req.cookies?.accessToken

    // Delete session from Redis
    if (token) {
        const sessionKey = `session:${userId}:${token}`
        await deleteCache(sessionKey)
        console.log(`Session invalidated for user ${userId}`)
    }

    // Clear refresh token from database
    await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1 },
    })

    // Clear cookies
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

/**
 * LOGOUT ALL DEVICES
 * Invalidates all sessions for a user
 */
export const logoutAllDevices = asyncHandler(async (req, res) => {
    const userId = req.user._id

    // Delete all session keys for this user
    await deleteCachePattern(`session:${userId}:*`)
    console.log(`All sessions invalidated for user ${userId}`)

    // Clear refresh token from database
    await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1 },
    })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Logged out from all devices"))
})
