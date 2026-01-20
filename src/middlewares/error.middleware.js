// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
// Centralized error handling for all API routes
// Catches errors from async handlers and formats them as JSON responses

import { ApiError } from "../utils/ApiError.js"

/**
 * ERROR HANDLER MIDDLEWARE
 * Catches all errors thrown in the application and formats them as JSON
 *
 * This middleware should be placed AFTER all routes in app.js
 * It will catch any errors passed to next(error) from route handlers
 *
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const errorHandler = (err, req, res, next) => {
    // If headers are already sent, delegate to Express default error handler
    if (res.headersSent) {
        return next(err)
    }

    // Handle ApiError instances (custom errors from our application)
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            stack:
                process.env.NODE_ENV === "development" ? err.stack : undefined,
        })
    }

    // Handle JWT errors specifically
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
            errors: [],
        })
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expired",
            errors: [],
        })
    }

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((e) => e.message)
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors,
        })
    }

    // Handle Mongoose duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0]
        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
            errors: [],
        })
    }

    // Handle all other errors (500 Internal Server Error)
    console.error("Unhandled Error:", err)
    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    })
}

/**
 * 404 NOT FOUND HANDLER
 * Catches all requests to undefined routes
 * Should be placed BEFORE the error handler middleware
 */
export const notFoundHandler = (req, res, next) => {
    const error = new ApiError(404, `Route ${req.originalUrl} not found`)
    next(error)
}
