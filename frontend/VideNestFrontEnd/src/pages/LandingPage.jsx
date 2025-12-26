import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Lock, Github, CheckCircle, Zap, Globe, Heart } from "lucide-react"
import authBg from "../assets/auth_bg_bright.png"

const LandingPage = () => {
    // Scroll animation hook equivalent
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)

        // Simple scroll observer for animations
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("animate-active")
                    }
                })
            },
            { threshold: 0.1 }
        )

        document
            .querySelectorAll(".animate-on-scroll")
            .forEach((el) => observer.observe(el))

        return () => observer.disconnect()
    }, [])

    return (
        <div className="w-full min-h-screen bg-[#1E2021] text-white overflow-x-hidden font-['Outfit']">
            {/* HERO SECTION - Fixed Background */}
            <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={authBg}
                        alt="Background"
                        className="w-full h-full object-cover opacity-50 scale-105 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1E2021]/70 via-[#1E2021]/50 to-[#1E2021]" />
                </div>

                <div
                    className={`relative z-10 text-center px-4 transition-all duration-1000 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                >
                    <h1
                        className="text-8xl md:text-[10rem] mb-6 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                        style={{ fontFamily: '"Corinthia", cursive' }}
                    >
                        Welcome to{" "}
                        <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                            Viewly
                        </span>
                    </h1>

                    <div className="relative mb-8 max-w-4xl mx-auto px-4">
                        <p className="text-xl md:text-3xl text-gray-200 font-light tracking-wide">
                            A place to share your thoughts, moments, and{" "}
                            <span className="text-red-500 font-normal">
                                spark creativity
                            </span>
                            .
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                        <Link
                            to="/login"
                            className="group flex items-center gap-3 px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transform hover:-translate-y-1 transition-all duration-300"
                        >
                            <span className="tracking-wider">LOGIN</span>
                            <Lock className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                        </Link>
                        <Link
                            to="/register"
                            className="px-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-red-500 text-white rounded-full font-bold text-lg shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                        >
                            <span className="tracking-wider">SIGN UP</span>
                        </Link>
                    </div>

                    {/* Scroll Indicator */}
                </div>
            </div>

            {/* FEATURES SECTION */}
            <div className="py-24 px-4 relative z-10 bg-[#1E2021]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 font-['Playfair_Display']">
                            Why Choose Viewly?
                        </h2>
                        <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-3xl bg-[#252829] border border-gray-800 hover:border-red-600/50 hover:bg-[#2A2D2E] transition-all duration-500 group animate-on-scroll opacity-0 translate-y-10 delay-100">
                            <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Zap className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-red-500 transition-colors">
                                Lightning Fast
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                Experience seamless navigation and instant
                                loads. Optimized for best performance across all
                                devices.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-3xl bg-[#252829] border border-gray-800 hover:border-red-600/50 hover:bg-[#2A2D2E] transition-all duration-500 group animate-on-scroll opacity-0 translate-y-10 delay-200">
                            <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Globe className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-red-500 transition-colors">
                                Global Community
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                Connect with creators worldwide. Share your
                                unique perspective and discover content that
                                inspires you.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-3xl bg-[#252829] border border-gray-800 hover:border-red-600/50 hover:bg-[#2A2D2E] transition-all duration-500 group animate-on-scroll opacity-0 translate-y-10 delay-300">
                            <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <CheckCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-red-500 transition-colors">
                                Secure & Safe
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                Your data and privacy are our top priority.
                                Built with advanced security standards to keep
                                you safe.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-red-900/10 mb-10"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10 animate-on-scroll opacity-0 scale-95 transition-all duration-700">
                    <h2 className="text-5xl md:text-6xl font-bold mb-8 font-['Playfair_Display']">
                        Start Your Journey Today
                    </h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Join thousands of creators who are already sharing their
                        stories on Viewly. It's free and easy to get started.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block px-12 py-5 bg-white text-red-600 hover:bg-gray-100 rounded-full font-bold text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                    >
                        Create Free Account
                    </Link>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="py-12 bg-black/40 border-t border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
                    <div className="mb-6 animate-pulse">
                        <Heart className="w-8 h-8 text-red-600 fill-current" />
                    </div>

                    <h3 className="text-2xl font-bold mb-2 font-['Playfair_Display'] text-gray-200">
                        Developed by{" "}
                        <span className="text-red-500">Prajjwal Sahu</span>
                    </h3>

                    <p className="text-gray-500 mb-8 max-w-md">
                        Crafted with passion and attention to detail. Building
                        modern web experiences that make a difference.
                    </p>

                    <a
                        href="https://github.com/Prajjwal2051"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-6 py-3 bg-[#2A2D2E] hover:bg-[#333638] rounded-xl transition-all duration-300 group border border-gray-800 hover:border-gray-600"
                    >
                        <Github className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        <span className="text-gray-300 group-hover:text-white font-medium">
                            View on GitHub
                        </span>
                    </a>

                    <div className="mt-12 text-sm text-gray-600">
                        &copy; {new Date().getFullYear()} Viewly. All rights
                        reserved.
                    </div>
                </div>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;700&display=swap');

                .animate-active {
                    opacity: 1 !important;
                    transform: translateY(0) scale(1) !important;
                }
                
                @keyframes slow-zoom {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                .animate-slow-zoom {
                    animation: slow-zoom 20s infinite alternate linear;
                }
            `}</style>
        </div>
    )
}

export default LandingPage
