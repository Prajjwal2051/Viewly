// Quick test script to check tweet API response structure
import axios from "axios"

async function testTweetAPI() {
    try {
        console.log("\n🧪 Testing Tweet API...\n")

        // Test getAllTweets endpoint
        const response = await axios.get("http://localhost:8000/api/v1/tweets")

        console.log("✅ Response Status:", response.status)
        console.log("📦 Response Data Structure:")
        console.log(JSON.stringify(response.data, null, 2))

        if (response.data && response.data.data) {
            console.log(
                "\n📊 Tweet Count:",
                Array.isArray(response.data.data)
                    ? response.data.data.length
                    : "Not an array"
            )

            if (
                Array.isArray(response.data.data) &&
                response.data.data.length > 0
            ) {
                console.log("\n🔍 First Tweet Sample:")
                console.log(JSON.stringify(response.data.data[0], null, 2))
            }
        }
    } catch (error) {
        console.error("❌ Error:", error.message)
        if (error.response) {
            console.error("Response Status:", error.response.status)
            console.error("Response Data:", error.response.data)
        }
    }
}

testTweetAPI()
