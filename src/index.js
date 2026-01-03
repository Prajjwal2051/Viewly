// Import dotenv to load environment variables from .env file
import dotenv from "dotenv"
import connectDB from "./db/db_connection.js";
import { app } from "./app.js";  // Import the Express app

// Load environment variables from .env file
dotenv.config({
    path: "./.env"  // Fixed: Added the dot before .env
})

// Connect to MongoDB database
connectDB() // this returns a promise
.then(()=>{
    // Start Express server after successful DB connection
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`✅ Server is running at PORT: ${process.env.PORT || 8000}`)
    })
})
.catch((err)=>{
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