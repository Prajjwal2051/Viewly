// ============================================
// TWEET LIST COMPONENT - PHOTO POST FEED DISPLAY
// ============================================
// Fetches and displays a list of tweets (photo posts) in a masonry layout.
// Can show all tweets or filter by specific user.

import React, { useEffect, useState } from "react"
import TweetCard from "./TweetCard"
import { getUserTweets, getAllTweets } from "../../api/tweetApi"
import { Loader2, MessageSquare } from "lucide-react"
import EmptyState from "../ui/EmptyState"

/**
 * TWEET LIST COMPONENT
 * 
 * Purpose:
 * - Display feed of photo posts (tweets)
 * - Support both all-tweets feed and user-specific feed
 * - Handle loading and error states gracefully
 * 
 * Two Display Modes:
 * 1. All Tweets Mode (userId not provided)
 *    - Shows public feed from all users
 *    - Used on HomePage and Discover page
 * 
 * 2. User Tweets Mode (userId provided)
 *    - Shows tweets from specific user only
 *    - Used on Profile page
 * 
 * Data Flow:
 * 1. Component mounts
 * 2. useEffect triggers fetch based on userId
 * 3. API returns tweets (may be wrapped in data object)
 * 4. Extract array from various response formats
 * 5. Apply limit if specified
 * 6. Render TweetCard components
 * 
 * Technical Details:
 * - Handles multiple API response formats
 * - Supports optional limit parameter
 * - Shows loading spinner during fetch
 * - Displays EmptyState when no tweets found
 * 
 * @param {string} userId - User ID to filter tweets (optional)
 * @param {number} limit - Max tweets to display (optional)
 */

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
                <Loader2 className="animate-spin text-red-600" size={32} />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-500 bg-red-50 rounded-xl">
                {error}
            </div>
        )
    }

    if (tweets.length === 0) {
        return (
            <EmptyState
                title="No tweets yet"
                description="This user hasn't posted any tweets."
                icon={MessageSquare}
            />
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
