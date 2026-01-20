// ============================================
// FILE VALIDATION UTILITIES
// ============================================
// Provides validation functions for file uploads (videos, images, documents)
// Ensures files meet size and type requirements before upload

// ============================================
// FILE SIZE LIMITS
// ============================================

export const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50 MB (reduced from 500MB)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB
export const MAX_TWEET_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB for tweet images

// ============================================
// ALLOWED FILE TYPES
// ============================================

export const ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime", // .mov files
]

export const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
]

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validates a video file for upload
 * @param {File} file - The video file to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateVideoFile = (file) => {
    const errors = []

    // Check if file exists
    if (!file) {
        errors.push("Please select a video file")
        return { valid: false, errors }
    }

    // Check file type
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        errors.push(
            "Invalid video format. Allowed formats: MP4, WebM, OGG, MOV"
        )
    }

    // Check file size
    if (file.size > MAX_VIDEO_SIZE) {
        const maxSizeMB = Math.round(MAX_VIDEO_SIZE / (1024 * 1024))
        errors.push(
            `Video size must be less than ${maxSizeMB} MB. Current size: ${formatFileSize(file.size)}`
        )
    }

    // Check minimum size (prevent empty files)
    if (file.size < 1024) {
        // Less than 1 KB
        errors.push("Video file appears to be empty or corrupt")
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

/**
 * Validates an image file for upload (thumbnail, avatar, etc.)
 * @param {File} file - The image file to validate
 * @param {number} maxSize - Optional custom max size (defaults to MAX_IMAGE_SIZE)
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateImageFile = (file, maxSize = MAX_IMAGE_SIZE) => {
    const errors = []

    // Check if file exists
    if (!file) {
        errors.push("Please select an image file")
        return { valid: false, errors }
    }

    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        errors.push(
            "Invalid image format. Allowed formats: JPEG, PNG, WebP, GIF"
        )
    }

    // Check file size
    if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024))
        errors.push(
            `Image size must be less than ${maxSizeMB} MB. Current size: ${formatFileSize(file.size)}`
        )
    }

    // Check minimum size (prevent empty files)
    if (file.size < 100) {
        // Less than 100 bytes
        errors.push("Image file appears to be empty or corrupt")
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

/**
 * Validates a tweet image (larger size allowed)
 * @param {File} file - The tweet image file to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateTweetImage = (file) => {
    return validateImageFile(file, MAX_TWEET_IMAGE_SIZE)
}

/**
 * Checks if file type is a video
 * @param {File} file - The file to check
 * @returns {boolean}
 */
export const isVideoFile = (file) => {
    return file && ALLOWED_VIDEO_TYPES.includes(file.type)
}

/**
 * Checks if file type is an image
 * @param {File} file - The file to check
 * @returns {boolean}
 */
export const isImageFile = (file) => {
    return file && ALLOWED_IMAGE_TYPES.includes(file.type)
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Formats file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size (e.g., "5.23 MB")
 */
export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"
    if (!bytes || bytes < 0) return "Unknown"

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

/**
 * Gets file extension from filename
 * @param {string} filename - The filename
 * @returns {string} File extension (lowercase, without dot)
 */
export const getFileExtension = (filename) => {
    if (!filename) return ""
    const parts = filename.split(".")
    return parts.length > 1 ? parts.pop().toLowerCase() : ""
}

/**
 * Creates a preview URL for an image file
 * @param {File} file - The image file
 * @returns {string} Object URL for preview (remember to revoke when done)
 */
export const createImagePreview = (file) => {
    if (!file || !isImageFile(file)) return null
    return URL.createObjectURL(file)
}

/**
 * Revokes an object URL created by createImagePreview
 * @param {string} url - The object URL to revoke
 */
export const revokeImagePreview = (url) => {
    if (url && url.startsWith("blob:")) {
        URL.revokeObjectURL(url)
    }
}

/**
 * Validates multiple files at once
 * @param {FileList|File[]} files - Array or FileList of files
 * @param {Function} validator - Validation function (validateVideoFile or validateImageFile)
 * @returns {Object} { allValid: boolean, results: Array<{file, valid, errors}> }
 */
export const validateMultipleFiles = (files, validator) => {
    const fileArray = Array.from(files)
    const results = fileArray.map((file) => ({
        file,
        ...validator(file),
    }))

    return {
        allValid: results.every((r) => r.valid),
        results,
    }
}

/**
 * Gets human-readable error message for common upload errors
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const getUploadErrorMessage = (error) => {
    const message =
        error?.response?.data?.message || error?.message || "Upload failed"

    // Map common errors to user-friendly messages
    if (message.includes("Network Error")) {
        return "Network error. Please check your connection and try again."
    }
    if (message.includes("timeout")) {
        return "Upload timed out. Please try again with a smaller file or better connection."
    }
    if (message.includes("413") || message.includes("too large")) {
        return "File is too large. Please upload a smaller file."
    }
    if (message.includes("415") || message.includes("type")) {
        return "Invalid file type. Please check the allowed formats."
    }
    if (message.includes("401") || message.includes("unauthorized")) {
        return "You must be logged in to upload files."
    }
    if (message.includes("403") || message.includes("forbidden")) {
        return "You do not have permission to upload this file."
    }

    return message
}

// ============================================
// DISPLAY HELPERS
// ============================================

/**
 * Gets icon name for file type (for use with Lucide React icons)
 * @param {File} file - The file
 * @returns {string} Icon name
 */
export const getFileIcon = (file) => {
    if (!file) return "File"

    if (isVideoFile(file)) return "Video"
    if (isImageFile(file)) return "Image"

    return "File"
}

/**
 * Gets color class for file size indicator
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSize - Maximum allowed size
 * @returns {string} Tailwind color class
 */
export const getFileSizeColor = (fileSize, maxSize) => {
    const percentage = (fileSize / maxSize) * 100

    if (percentage > 90) return "text-red-500"
    if (percentage > 70) return "text-yellow-500"
    return "text-green-500"
}
