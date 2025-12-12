import mongoose from "mongoose"
import { Tweet } from "./src/models/tweet.model.js"
import { User } from "./src/models/user.model.js"
import dotenv from "dotenv"
import { DB_NAME } from "./src/constants.js"

dotenv.config()

const debugTweets = async () => {
    try {
        const uri = `${process.env.MONGODB_URI}/${DB_NAME}`
        console.log(`🔌 Connecting to ${DB_NAME}...`)

        await mongoose.connect(uri)
        console.log("✅ DB Connected")

        // 1. Check Tweet Count
        const count = await Tweet.countDocuments()
        console.log(`📊 Total Tweets in DB: ${count}`)

        if (count === 0) {
            console.log("❌ No tweets found in 'VidNest' DB.")
            return
        }

        // 2. Fetch Latest Tweets (Raw)
        const latestTweets = await Tweet.find().sort({ createdAt: -1 }).limit(5)
        console.log("\nRecent Tweets Inspections:")

        for (const t of latestTweets) {
            console.log(`\n🔹 Tweet ID: ${t._id}`)
            console.log(`   Content: ${t.content}`)
            console.log(`   Image: ${t.image}`)
            console.log(`   Owner ID: ${t.owner}`)

            // 3. Check Owner Existence (Crucial for $unwind)
            const owner = await User.findById(t.owner)
            if (owner) {
                console.log(
                    `   ✅ Owner Found: ${owner.username} (${owner._id})`
                )
            } else {
                console.log(`   ❌ Owner NOT FOUND! This tweet will be hidden.`)
            }
        }
    } catch (error) {
        console.error("Error:", error)
    } finally {
        await mongoose.disconnect()
    }
}

debugTweets()
