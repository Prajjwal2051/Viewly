// ============================================
// SUBSCRIBERS PAGE - Channel Followers
// ============================================
// Displays all users who subscribed to a channel

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Loader2, Users, Calendar } from "lucide-react"
import { getUserChannelSubscribers } from "../api/subscriptionApi"
import { getUserChannelProfile } from "../api/userApi"
import toast from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"

const SubscribersPage = () => {
    const navigate = useNavigate()
    const { username } = useParams()
    const [subscribers, setSubscribers] = useState([])
    const [channelInfo, setChannelInfo] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (username) {
            fetchChannelAndSubscribers()
        }
    }, [username])

    const fetchChannelAndSubscribers = async () => {
        try {
            setLoading(true)

            // Get channel info first
            const channelResponse = await getUserChannelProfile(username)
            const channel = channelResponse.data
            setChannelInfo(channel)

            // Then get subscribers
            const subscribersResponse = await getUserChannelSubscribers(
                channel._id
            )
            const data = subscribersResponse.data || subscribersResponse
            setSubscribers(data.subscribers || [])
        } catch (error) {
            console.error("Failed to fetch subscribers:", error)
            toast.error("Failed to load subscribers")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#1E2021]">
                <Loader2 className="w-12 h-12 animate-spin text-red-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1E2021] text-white pt-6 pb-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        {channelInfo?.avatar ? (
                            <img
                                src={channelInfo.avatar}
                                alt={channelInfo.fullName}
                                className="w-20 h-20 rounded-full object-cover border-4 border-red-600"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center border-4 border-red-600">
                                <Users size={32} className="text-gray-400" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-4xl font-bold">
                                {channelInfo?.fullName || username}'s
                                Subscribers
                            </h1>
                            <p className="text-gray-400">
                                {subscribers.length} subscriber
                                {subscribers.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Subscribers List */}
                {subscribers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Users size={64} className="mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">
                            No subscribers yet
                        </h3>
                        <p className="text-sm">
                            This channel doesn't have any subscribers yet
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subscribers.map((subscriber) => {
                            const user = subscriber.subscriber || subscriber
                            return (
                                <div
                                    key={user._id}
                                    onClick={() =>
                                        navigate(`/channel/${user.username}`)
                                    }
                                    className="bg-[#2A2D2E] rounded-lg p-4 hover:bg-[#323638] transition-colors cursor-pointer group flex items-center gap-4"
                                >
                                    {/* Avatar */}
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.fullName}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-[#1E2021] group-hover:border-red-600 transition-colors"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center border-2 border-[#1E2021] group-hover:border-red-600 transition-colors">
                                            <Users
                                                size={24}
                                                className="text-gray-400"
                                            />
                                        </div>
                                    )}

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-white truncate">
                                            {user.fullName || user.username}
                                        </h3>
                                        <p className="text-sm text-gray-400 truncate">
                                            @{user.username}
                                        </p>
                                        {subscriber.subscribedAt && (
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <Calendar size={12} />
                                                Subscribed{" "}
                                                {formatDistanceToNow(
                                                    new Date(
                                                        subscriber.subscribedAt
                                                    ),
                                                    { addSuffix: true }
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SubscribersPage
