import { useState } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { Search,Bell,Menu, X } from "lucide-react";
import Button from "../Button";
import Input from "../Input";
import {logout} from "../../store/slices/authSlice.js"
import { logoutUser } from '../../api/authApi'
import toast from "react-hot-toast";

const Header =()=>{
    const [showMobileMenu,setShowMobileMenu]=useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const navigate=useNavigate()
    const location=useLocation()
    const dispatch=useDispatch()
    const {user}=useSelector((state)=>{
        state.auth
    })

    const showSearchBar = ['/', '/discover', '/search'].some(path =>{
        location.pathname===path
    })
}



return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-4">

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                    >
                        {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>

                    <h1
                        onClick={() => navigate('/')}
                        className="text-xl sm:text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer select-none"
                    >
                        VidNest
                    </h1>
                </div>

                {/* Search Bar - Desktop & Tablet */}
                {showSearchBar && (
                    <form
                        onSubmit={handleSearch}
                        className="hidden md:flex flex-1 max-w-2xl"
                    >
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search videos, channels, or playlists..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4"
                            />
                        </div>
                    </form>
                )}

                {/* Header Actions */}
                <div className="flex items-center gap-2">
                    {/* Search Icon - Mobile */}
                    {showSearchBar && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/search')}
                            className="md:hidden"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    )}

                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/notifications')}
                        className="relative"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </Button>

                    {/* User Avatar with Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100">
                            <img
                                src={user?.avatar || 'https://via.placeholder.com/40'}
                                alt={user?.username}
                                className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                            />
                        </button>

                        {/* Dropdown Menu */}
                        <div className="hidden group-hover:block absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="font-semibold text-sm truncate">{user?.fullName}</p>
                                <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
                            </div>

                            <button
                                onClick={() => navigate(`/channel/${user?.username}`)}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                            >
                                Your Channel
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/settings')}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                            >
                                Settings
                            </button>

                            <hr className="my-2" />

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar */}
            {showSearchBar && (
                <form onSubmit={handleSearch} className="md:hidden mt-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </form>
            )}
        </div>
    </header>
);


export default Header;