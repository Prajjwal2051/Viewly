// ============================================
// RATE LIMITER MIDDLEWARE
// ============================================
// Prevents spam and abuse by limiting request rates

import rateLimit, { ipKeyGenerator } from "express-rate-limit"

/**
 * GENERAL API RATE LIMITER
 * Applies to all API routes
 * Prevents general API abuse
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3000, // Limit each IP to 3000 requests per windowMs
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip successful requests (only count errors)
    skipSuccessfulRequests: false,
})

/**
 * AUTHENTICATION RATE LIMITER
 * Stricter limits for login/register routes
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message:
            "Too many authentication attempts from this IP, please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
})

/**
 * UPLOAD RATE LIMITER
 * Limits video and tweet uploads
 * Prevents spam content
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // Limit each user to 1000 uploads per hour
    message: {
        success: false,
        message: "Upload limit reached. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use user ID instead of IP for authenticated routes
    keyGenerator: (req) => {
        return req.user?._id?.toString() || ipKeyGenerator(req)
    },
})

/**
 * COMMENT RATE LIMITER
 * Limits comment creation
 * Prevents comment spam
 */
export const commentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // Limit each user to 1000 comments per hour
    message: {
        success: false,
        message: "Comment limit reached. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?._id?.toString() || ipKeyGenerator(req)
    },
})

/**
 * LIKE RATE LIMITER
 * Limits like/unlike actions
 * Prevents like manipulation
 */
export const likeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2000, // Limit each user to 2000 likes per hour
    message: {
        success: false,
        message: "Like limit reached. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?._id?.toString() || ipKeyGenerator(req)
    },
})

/**
 * SEARCH RATE LIMITER
 * Limits search requests
 * Prevents search abuse
 */
export const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 searches per 15 minutes
    message: {
        success: false,
        message: "Too many search requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
})
