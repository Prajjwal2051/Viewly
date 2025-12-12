import mongoose from "mongoose"
import { User } from "./src/models/user.model.js"
import { Tweet } from "./src/models/tweet.model.js"
import dotenv from "dotenv"
import { DB_NAME } from "./src/constants.js"

dotenv.config()

const setupTest = async () => {
    try {
        const uri = `${process.env.MONGODB_URI}/${DB_NAME}`
        await mongoose.connect(uri)
        console.log("✅ DB Connected")

        // 1. Create/Find User
        let user = await User.findOne({ username: "prajjwal7697" })
        if (!user) {
            console.log("Creating user 'prajjwal7697'...")
            user = await User.create({
                username: "prajjwal7697",
                email: "prajjwal7697@example.com",
                fullName: "Prajjwal Test",
                password: "123456789", // Will be hashed by pre-save hook?
                // Wait, User model likely hash password in pre('save').
                // direct create invokes save? Yes.
            })
            console.log("✅ User created.")
        } else {
            console.log("✅ User already exists.")
        }

        // 2. Create Dummy Tweet
        console.log("Creating dummy tweet...")
        const tweet = await Tweet.create({
            content: "This is a backend generated test tweet",
            image: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=800&q=80",
            owner: user._id,
            likes: 0,
        })
        console.log(`✅ Tweet created. ID: ${tweet._id}`)
    } catch (error) {
        console.error("Error:", error)
    } finally {
        await mongoose.disconnect()
    }
}

setupTest()
