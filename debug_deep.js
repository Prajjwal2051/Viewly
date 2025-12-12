import mongoose from "mongoose"
import { Tweet } from "./src/models/tweet.model.js"
import { User } from "./src/models/user.model.js"
import dotenv from "dotenv"
import { DB_NAME } from "./src/constants.js"

dotenv.config()

const debugDeep = async () => {
    try {
        const uri = `${process.env.MONGODB_URI}/${DB_NAME}`
        console.log(`🔌 Connecting to ${DB_NAME} on Cluster...`)

        await mongoose.connect(uri)
        console.log("✅ DB Connected")

        // 1. Check User 'prajjwal7697'
        const user = await User.findOne({ username: "prajjwal7697" })
        if (user) {
            console.log(`✅ User 'prajjwal7697' FOUND. ID: ${user._id}`)
        } else {
            console.log(`❌ User 'prajjwal7697' NOT FOUND in this DB!`)
            console.log("   (Are we connected to the right database/cluster?)")
        }

        // 2. List All Collections and Counts
        const cols = await mongoose.connection.db.listCollections().toArray()
        console.log("\n📚 Collections in VidNest:")
        for (const col of cols) {
            const count = await mongoose.connection.db
                .collection(col.name)
                .countDocuments()
            console.log(`   - ${col.name}: ${count}`)
        }
    } catch (error) {
        console.error("Error:", error)
    } finally {
        await mongoose.disconnect()
    }
}

debugDeep()
