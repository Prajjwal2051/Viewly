// ============================================
// DATABASE CONNECTION CONFIGURATION
// ============================================
// Handles MongoDB connection using Mongoose ODM
// Separates database logic from server startup for better organization

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

/**
 * CONNECT TO MONGODB DATABASE
 * Establishes connection to MongoDB using connection string from environment variables
 * 
 * Purpose:
 * - Connect to MongoDB database before starting the server
 * - Use environment variables for security (don't hardcode credentials)
 * - Provide clear error messages if connection fails
 * - Log successful connection details for debugging
 * 
 * Environment Variables Required:
 * - MONGODB_URI: MongoDB connection string (from .env file)
 *   Example: mongodb://localhost:27017 or MongoDB Atlas URL
 * 
 * Database Name:
 * - Defined in constants.js (e.g., "vidnest")
 * - Specified separately from URI for clarity
 * 
 * Error Handling:
 * - Logs error message if connection fails
 * - Exits process with code 1 (indicates failure)
 * - This prevents server from starting without database
 * 
 * @returns {Promise<void>} Resolves when connection is established
 */
const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB
        // mongoose.connect() returns a promise with connection instance
        const connectionInstance = await mongoose.connect(
            process.env.MONGODB_URI,  // Connection string from .env
            {
                dbName: DB_NAME,      // Specify database name explicitly
            }
        )

        // Log successful connection with host information
        console.log(`\n MongoDB connected... DB HOST: ${connectionInstance.connection.host}`)

        // Log database name for debugging (helps verify correct DB)
        console.log(`\n Connected to DB Name: ${connectionInstance.connection.name}`)

    } catch (error) {
        // Log error details if connection fails
        console.log("Error: ", error)

        // Exit process with failure code
        // This prevents the server from starting without a database connection
        process.exit(1)
    }
}

// Export for use in index.js (server entry point)
export default connectDB