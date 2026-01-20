/**
 * Environment Configuration Validator
 * Ensures all critical environment variables are properly configured
 * Prevents application startup with weak or missing secrets
 */

import { ApiError } from "./ApiError.js"
import { ApiResponse } from "./ApiResponse.js"

class EnvironmentValidationError extends Error {
    constructor(message) {
        super(message)
        this.name = "EnvironmentValidationError"
    }
}

/**
 * Validates JWT secret strength
 * @param {string} secret - The JWT secret to validate
 * @param {string} name - Name of the secret for error messages
 * @returns {boolean} - True if valid
 * @throws {EnvironmentValidationError} - If secret is weak or missing
 */
const validateJWTSecret = (secret, name) => {
    // check if the secret exists or not
    if (!secret) {
        throw new ApiError(
            500,
            { name },
            " is not defined in the environment variable"
        )
    }
    if (secret.length < 64) {
        throw new ApiError(500, { name }, " length must be atleast 64")
    }

    const weakPatterns = [
        "your_super_secret",
        "changeme",
        "secret",
        "password",
        "GENERATE_YOUR_OWN",
        "123456",
        "min_32_chars",
        "DO_NOT_USE_THIS",
    ]
    const lowerSecret = secret.toLowerCase()
    for (const pattern of weakPatterns) {
        if (lowerSecret.includes(pattern.toLowerCase())) {
            throw new EnvironmentValidationError(
                `❌ ${name} has insufficient entropy (too repetitive). Unique characters: ${uniqueChars}/16 minimum\n` +
                `   Generate a strong secret using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
            )
        }
    }
    // Check for sufficient entropy (should look random)
    const uniqueChars = new Set(secret).size
    if (uniqueChars < 16) {
        throw new EnvironmentValidationError(
            `❌ ${name} has insufficient entropy (too repetitive). Unique characters: ${uniqueChars}/16 minimum\n` +
            `   Generate a strong secret using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
        )
    }
    return true
}


/**
 * Validates required environment variables
 * @throws {EnvironmentValidationError} - If validation fails
*/
const validateEnvironment = () => {
    console.log("validating environment configurations...\n")
    try {
        validateJWTSecret(
            process.env.ACCESS_TOKEN_SECRET,
            "ACCESS_TOKEN_SECRET"
        )
        validateJWTSecret(
            process.env.REFRESH_TOKEN_SECRET,
            "REFRESH_TOKEN_SECRET"
        )
        const requiredVars = [
            "MONGODB_URI",
            "CORS_ORIGIN",
            "PORT",
            "ACCESS_TOKEN_EXPIRY",
            "REFRESH_TOKEN_EXPIRY",
        ]
        const missing = requiredVars.filter((varName) => !process.env[varName])
        if (missing.length > 0) {
            throw new EnvironmentValidationError(
                `Missing required environment variables: ${missing.join(", ")}\n` +
                `   Please check your .env file`
            )
        }
        // Validate MongoDB URI format
        if (
            !process.env.MONGODB_URI.startsWith("mongodb://") &&
            !process.env.MONGODB_URI.startsWith("mongodb+srv://")
        ) {
            throw new EnvironmentValidationError(
                "MONGODB_URI must start with mongodb:// or mongodb+srv://"
            )
        }

        // Warn if using development CORS origin in production
        if (
            process.env.NODE_ENV === "production" &&
            process.env.CORS_ORIGIN.includes("localhost")
        ) {
            console.warn(
                "⚠️  WARNING: Using localhost CORS_ORIGIN in production environment!"
            )
        }

        console.log("     Environment configuration validated successfully")
        console.log(
            `   - ACCESS_TOKEN_SECRET: ${process.env.ACCESS_TOKEN_SECRET.length} characters`
        )
        console.log(
            `   - REFRESH_TOKEN_SECRET: ${process.env.REFRESH_TOKEN_SECRET.length} characters`
        )
        console.log(
            `   - Database: ${process.env.MONGODB_URI.split("@")[1] || "localhost"}`
        )
        console.log(`   - CORS Origin: ${process.env.CORS_ORIGIN}`)

        return new ApiResponse(200, "All Environment Variables Validated !!!")
    } catch (error) {
        if (error instanceof EnvironmentValidationError) {
            console.error("\n" + "=".repeat(80))
            console.error("ENVIRONMENT CONFIGURATION ERROR")
            console.error("=".repeat(80))
            console.error(error.message)
            console.error("=".repeat(80) + "\n")

            // Exit process in production to prevent insecure startup
            if (process.env.NODE_ENV === "production") {
                console.error(
                    "Exiting due to security configuration error in production"
                )
                process.exit(1)
            } else {
                console.error(
                    "Development mode: Allowing startup with warnings"
                )
                console.error(
                    "FIX THESE ISSUES BEFORE DEPLOYING TO PRODUCTION!\n"
                )
            }
        }
        throw new ApiError(500, "Environment Configuration Error", error)
    }
}

export { validateEnvironment }
