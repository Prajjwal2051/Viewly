// ============================================
// PROFILE PAGE - USER PROFILE DISPLAY
// ============================================
// Shows authenticated user's profile information and stats.
// Displays avatar, username, email, and placeholder statistics.

import { useSelector } from "react-redux"

/**
 * PROFILE PAGE COMPONENT
 * Displays current user's profile with avatar, name, and stats
 * 
 * Features:
 * - User avatar with fallback placeholder
 * - Full name and username display
 * - Email address
 * - Stats grid (videos, subscribers, views) - currently placeholder zeros
 * 
 * Data Source:
 * - Redux auth state (user object from store)
 * - User data loaded during login/registration
 */
const ProfilePage = () => {
    // Get current user from Redux store
    const { user } = useSelector((state) => state.auth)

    return (
        // Container with max width for better readability
        <div className="max-w-4xl mx-auto">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
                {/* User Info Section - Avatar and Text */}
                <div className="flex items-center gap-4 mb-6">
                    {/* Avatar Image - Falls back to placeholder if none uploaded */}
                    <img
                        src={user?.avatar || "https://via.placeholder.com/100"}
                        alt={user?.username}
                        className="h-24 w-24 rounded-full object-cover border-4 border-gray-200"
                    />
                    {/* User Details */}
                    <div>
                        <h1 className="text-2xl font-bold">{user?.fullName}</h1>
                        <p className="text-gray-600">@{user?.username}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {user?.email}
                        </p>
                    </div>
                </div>

                {/* Stats Section - Currently placeholder values */}
                <div className="border-t pt-4">
                    <h2 className="font-semibold mb-2">Stats</h2>
                    {/* 3-column grid for stat display */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {/* Videos Count - TODO: Connect to backend */}
                        <div>
                            <p className="text-2xl font-bold text-blue-600">
                                0
                            </p>
                            <p className="text-sm text-gray-600">Videos</p>
                        </div>
                        {/* Subscribers Count - TODO: Connect to backend */}
                        <div>
                            <p className="text-2xl font-bold text-blue-600">
                                0
                            </p>
                            <p className="text-sm text-gray-600">Subscribers</p>
                        </div>
                        {/* Total Views - TODO: Connect to backend */}
                        <div>
                            <p className="text-2xl font-bold text-blue-600">
                                0
                            </p>
                            <p className="text-sm text-gray-600">Views</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
