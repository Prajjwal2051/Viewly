import { useSelector } from "react-redux"

const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth)

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-4 mb-6">
                    <img
                        src={user?.avatar || "https://via.placeholder.com/100"}
                        alt={user?.username}
                        className="h-24 w-24 rounded-full object-cover border-4 border-gray-200"
                    />
                    <div>
                        <h1 className="text-2xl font-bold">{user?.fullName}</h1>
                        <p className="text-gray-600">@{user?.username}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {user?.email}
                        </p>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h2 className="font-semibold mb-2">Stats</h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-blue-600">
                                0
                            </p>
                            <p className="text-sm text-gray-600">Videos</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">
                                0
                            </p>
                            <p className="text-sm text-gray-600">Subscribers</p>
                        </div>
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
