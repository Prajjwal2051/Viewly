// ============================================
// SUBSCRIPTIONS PAGE - Following/Subscribed Channels
// ============================================
// Displays all channels that the current user is subscribed to

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Heart, UserCheck, Loader2, Users } from "lucide-react"
import {
    getSubscribedChannels,
    toggleSubscription,
} from "../api/subscriptionApi"
import toast from "react-hot-toast"

const SubscriptionsPage = () => {
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const [subscriptions, setSubscriptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [unsubscribing, setUnsubscribing] = useState(null)

    useEffect(() => {
        if (user) {
            fetchSubscriptions()
        }
    }, [user])

    const fetchSubscriptions = async () => {
        try {
            setLoading(true)
            const response = await getSubscribedChannels()
            // API returns nested data structure
            const data = response.data || response
            const subscribedChannels =
                data.data?.subscribedChannels || data.subscribedChannels || []
            setSubscriptions(subscribedChannels)
        } catch (error) {
            console.error("Failed to fetch subscriptions:", error)
            toast.error("Failed to load subscriptions")
        } finally {
            setLoading(false)
        }
    }

    const handleUnsubscribe = async (channelId, channelName) => {
        if (!confirm(`Unsubscribe from ${channelName}?`)) return

        try {
            setUnsubscribing(channelId)
            await toggleSubscription(channelId)
            toast.success(`Unsubscribed from ${channelName}`)
            // Remove from list
            setSubscriptions((subs) =>
                subs.filter((sub) => sub.channel._id !== channelId)
            )
        } catch (error) {
            console.error("Failed to unsubscribe:", error)
            toast.error("Failed to unsubscribe")
        } finally {
            setUnsubscribing(null)
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
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Users size={40} className="text-red-600" />
                        Subscriptions
                    </h1>
                    <p className="text-gray-400">
                        Channels you're following ({subscriptions.length})
                    </p>
                </div>

                {/* Subscriptions Grid */}
                {subscriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Users size={64} className="mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">
                            No subscriptions yet
                        </h3>
                        <p className="text-sm">
                            Start following channels to see their content here
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {subscriptions.map((subscription) => {
                            const channel =
                                subscription.subscribedChannelDetails ||
                                subscription.channel ||
                                subscription
                            return (
                                <div
                                    key={channel._id}
                                    className="bg-[#2A2D2E] rounded-lg p-6 hover:bg-[#323638] transition-colors group"
                                >
                                    {/* Avatar */}
                                    <div
                                        onClick={() =>
                                            navigate(
                                                `/channel/${channel.username}`
                                            )
                                        }
                                        className="cursor-pointer"
                                    >
                                        {channel.avatar ? (
                                            <img
                                                src={channel.avatar}
                                                alt={channel.fullName}
                                                className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-[#1E2021] group-hover:border-red-600 transition-colors"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full mx-auto bg-gray-700 flex items-center justify-center border-4 border-[#1E2021] group-hover:border-red-600 transition-colors">
                                                <Users
                                                    size={40}
                                                    className="text-gray-400"
                                                />
                                            </div>
                                        )}

                                        {/* Channel Info */}
                                        <div className="text-center mt-4">
                                            <h3 className="text-lg font-semibold text-white mb-1">
                                                {channel.fullName ||
                                                    channel.username}
                                            </h3>
                                            <p className="text-sm text-gray-400 mb-2">
                                                @{channel.username}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {channel.subscribersCount?.toLocaleString() ||
                                                    0}{" "}
                                                subscribers
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4">
                                        <button
                                            onClick={() =>
                                                handleUnsubscribe(
                                                    channel._id,
                                                    channel.fullName
                                                )
                                            }
                                            disabled={
                                                unsubscribing === channel._id
                                            }
                                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {unsubscribing === channel._id ? (
                                                <>
                                                    <Loader2
                                                        size={16}
                                                        className="animate-spin"
                                                    />
                                                    Unsubscribing...
                                                </>
                                            ) : (
                                                <>
                                                    <UserCheck size={16} />
                                                    Unsubscribe
                                                </>
                                            )}
                                        </button>
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

export default SubscriptionsPage
