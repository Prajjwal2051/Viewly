import { useState } from "react"
import { useSelector } from "react-redux"
import { Grid, Image as ImageIcon, Film, User } from "lucide-react"
import TweetList from "../components/tweet/TweetList"

// Tab Configuration
const TABS = [
    { id: "videos", label: "Videos", icon: Film },
    { id: "community", label: "Community", icon: ImageIcon },
    { id: "about", label: "About", icon: User },
]

const ProfilePage = () => {
    // Get current user from Redux store
    const { user } = useSelector((state) => state.auth)
    const [activeTab, setActiveTab] = useState("videos")

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Profile Header Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-pink-500">
                            <img
                                src={
                                    user?.avatar ||
                                    "https://via.placeholder.com/150"
                                }
                                alt={user?.username}
                                className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-900"
                            />
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-['Playfair_Display']">
                            {user?.fullName}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                            @{user?.username}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 max-w-lg">
                            {user?.email}
                        </p>

                        {/* Stats - Horizontal Stack */}
                        <div className="flex items-center justify-center md:justify-start gap-8 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <div className="text-center md:text-left">
                                <span className="block text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    0
                                </span>
                                <span className="text-sm text-gray-500">
                                    Subscribers
                                </span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="block text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    0
                                </span>
                                <span className="text-sm text-gray-500">
                                    Videos
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button className="px-6 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-full transition-colors">
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-gray-200 dark:border-gray-800 mb-8 overflow-x-auto">
                {TABS.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-8 py-4 font-medium transition-all relative whitespace-nowrap ${
                                isActive
                                    ? "text-purple-600 dark:text-purple-400"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400 rounded-t-full" />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "videos" && (
                    <div className="text-center py-20 text-gray-500">
                        <Grid size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-medium mb-2">
                            No videos yet
                        </h3>
                        <p>Videos you upload will appear here.</p>
                    </div>
                )}

                {activeTab === "community" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {user?._id ? (
                            <TweetList userId={user._id} />
                        ) : (
                            <div className="text-center text-red-500">
                                User ID missing
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "about" && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            About
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Joined{" "}
                            {new Date(
                                user?.createdAt || Date.now()
                            ).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfilePage
