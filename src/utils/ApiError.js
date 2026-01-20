// ============================================
// API ERROR CLASS
// ============================================
// Custom error class for consistent error handling across the application
// Extends JavaScript's built-in Error class with additional properties

/**
 * API ERROR CLASS
 * Custom error class for handling API errors with standardized format
 * 
 * Purpose:
 * - Provides consistent error structure throughout the API
 * - Includes HTTP status codes for proper response handling
 * - Supports multiple error messages (validation errors)
 * - Includes stack trace for debugging
 * 
 * Usage Example:
 * throw new ApiError(404, "Video not found", ["Video ID is invalid"])
 * 
 * Used With:
 * - asyncHandler wrapper (catches errors and passes to error middleware)
 * - Error middleware (formats and sends error response)
 * 
 * Properties:
 * - statusCode: HTTP status code (400, 404, 500, etc.)
 * - message: Human-readable error message
 * - errors: Array of detailed error messages (e.g., validation errors)
 * - success: Always false (indicates error response)
 * - stack: Error stack trace for debugging
 */
class ApiError extends Error {
    constructor(
        statusCode,                        // HTTP status code (e.g., 400, 404, 500)
        message = "Something went wrong",  // Error message shown to user
        errors = [],                       // Array of detailed errors (optional)
        stack = ""                         // Custom stack trace (optional)
    ) {
        // Call parent Error class constructor with message
        super(message)

        // HTTP status code for response (400, 404, 500, etc.)
        this.statusCode = statusCode

        // Data field (null for errors, contains data for success responses)
        this.data = null

        // Error message (overrides parent's message)
        this.message = message

        // Success flag (always false for errors)
        this.sucess = false  // Note: Typo "sucess" should be "success"

        // Array of detailed error messages (useful for validation errors)
        this.errors = errors

        // Stack trace handling
        if (stack) {
            // Use provided stack trace if available
            this.stack = stack
        } else {
            // Generate stack trace automatically
            // Captures call stack for debugging
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

// Export for use in controllers and middlewares
export { ApiError }