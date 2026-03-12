// ============================================================
// Copyright (c) 2026 Prajjwal (github.com/Prajjwal2051)
// Project : VidNest — Video Sharing Platform
// License : Proprietary — All Rights Reserved
// Unauthorized copying, modification, or distribution of this
// file, via any medium, is strictly prohibited.
// ============================================================
import { MongoClient } from "mongodb"
import dotenv from "dotenv"

dotenv.config()

const fixIndexesProperly = async () => {
    const uri = process.env.MONGODB_URI.replace("?", "/VidNest?")
    const client = new MongoClient(uri)

    try {
        console.log("🔧 Fixing indexes with partial index expressions...")
        await client.connect()

        const db = client.db("VidNest")
        const collection = db.collection("likes")

        console.log("\n📋 Current indexes:")
        const currentIndexes = await collection.indexes()
        currentIndexes.forEach((idx) => console.log(`  - ${idx.name}`))

        console.log("\n🗑️  Dropping ALL custom indexes...")
        try {
            await collection.dropIndex("comment_1_likedBy_1")
            console.log("  ✓ Dropped comment_1_likedBy_1")
        } catch (e) {
            console.log("  ⚠️  comment_1_likedBy_1 not found")
        }

        try {
            await collection.dropIndex("video_1_likedBy_1")
            console.log("  ✓ Dropped video_1_likedBy_1")
        } catch (e) {
            console.log("  ⚠️  video_1_likedBy_1 not found")
        }

        try {
            await collection.dropIndex("tweet_1_likedBy_1")
            console.log("  ✓ Dropped tweet_1_likedBy_1")
        } catch (e) {
            console.log("  ⚠️  tweet_1_likedBy_1 not found")
        }

        console.log("\n🔨 Creating new partial indexes...")
        console.log(
            "   (These only index documents where the field is NOT null)"
        )

        // Video likes - only index where video is not null
        await collection.createIndex(
            { video: 1, likedBy: 1 },
            {
                unique: true,
                partialFilterExpression: { video: { $type: "objectId" } },
                name: "video_1_likedBy_1",
            }
        )
        console.log("  ✓ Created video_1_likedBy_1 (partial)")

        // Comment likes - only index where comment is not null
        await collection.createIndex(
            { comment: 1, likedBy: 1 },
            {
                unique: true,
                partialFilterExpression: { comment: { $type: "objectId" } },
                name: "comment_1_likedBy_1",
            }
        )
        console.log("  ✓ Created comment_1_likedBy_1 (partial)")

        // Tweet likes - only index where tweet is not null
        await collection.createIndex(
            { tweet: 1, likedBy: 1 },
            {
                unique: true,
                partialFilterExpression: { tweet: { $type: "objectId" } },
                name: "tweet_1_likedBy_1",
            }
        )
        console.log("  ✓ Created tweet_1_likedBy_1 (partial)")

        console.log("\n📋 New indexes:")
        const newIndexes = await collection.indexes()
        newIndexes.forEach((idx) => {
            const filters = idx.partialFilterExpression ? " (partial)" : ""
            console.log(`  - ${idx.name}${filters}`)
        })

        console.log("\n✅ Index fix completed with partial filter expressions!")
    } catch (error) {
        console.error("\n❌ Error:", error.message)
        throw error
    } finally {
        await client.close()
        console.log("🔌 Disconnected\n")
    }
}

fixIndexesProperly()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
