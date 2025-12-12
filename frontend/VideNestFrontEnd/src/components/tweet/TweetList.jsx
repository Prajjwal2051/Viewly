import React, { useEffect, useState } from "react"
import TweetCard from "./TweetCard"
import { getUserTweets } from "../../api/tweetApi"
import { Loader2 } from "lucide-react"

const TweetList = ({ userId }) => {
    const [tweets, setTweets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchTweets = async () => {
            if (!userId) return
            try {
                setLoading(true)
                const data = await getUserTweets(userId)
                // Backend getUserTweets returns ApiResponse(200, tweets, message)
                // where tweets is the aggregation result array
                // So data structure is: { statusCode: 200, data: [...tweets array...], message: "..." }
                // We need to extract data.data which is the tweets array
                console.log("📥 Received tweet data:", data)

                const tweetList = Array.isArray(data.data) ? data.data : []
                console.log("✅ Extracted tweets:", tweetList.length, "posts")
                setTweets(tweetList)
            } catch (err) {
                console.error("❌ Error fetching tweets:", err)
                console.error("   Error details:", {
                    message: err.message,
                    response: err.response,
                    data: err.response?.data,
                })
                setError("Failed to load community posts.")
            } finally {
                setLoading(false)
            }
        }

        fetchTweets()
    }, [userId])

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl">
                {error}
            </div>
        )
    }

    if (tweets.length === 0) {
        return (
            <div className="text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No posts yet.
                </p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            {tweets.map((tweet) => (
                <TweetCard key={tweet._id} tweet={tweet} />
            ))}
        </div>
    )
}

export default TweetList
