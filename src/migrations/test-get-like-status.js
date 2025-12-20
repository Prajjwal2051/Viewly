import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"

dotenv.config()

const testGetLikeStatus = async () => {
    const uri = process.env.MONGODB_URI.replace("?", "/VidNest?")
    const client = new MongoClient(uri)

    try {
        console.log("🧪 Testing get like status logic...")
        await client.connect()

        const db = client.db("VidNest")
        const collection = db.collection("likes")

        // Get a real user and tweet from the database
        const testUserId = new ObjectId("693811926f63e1d0c27a9c52")
        const tweetsCollection = db.collection("tweets")

        // Find a tweet
        const tweet = await tweetsCollection.findOne({})
        if (!tweet) {
            console.log("❌ No tweets found in database")
            return
        }

        console.log(`\nTesting with:`)
        console.log(`  User ID: ${testUserId}`)
        console.log(`  Tweet ID: ${tweet._id}`)

        // Check if like exists
        const existingLike = await collection.findOne({
            tweet: tweet._id,
            likedBy: testUserId,
        })

        console.log(`\n📊 Like exists: ${!!existingLike}`)
        if (existingLike) {
            console.log(`  Like ID: ${existingLike._id}`)
            console.log(`  Created: ${existingLike.createdAt}`)
        }

        // This is what the backend controller should return
        const response = {
            isLiked: !!existingLike,
        }
        console.log(`\n✅ API should return:`, response)
    } catch (error) {
        console.error("\n❌ Error:", error.message)
        throw error
    } finally {
        await client.close()
        console.log("\n🔌 Disconnected\n")
    }
}

testGetLikeStatus()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
