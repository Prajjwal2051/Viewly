// Import Cloudinary SDK v2 for cloud storage operations
import { v2 as cloudinary } from 'cloudinary';
// Import file system module to handle local file operations
import fs from "fs"
import {extractPublicId} from 'cloudinary-build-url'

// CLOUDINARY CONFIGURATION
// Set up Cloudinary with credentials from environment variables
// This connects our app to our Cloudinary account for file storage
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,           // Your Cloudinary cloud name
    api_key: process.env.CLOUDINARY_API_KEY,       // API key for authentication
    api_secret: process.env.CLOUDINARY_API_SECRET  // API secret for secure operations
});

/**
 * EXTRACT PUBLIC ID FROM CLOUDINARY URL
 * 
 * Extracts the unique public_id from a Cloudinary URL.
 * The public_id is needed to perform operations like delete, update, or transform files.
 * 
 * Example:
 * URL: "https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg"
 * Returns: "sample"
 * 
 * @param {string} cloudinaryURL - Full Cloudinary URL of the uploaded file
 * @returns {string|null} - Public ID of the file, or null if extraction fails
 */
const getPublicId = async (cloudinaryURL) => {
    try {
        // Validate that URL is provided
        if (!cloudinaryURL) {
            console.log("Cloudinary URL not provided")
            return null
        }
        
        // Extract public_id using cloudinary-build-url library
        // This handles different URL formats automatically
        const public_Id = extractPublicId(cloudinaryURL)
        
        console.log(`✅ Public ID extracted: ${public_Id}`)
        return public_Id
        
    } catch (error) {
        console.error("❌ Error extracting public ID from Cloudinary URL:", error.message)
        return null
    }
}

/**
 * UPLOAD FILE TO CLOUDINARY
 * This function handles uploading files from local storage to Cloudinary cloud storage
 * 
 * @param {string} localFilePath - Path to the file stored temporarily on our server
 * @returns {Object|null} - Cloudinary response object or null if failed
 */
const uploadOnCloudinary = async (localFilePath) => {
    try {
        // VALIDATION: Check if file path is provided
        if (!localFilePath) {
            console.log("No file path provided")
            return null
        }
        
        // UPLOAD TO CLOUDINARY
        // resource_type: "auto" automatically detects file type (image, video, raw)
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"  // Automatically detects if it's image, video, or other file
        })

        // SUCCESS: File uploaded successfully
        console.log("✅ File uploaded successfully to Cloudinary")
        console.log("📁 File URL:", response.url)
        
        // CLEANUP: Remove temporary file from local storage after successful upload
        fs.unlinkSync(localFilePath)
        
        return response  // Return full Cloudinary response (contains URL, public_id, etc.)
        
    } catch (error) {
        console.error("❌ Cloudinary upload failed:", error.message)
        
        // CLEANUP: Remove temporary file even if upload failed
        // This prevents our server storage from filling up with failed uploads
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        
        return null  // Return null to indicate upload failure
    }
}

/**
 * DELETE FILE FROM CLOUDINARY
 * 
 * Permanently deletes a file from Cloudinary cloud storage using its public_id.
 * This is essential for cleaning up when users delete videos or update thumbnails.
 * 
 * How it works:
 * 1. Validates the public_id and resource_type
 * 2. Calls Cloudinary's destroy API to delete the file
 * 3. Invalidates CDN cache to ensure immediate deletion across all servers
 * 
 * Resource Types:
 * - 'image': For thumbnails, avatars, cover images
 * - 'video': For video files
 * - 'raw': For other file types (PDFs, documents, etc.)
 * 
 * @param {string} public_Id - The unique public_id of the file (extracted from URL)
 * @param {string} resource_type - Type of file: 'image', 'video', or 'raw'
 * @returns {Object|null} - Deletion result object or null if failed
 * 
 * @example
 * // Delete a video
 * await deleteFromCloudinary("sample_video_123", "video")
 * 
 * // Delete a thumbnail image
 * await deleteFromCloudinary("thumbnail_456", "image")
 */
const deleteFromCloudinary = async (public_Id, resource_type) => {
    try {
        // VALIDATION: Check if public_id is provided
        if (!public_Id) {
            console.log("❌ Invalid public_id provided for deletion")
            return null
        }
        
        // VALIDATION: Check if resource_type is valid
        // Only 'image', 'video', and 'raw' are supported by Cloudinary
        if (!['image', 'video', 'raw'].includes(resource_type)) {
            console.log("❌ Invalid resource_type provided for deletion")
            console.log("💡 Allowed types: 'image', 'video', 'raw'")
            return null
        }

        // DELETE FROM CLOUDINARY
        // uploader.destroy() removes the file from Cloudinary storage
        const result = await cloudinary.uploader.destroy(public_Id, {
            resource_type: resource_type,  // Specify file type for correct deletion
            invalidate: true               // Clear CDN cache for immediate effect
        })
        
        // Check deletion result
        // result.result === 'ok' means successful deletion
        // result.result === 'not found' means file doesn't exist
        if (result.result === 'ok') {
            console.log(`✅ Asset deleted successfully from Cloudinary`)
            console.log(`📁 Public ID: ${public_Id}`)
            console.log(`📂 Resource Type: ${resource_type}`)
        } else {
            console.log(`⚠️ Deletion result: ${result.result}`)
        }
        
        return result  // Return full result object

    } catch (error) {
        console.error("❌ Error deleting file from Cloudinary:", error.message)
        return null
    }
}

export { uploadOnCloudinary, getPublicId, deleteFromCloudinary }