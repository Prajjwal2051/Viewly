import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"

dotenv.config()

const testTweetLike = async () => {
    const uri = process.env.MONGODB_URI.replace("?", "/VidNest?")
    const client = new MongoClient(uri)

    try {
        console.log("🧪 Testing tweet like creation...")
        await client.connect()

        const db = client.db("VidNest")
        const collection = db.collection("likes")

        // Use a test user ID and tweet ID
        const testUserId = new ObjectId("693811926f63e1d0c27a9c52") // From your error
        const testTweetId = new ObjectId()

        console.log(`\nTest User ID: ${testUserId}`)
        console.log(`Test Tweet ID: ${testTweetId}`)

        // Check existing likes for this user
        console.log("\n📊 Existing likes for this user:")
        const existingLikes = await collection
            .find({ likedBy: testUserId })
            .toArray()
        console.log(`Found ${existingLikes.length} likes`)
        existingLikes.forEach((like) => {
            console.log(
                `  - video: ${like.video || "null"}, comment: ${like.comment || "null"}, tweet: ${like.tweet || "null"}`
            )
        })

        // Try to create a tweet like
        console.log("\n🔨 Attempting to create tweet like...")
        try {
            const result = await collection.insertOne({
                tweet: testTweetId,
                likedBy: testUserId,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            console.log(
                `✅ Successfully created like with ID: ${result.insertedId}`
            )

            // Clean up
            await collection.deleteOne({ _id: result.insertedId })
            console.log("🗑️  Cleaned up test like")
        } catch (error) {
            console.error(`❌ Failed to create like: ${error.message}`)
            if (error.code === 11000) {
                console.log("\n🔍 Duplicate key error details:")
                console.log(JSON.stringify(error, null, 2))

                // Find the conflicting document
                console.log("\n🔍 Looking for conflicting likes...")
                const conflicts = await collection
                    .find({
                        likedBy: testUserId,
                        comment: null,
                    })
                    .toArray()
                console.log(
                    `Found ${conflicts.length} likes with comment: null for this user:`
                )
                conflicts.forEach((like) => {
                    console.log(`  - ID: ${like._id}`)
                    console.log(`    video: ${like.video || "null"}`)
                    console.log(`    tweet: ${like.tweet || "null"}`)
                    console.log(`    comment: ${like.comment || "null"}`)
                })
            }
        }
    } catch (error) {
        console.error("\n❌ Error:", error.message)
        throw error
    } finally {
        await client.close()
        console.log("\n🔌 Disconnected\n")
    }
}

testTweetLike()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
