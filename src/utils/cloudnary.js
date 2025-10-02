// Import Cloudinary SDK v2 for cloud storage operations
import { v2 as cloudinary } from 'cloudinary';
// Import file system module to handle local file operations
import fs from "fs"

// CLOUDINARY CONFIGURATION
// Set up Cloudinary with credentials from environment variables
// This connects our app to our Cloudinary account for file storage
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,           // Your Cloudinary cloud name
    api_key: process.env.API_KEY_CLOUDNARY,       // API key for authentication
    api_secret: process.env.API_SECRET_CLOUDNARY  // API secret for secure operations
});

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

export { uploadOnCloudinary }
