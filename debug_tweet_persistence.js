import mongoose from "mongoose"
import { Tweet } from "./src/models/tweet.model.js"
import { like } from "./src/models/like.model.js" // check lowercase 'like' export
import { Comment } from "./src/models/comment.model.js"
import { User } from "./src/models/user.model.js"
import dotenv from "dotenv"

dotenv.config()

/**
 * DATABASE PERSISTENCE VERIFICATION SCRIPT FOR TWEETS
 *
 * Verifies that:
 * 1. Tweet creation works
 * 2. Likes on Tweets are persisted
 * 3. Comments on Tweets are persisted
 */

const verifyTweetPersistence = async () => {
    try {
        console.log("🔌 Connecting to DB...")
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("✅ DB Connected")

        // 1. Find a test user (or create one)
        let user = await User.findOne({})
        if (!user) {
            console.log("⚠️ No user found, creating test user...")
            user = await User.create({
                username: "testuser_persistence",
                email: "test@persistence.com",
                fullName: "Test Persistence",
                password: "password123", // Assuming no hash middleware in this raw script or handled by model pre-save
                avatar: "http://res.cloudinary.com/demo/image/upload/sample.jpg",
            })
            console.log("✅ Test User Created")
        }
        console.log(`👤 Using user: ${user.username} (${user._id})`)

        // 2. Create a Tweet (simulate creation)
        console.log("📝 Creating Test Tweet...")
        const tweet = await Tweet.create({
            content: "Test Tweet Persistence " + Date.now(),
            image: "http://res.cloudinary.com/demo/image/upload/sample.jpg",
            owner: user._id,
        })
        console.log(`✅ Tweet Created: ${tweet._id}`)

        // 3. Like the Tweet
        console.log("❤️  Liking Tweet...")
        await like.create({
            tweet: tweet._id,
            likedBy: user._id,
        })
        // Increment like count manually as controller does
        await Tweet.findByIdAndUpdate(tweet._id, { $inc: { likes: 1 } })

        console.log("✅ Like Created")

        // 4. Verify Like Persistence
        console.log("🔍 Verifying Like Persistence...")
        const likeRecord = await like.findOne({
            tweet: tweet._id,
            likedBy: user._id,
        })
        const updatedTweet = await Tweet.findById(tweet._id)

        if (likeRecord && updatedTweet.likes === 1) {
            console.log("✅ Like Persisted in 'likes' collection")
            console.log("✅ Tweet 'likes' count updated to 1")
        } else {
            console.error("❌ Like Persistence FAILED")
            console.log("Like Record:", likeRecord)
            console.log("Tweet Value:", updatedTweet)
        }

        // 5. Add Comment to Tweet
        console.log("💬 Adding Comment to Tweet...")
        const comment = await Comment.create({
            content: "Test Comment Persistence",
            tweet: tweet._id,
            owner: user._id,
            likes: 0,
        })
        console.log(`✅ Comment Created: ${comment._id}`)

        // 6. Verify Comment Persistence
        console.log("🔍 Verifying Comment Persistence...")
        const commentRecord = await Comment.findOne({
            tweet: tweet._id,
            owner: user._id,
        })

        if (commentRecord) {
            console.log("✅ Comment Persisted in DB")
        } else {
            console.error("❌ Comment Persistence FAILED")
        }

        // Cleanup (Optional)
        console.log("🧹 Cleanup...")
        await Tweet.findByIdAndDelete(tweet._id)
        await like.deleteOne({ _id: likeRecord._id })
        await Comment.deleteOne({ _id: comment._id })
        console.log("✅ Cleanup Done")
    } catch (error) {
        console.error("❌ Error in Verification Script:", error)
    } finally {
        await mongoose.disconnect()
        console.log("🔌 Disconnected")
    }
}

verifyTweetPersistence()
