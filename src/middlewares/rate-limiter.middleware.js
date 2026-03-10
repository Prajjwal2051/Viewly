// ============================================
// RATE LIMITER MIDDLEWARE
// ============================================
// Prevents spam and abuse by limiting request rates

import rateLimit from "express-rate-limit"
// RedisStore from rate-limit-redis v4 — uses sendCommand API (not the v3 `client` option)
import { RedisStore } from "rate-limit-redis"
// Shared ioredis client from the redis module
import redisClient from "../db/redis.js"

/**
 * GENERAL API RATE LIMITER
 * Applies to all API routes
 * Prevents general API abuse
 */
export const generalLimiter = rateLimit({
    // rate-limit-redis v4: pass sendCommand so the store speaks to ioredis correctly
    store: new RedisStore({
        sendCommand: (...args) => redisClient.client.call(...args),
        prefix: "ratelimit:general:", // Redis key prefix
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
        statusCode: 429,
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
    store: new RedisStore({
        sendCommand: (...args) => redisClient.client.call(...args),
        prefix: "ratelimit:auth:",
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        statusCode: 429,
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
    store: new RedisStore({
        sendCommand: (...args) => redisClient.client.call(...args),
        prefix: "ratelimit:upload:",
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // Limit each user to 1000 uploads per hour
    message: {
        statusCode: 429,
        success: false,
        message: "Upload limit reached. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use authenticated user ID as key so limits are per-user, not per-IP
    keyGenerator: (req) => {
        return req.user?._id?.toString() || req.ip
    },
})

/**
 * COMMENT RATE LIMITER
 * Limits comment creation
 * Prevents comment spam
 */
export const commentLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.client.call(...args),
        prefix: "ratelimit:interaction:",
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // Limit each user to 1000 comments per hour
    message: {
        statusCode: 429,
        success: false,
        message: "Comment limit reached. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?._id?.toString() || req.ip
    },
})

/**
 * LIKE RATE LIMITER
 * Limits like/unlike actions
 * Prevents like manipulation
 */
export const likeLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.client.call(...args),
        prefix: "ratelimit:interaction:",
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2000, // Limit each user to 2000 likes per hour
    message: {
        statusCode: 429,
        success: false,
        message: "Like limit reached. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?._id?.toString() || req.ip
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
