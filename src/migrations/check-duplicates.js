import { MongoClient } from "mongodb"
import dotenv from "dotenv"

dotenv.config()

const checkDuplicates = async () => {
    const uri = process.env.MONGODB_URI.replace("?", "/VidNest?")
    const client = new MongoClient(uri)

    try {
        console.log("🔍 Checking for duplicate likes...")
        await client.connect()

        const db = client.db("VidNest")
        const collection = db.collection("likes")

        // Find all likes with null comment field
        console.log("\n📊 Likes with comment: null")
        const nullCommentLikes = await collection
            .find({ comment: null })
            .toArray()
        console.log(`Found ${nullCommentLikes.length} likes with comment: null`)

        // Group by likedBy to find duplicates
        const byUser = {}
        nullCommentLikes.forEach((like) => {
            const userId = like.likedBy.toString()
            if (!byUser[userId]) {
                byUser[userId] = []
            }
            byUser[userId].push(like)
        })

        // Find users with multiple null comment likes
        console.log("\n🔴 Users with duplicate null comment likes:")
        let hasDuplicates = false
        for (const [userId, likes] of Object.entries(byUser)) {
            if (likes.length > 1) {
                hasDuplicates = true
                console.log(`  User ${userId}: ${likes.length} likes`)
                likes.forEach((like, i) => {
                    console.log(
                        `    ${i + 1}. ID: ${like._id}, video: ${like.video || "null"}, tweet: ${like.tweet || "null"}`
                    )
                })
            }
        }

        if (!hasDuplicates) {
            console.log("  ✅ No duplicates found!")
        }

        // Check for likes with all null fields (invalid data)
        console.log("\n🔍 Checking for invalid likes (all fields null)...")
        const invalidLikes = await collection
            .find({
                video: null,
                comment: null,
                tweet: null,
            })
            .toArray()

        if (invalidLikes.length > 0) {
            console.log(
                `\n⚠️  Found ${invalidLikes.length} invalid likes with all null fields:`
            )
            invalidLikes.forEach((like) => {
                console.log(`  - ID: ${like._id}, likedBy: ${like.likedBy}`)
            })

            console.log("\n🗑️  Deleting invalid likes...")
            const result = await collection.deleteMany({
                video: null,
                comment: null,
                tweet: null,
            })
            console.log(`  ✓ Deleted ${result.deletedCount} invalid likes`)
        } else {
            console.log("  ✅ No invalid likes found")
        }

        // Show current indexes
        console.log("\n📋 Current indexes:")
        const indexes = await collection.indexes()
        indexes.forEach((idx) => {
            console.log(
                `  - ${idx.name}${idx.sparse ? " (sparse)" : ""}${idx.unique ? " (unique)" : ""}`
            )
        })
    } catch (error) {
        console.error("\n❌ Error:", error.message)
        throw error
    } finally {
        await client.close()
        console.log("\n🔌 Disconnected\n")
    }
}

checkDuplicates()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
