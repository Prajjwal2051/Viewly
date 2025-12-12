import React, { useEffect, useState } from "react"
import TweetCard from "./TweetCard"
import { getUserTweets, getAllTweets } from "../../api/tweetApi"
import { Loader2 } from "lucide-react"

const TweetList = ({ userId, limit }) => {
    const [tweets, setTweets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchTweets = async () => {
            try {
                setLoading(true)
                let data

                // If userId provided, fetch user-specific tweets
                // Otherwise, fetch all tweets
                if (userId) {
                    data = await getUserTweets(userId)
                } else {
                    data = await getAllTweets()
                }

                console.log("📥 Received tweet data:", data)

                // Extract tweets array from response
                // API might return array directly OR wrapped in { data: [...] }
                let tweetList = []
                if (Array.isArray(data)) {
                    // Data is already the array
                    tweetList = data
                } else if (Array.isArray(data.data)) {
                    // Data is wrapped in { data: [...] }
                    tweetList = data.data
                }

                console.log("✅ Extracted tweets:", tweetList.length, "posts")

                // Apply limit if specified
                const finalTweets = limit
                    ? tweetList.slice(0, limit)
                    : tweetList
                setTweets(finalTweets)
            } catch (err) {
                console.error("❌ Error fetching tweets:", err)
                console.error("   Error details:", {
                    message: err.message,
                    response: err.response,
                    data: err.response?.data,
                })
                setError("Failed to load tweets.")
            } finally {
                setLoading(false)
            }
        }

        fetchTweets()
    }, [userId, limit])

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tweets.map((tweet) => (
                <TweetCard key={tweet._id} tweet={tweet} />
            ))}
        </div>
    )
}

export default TweetList
