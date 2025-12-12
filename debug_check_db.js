import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const debugDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("✅ DB Connected")
        console.log(`🔗 URI: ${process.env.MONGODB_URI.split("@")[1]}`) // Masked
        console.log(`📂 Database Name: ${mongoose.connection.name}`)

        // List Collections
        const collections = await mongoose.connection.db
            .listCollections()
            .toArray()
        console.log("\n📚 Collections found:")
        for (const col of collections) {
            const count = await mongoose.connection.db
                .collection(col.name)
                .countDocuments()
            console.log(`- ${col.name}: ${count} docs`)
        }
    } catch (error) {
        console.error("Error:", error)
    } finally {
        await mongoose.disconnect()
    }
}

debugDB()
