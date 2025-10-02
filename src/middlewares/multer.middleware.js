// Import Multer - middleware for handling multipart/form-data (file uploads)
import multer from "multer";

/**
 * MULTER DISK STORAGE CONFIGURATION
 * This configures how and where uploaded files are temporarily stored
 * before being uploaded to Cloudinary
 */
const storage = multer.diskStorage({
    
    // DESTINATION: Where to store uploaded files temporarily
    destination: function (req, file, cb) {
        // Store files in ./public/temp directory
        // This is temporary storage before uploading to Cloudinary
        cb(null, "./public/temp")
    },
    
    // FILENAME: How to name the uploaded files
    filename: function (req, file, cb) {
        // Keep the original filename from user's device
        // Note: In production, you might want to add timestamps or UUIDs
        // to prevent filename conflicts
        cb(null, file.originalname)
    }
})

/**
 * MULTER UPLOAD MIDDLEWARE
 * This middleware processes file uploads in Express routes
 * 
 * Usage examples:
 * - upload.single('avatar')     // Single file upload
 * - upload.array('videos', 5)   // Multiple files (max 5)
 * - upload.fields([...])        // Multiple fields with different names
 * 
 * Flow:
 * 1. User uploads file through form
 * 2. Multer saves it to ./public/temp
 * 3. Our route handler gets the file path
 * 4. We upload it to Cloudinary
 * 5. Cloudinary returns the permanent URL
 * 6. We save the URL to database
 */
export const upload = multer({
    storage,  // Use the disk storage configuration above
    
    // Optional: Add file size limits, file type filters, etc.
    // limits: {
    //     fileSize: 10 * 1024 * 1024  // 10MB limit
    // },
    // fileFilter: function (req, file, cb) {
    //     // Accept only specific file types
    //     cb(null, true)
    // }
})