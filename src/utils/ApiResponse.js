// ============================================
// API RESPONSE CLASS
// ============================================
// Standardized response format for successful API operations
// Ensures consistent structure across all API endpoints

/**
 * API RESPONSE CLASS
 * Standard format for successful API responses
 * 
 * Purpose:
 * - Provides consistent response structure throughout the API
 * - Makes frontend integration easier (predictable format)
 * - Includes status code, data, and message
 * - Automatically determines success based on status code
 * 
 * Usage Example:
 * return res.status(200).json(
 *   new ApiResponse(200, videoData, "Video fetched successfully")
 * )
 * 
 * Response Format:
 * {
 *   statusCode: 200,
 *   data: { ... },
 *   message: "Success",
 *   success: true
 * }
 * 
 * Properties:
 * - statusCode: HTTP status code (200, 201, etc.)
 * - data: Response payload (video data, user info, etc.)
 * - message: Human-readable success message
 * - success: Boolean (automatically set based on status code)
 */
class ApiResponse {
    constructor(
        statusCode,            // HTTP status code (200, 201, etc.)
        data,                  // Response data (object, array, etc.)
        message = "Success"    // Success message (optional)
    ) {
        // HTTP status code for response
        this.statusCode = statusCode

        // Response payload (the actual data being sent)
        this.data = data

        // Human-readable message describing the operation
        this.message = message

        // Automatically determine success based on status code
        // Status codes < 400 are considered successful
        // 200-299: Success, 300-399: Redirection
        // 400-499: Client errors, 500-599: Server errors
        this.success = statusCode < 400
    }
}

// Export for use in controllers
export { ApiResponse }
