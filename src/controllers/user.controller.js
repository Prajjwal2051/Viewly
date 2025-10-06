// Import utility functions and models
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

/**
 * REGISTER NEW USER CONTROLLER
 * Handles the complete user registration process including:
 * - Input validation
 * - Duplicate user check
 * - File uploads (avatar & cover image)
 * - Database entry creation
 * - Secure response (excluding sensitive data)
 * 
 * @route POST /api/v1/users/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
    // STEP 1: Extract user data from request body
    const { fullName, email, username, password } = req.body
    console.log("email ", email)

    // STEP 2: Validate input fields - ensure no field is empty or contains only whitespace
    if (
        [fullName, email, username, password].some((field) => {
            field?.trim() === ""
        })
    ) {
        throw new ApiError(400, "all fields are required")
    }

    // STEP 3: Check if user already exists with the same username or email
    // This prevents duplicate accounts and maintains data integrity
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409, "user already exists")
    }

    // STEP 4: Extract local file paths for uploaded images
    // Multer middleware stores uploaded files temporarily on the server
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImgLocalPath = req.files?.coverimage[0]?.path
    console.log(avatarLocalPath)
    console.log(coverImgLocalPath)

    // STEP 5: Validate avatar is provided (mandatory field)
    if(!avatarLocalPath){
        throw new ApiError(400, "avatar is required")
    }

    // STEP 6: Upload images to Cloudinary cloud storage
    // Avatar is mandatory, cover image is optional
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImg = await uploadOnCloudinary(coverImgLocalPath)

    // STEP 7: Verify avatar upload was successful
    if(!avatar){
        throw new ApiError(400, "avatar upload failed")
    }

    // STEP 8: Create user entry in database with all validated data
    // Password will be automatically hashed by the pre-save middleware in user model
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImg: coverImg?.url || "",  // Optional field, empty string if not provided
        email,
        password,  // Will be hashed before saving
        username: username.toLowerCase()  // Ensure consistency with lowercase usernames
    })

    // STEP 9: Retrieve created user from database, excluding sensitive fields
    // The select() method with "-" prefix removes specified fields from the response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // STEP 10: Verify user was successfully created in database
    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }

    // STEP 11: Send success response with user data (without sensitive information)
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )
})


export { registerUser }