import { useNavigate } from "react-router-dom"
import { Home } from "lucide-react"
import authBgBright from "../assets/auth_bg_bright.png" // Consistent with Auth pages

const NotFoundPage = () => {
    const navigate = useNavigate()

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden font-Outfit"
            style={{ backgroundImage: `url(${authBgBright})` }}
        >
            {/* Overlay consistent with Auth pages */}
            <div className="absolute inset-0 bg-[#1E2021]/30 backdrop-blur-[2px]"></div>

            <div className="relative z-10 text-center px-4">
                {/* 404 Header */}
                <h1 className="text-[150px] md:text-[200px] font-bold text-white leading-none font-Playfair_Display drop-shadow-2xl animate-fadeInUp mb-8">
                    404
                </h1>

                {/* Subtitle */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-Playfair_Display drop-shadow-lg animate-fadeInUp delay-200">
                    Page Not Found
                </h2>

                {/* Description */}
                <p className="text-xl text-gray-200 mb-10 max-w-lg mx-auto animate-fadeInUp delay-400">
                    Oops! The page you are looking for might have been removed
                    or is temporarily unavailable.
                </p>

                {/* Go Home Button */}
                <button
                    onClick={() => navigate("/")}
                    className="animate-fadeInUp delay-600 px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-full hover:bg-red-700 transition-all transform hover:scale-105 shadow-xl flex items-center gap-3 mx-auto"
                >
                    <Home className="w-6 h-6" />
                    Go Back Home
                </button>
            </div>
        </div>
    )
}

export default NotFoundPage
