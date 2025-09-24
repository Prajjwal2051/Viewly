// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/db_connection.js";

dotenv.config({
    path:"./env"
})
connectDB()
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