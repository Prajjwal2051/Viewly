import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY_CLOUDNARY,
    api_secret: process.env.API_SECRET_CLOUDNARY // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // file has been uploaded sucessfully
        console.log("file uploaded sucessfully...")
        console.log(response.url)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // removes the locally saved temp files as the upload operation got failed
        return null
    }
}

export { uploadOnCloudinary }
