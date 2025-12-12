import mongoose from "mongoose"
import { Tweet } from "./src/models/tweet.model.js"
import { User } from "./src/models/user.model.js"
import dotenv from "dotenv"

dotenv.config()

const debugTweets = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("✅ DB Connected")

        // 1. Check Tweet Count
        const count = await Tweet.countDocuments()
        console.log(`📊 Total Tweets in DB: ${count}`)

        if (count === 0) {
            console.log("❌ No tweets found! Upload likely failed.")
            return
        }

        // 2. Fetch Latest Tweets
        const latestTweets = await Tweet.find().sort({ createdAt: -1 }).limit(3)
        console.log("\nRecent Tweets:")
        for (const t of latestTweets) {
            console.log(`- ID: ${t._id}`)
            console.log(`  Content: ${t.content}`)
            console.log(`  Image: ${t.image}`)
            console.log(`  Owner ID: ${t.owner}`)

            // 3. Check Owner
            const owner = await User.findById(t.owner)
            if (owner) {
                console.log(`  ✅ Owner Found: ${owner.username}`)
            } else {
                console.log(
                    `  ❌ Owner NOT FOUND in DB! (Aggregation $unwind will drop this)`
                )
            }
        }
    } catch (error) {
        console.error("Error:", error)
    } finally {
        await mongoose.disconnect()
    }
}

debugTweets()
