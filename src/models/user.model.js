// Import necessary packages for database operations, JWT tokens, and password hashing
import mongoose, { mongo, Schema } from "mongoose"
import jwt from "jsonwebtoken"  // For generating JSON Web Tokens for authentication
import bcrypt from "bcrypt"     // For hashing passwords securely

// Define the user schema structure for MongoDB
const userSchema = new mongoose.Schema({
    // Username field - unique identifier for each user
    username: {
        type: String,
        require: true,          // This field is mandatory
        unique: true,           // No two users can have the same username
        trim: true,             // Removes whitespace from beginning and end
        index: true             // Creates database index for faster queries
    },
    
    // Email field - for user communication and login
    email: {
        type: String,
        require: true,          // This field is mandatory
        unique: true,           // No two users can have the same email
        lowercase: true,        // Automatically converts to lowercase
        trim: true              // Removes whitespace from beginning and end
    },
    
    // Full name of the user (display name)
    fullName: {
        type: String,
        require: true,          // This field is mandatory
    },
    
    // Password field - will be hashed before storing
    password: {
        type: String,
        require: [true, "Password is Required"]  // Required with custom error message
    },
    
    // Refresh token - used for maintaining user sessions
    refreshToken: {
        type: String,           // Optional field, stored when user logs in
    },
    
    // Array to store user's video watching history
    watchHistory: [
        {
            type: Schema.Types.ObjectId,  // References to video documents
            ref: "Video",                 // Points to the "Video" collection
        }
    ],
    
    // User's profile picture URL (stored on Cloudinary)
    avatar: {
        type: String,           // Stores the URL of the profile image
    },
    
    // User's cover image URL (like banner image)
    coverimage: {
        type: String            // Stores the URL of the cover image
    },
    subscribersCount: {         // stores the subscriber count of a user
        type: Number,
        default: 0
    },
                                // Count of channels this user subscribes to
    subscribedToCount: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true            // Automatically adds createdAt and updatedAt fields
})

// PRE-SAVE MIDDLEWARE: Runs automatically before saving user to database
userSchema.pre("save", async function (next) {
    // Check if the password field has been modified
    if(this.isModified("password")){
        // Hash the password with salt rounds of 10 before saving
        // Higher number = more secure but slower
        this.password = await bcrypt.hash(this.password, 10)
        next()  // Continue with the save operation
    } else {
        // If password wasn't modified, skip hashing and continue
        return next()
    }
})

// INSTANCE METHOD: Check if provided password matches stored hashed password
userSchema.methods.isPasswordCorrect = async function(password){
    // Compare plain text password with hashed password in database
    // Returns true if passwords match, false otherwise
    return await bcrypt.compare(password, this.password)
}

// INSTANCE METHOD: Generate Access Token for user authentication
userSchema.methods.generateAccessToken = function(){
    // Create JWT token with user information as payload
    return jwt.sign({
        _id: this._id,              // User's unique ID from database
        email: this.email,          // User's email
        username: this.username,    // User's username
        fullName: this.fullName     // User's full name
    }, 
    process.env.ACCESS_TOKEN_SECRET,    // Secret key for signing token
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY  // Token expiration time (e.g., "15m")
    })
}

// INSTANCE METHOD: Generate Refresh Token for maintaining user sessions
userSchema.methods.generateRefreshToken = function(){
    // Create JWT token for refreshing access tokens
    return jwt.sign({
        _id: this._id,              // Only user ID needed for refresh token
    }, 
    process.env.REFRESH_TOKEN_SECRET,   // Different secret key for refresh tokens
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY  // Longer expiration (e.g., "7d")
    })
}


// Export the User model for use in other parts of the application
// This creates a MongoDB collection named "users" (automatically pluralized)
export const User = mongoose.model("User", userSchema)