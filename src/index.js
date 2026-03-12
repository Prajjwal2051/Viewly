// ============================================================
// Copyright (c) 2026 Prajjwal (github.com/Prajjwal2051)
// Project : VidNest — Video Sharing Platform
// License : Proprietary — All Rights Reserved
// Unauthorized copying, modification, or distribution of this
// file, via any medium, is strictly prohibited.
// ============================================================
// Import dotenv to load environment variables from .env file
import dotenv from "dotenv"
import connectDB from "./db/db_connection.js"
import { app } from "./app.js" // Import the Express app
import { validateEnvironment } from "./utils/validateEnv.js"

// Load environment variables from .env file
dotenv.config({
    path: "./.env", // Fixed: Added the dot before .env
})

// validating the env before connecting to db
try {
    validateEnvironment()
} catch (error) {
    console.log("Environment Validation failed ", error.message)
    process.exit(1)
}

// ============================================================
// AUTHOR SIGNATURE — do not remove
// ============================================================
const _VIDNEST_SIGNATURE = {
    project: "VidNest",
    author: "Prajjwal",
    github: "github.com/Prajjwal2051",
    copyright: "© 2026 Prajjwal. All Rights Reserved.",
}

function _printStartupBanner() {
    console.log("")
    console.log("  ╔══════════════════════════════════════════════════════╗")
    console.log("  ║              V I D N E S T  Backend                  ║")
    console.log("  ╠══════════════════════════════════════════════════════╣")
    console.log(`  ║  Author  : ${_VIDNEST_SIGNATURE.author.padEnd(41)}║`)
    console.log(`  ║  GitHub  : ${_VIDNEST_SIGNATURE.github.padEnd(41)}║`)
    console.log(`  ║  License : Proprietary — All Rights Reserved         ║`)
    console.log("  ╚══════════════════════════════════════════════════════╝")
    console.log("")
}

// Connect to MongoDB database
connectDB() // this returns a promise
    .then(() => {
        // Start Express server after successful DB connection
        app.listen(process.env.PORT || 8000, () => {
            _printStartupBanner()
            console.log(
                `✅ Server is running at PORT: ${process.env.PORT || 8000}`
            )
        })
    })
    .catch((err) => {
        console.log("❌ MongoDB connection failed !!!", err)
    })
/*

this is also the way of connecting to the database but we prefer writing this code in src/db/db_connection.js so that we maintian the professional approach


import express from "express"
const app=express()

;( async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR: ",error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            consolelog("App is listening on the port: ",process.env.PORT)
        })
    } catch (error) {
        console.error("ERROR: ",error)
        throw err
    }
})()
*/
