// ============================================
// REGISTER PAGE - USER REGISTRATION
// ============================================
// Allows new users to create an account with avatar upload.
// Redirects to home page after successful registration.

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
    loginStart,
    loginSuccess,
    loginFailure,
} from "../store/slices/authSlice"
import { registerUser } from "../api/authApi"
import toast from "react-hot-toast"
import Input from "../components/layout/ui/Input"
import Button from "../components/layout/ui/Button"
import authBgBright from "../assets/auth_bg_bright.png"
import { Eye, EyeOff, Info, Github, Mail } from "lucide-react"
import developerProfile from "../assets/developer_profile.jpg"

const RegisterPage = () => {
    // Form state
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        fullName: "",
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [avatar, setAvatar] = useState(null)
    const [coverImage, setCoverImage] = useState(null)

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { loading } = useSelector((state) => state.auth)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleFileChange = (e) => {
        const { name, files } = e.target
        if (files && files[0]) {
            if (name === "avatar") {
                setAvatar(files[0])
            } else if (name === "coverImage") {
                setCoverImage(files[0])
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (
            !formData.username ||
            !formData.email ||
            !formData.fullName ||
            !formData.password
        ) {
            toast.error("⚠️ Please fill in all required fields")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("❌ Passwords don't match")
            return
        }

        if (formData.password.length < 8) {
            toast.error("⚠️ Password must be at least 8 characters long")
            return
        }

        if (!avatar) {
            toast.error("📸 Please upload a profile picture")
            return
        }

        try {
            dispatch(loginStart())
            const data = new FormData()
            data.append("username", formData.username)
            data.append("email", formData.email)
            data.append("fullName", formData.fullName)
            data.append("password", formData.password)
            data.append("avatar", avatar)
            if (coverImage) {
                data.append("coverImage", coverImage)
            }

            const response = await registerUser(data)
            const { user, accessToken } = response
            localStorage.setItem("accessToken", accessToken)
            dispatch(loginSuccess(user))
            toast.success(`🎉 Welcome to Viewly, ${user.username}!`)
            navigate("/")
        } catch (error) {
            dispatch(loginFailure(error.message || "Registration failed"))
            const errorMessage = error.message || "Unable to create account."
            if (errorMessage.includes("already exists")) {
                toast.error("❌ Username or email already taken.")
            } else {
                toast.error(`❌ ${errorMessage}`)
            }
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden font-['Outfit']">
            <div className="absolute inset-0 overflow-hidden">
                <img
                    src={authBgBright}
                    alt="Background"
                    className="w-full h-full object-cover animate-slow-zoom opacity-90"
                />
            </div>

            {/* Reduced blur and overlay opacity for cleaner look */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"></div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full animate-fade-in-up">
                {/* Left Side: Slogan (Removed) */}

                {/* Right Side: Form Card */}
                <div className="w-full md:w-[480px] bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl p-8 relative group/card border border-white/40">
                    {/* Developer Info Icon */}
                    <div className="absolute top-6 right-6 z-20">
                        <div className="relative group/info">
                            <Info
                                size={24}
                                className="text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                            />

                            {/* Tooltip */}
                            <div className="absolute right-0 top-8 w-64 bg-[#1E2021]/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 transform origin-top-right scale-95 group-hover/info:scale-100 border border-gray-700/50">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-600 shadow-md">
                                            <img
                                                src={developerProfile}
                                                alt="Prajjwal Sahu"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-[#1E2021]"></div>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="font-bold text-lg font-['Outfit'] text-white">
                                            Prajjwal Sahu
                                        </h3>
                                        <p className="text-xs text-gray-400 font-['Calibri']">
                                            Full Stack Developer
                                        </p>
                                    </div>

                                    <div className="w-full h-[1px] bg-gray-700/50 my-1"></div>

                                    <div className="flex flex-col gap-2 w-full">
                                        <a
                                            href="https://github.com/Prajjwal2051/Viewly"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors group/link"
                                        >
                                            <div className="bg-gray-800 p-1.5 rounded-md group-hover/link:bg-black transition-colors">
                                                <Github
                                                    size={16}
                                                    className="text-white"
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-300 group-hover/link:text-white">
                                                Viewly Repo
                                            </span>
                                        </a>

                                        <a
                                            href="mailto:prajjwal2051@gmail.com"
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors group/link"
                                        >
                                            <div className="bg-gray-800 p-1.5 rounded-md group-hover/link:bg-red-600 transition-colors">
                                                <Mail
                                                    size={16}
                                                    className="text-white"
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-300 group-hover/link:text-white">
                                                prajjwal2051@gmail.com
                                            </span>
                                        </a>
                                    </div>
                                </div>
                                {/* Arrow */}
                                <div className="absolute -top-2 right-1 w-4 h-4 bg-[#1E2021]/95 border-l border-t border-gray-700/50 transform rotate-45"></div>
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                                <span className="text-white font-bold text-2xl font-['Outfit']">
                                    V
                                </span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-[#e60023] mb-2 font-['Playfair_Display']">
                            Welcome to Viewly
                        </h2>
                        <p className="text-gray-500 font-light tracking-wide">
                            Find new ideas to try
                        </p>
                    </div>

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all text-[15px]"
                            disabled={loading}
                        />
                        <Input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all text-[15px] font-['Calibri']"
                            disabled={loading}
                        />
                        <Input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all text-[15px] font-['Calibri']"
                            disabled={loading}
                        />
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all text-[15px] font-['Calibri'] pr-12"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all text-[15px] font-['Calibri'] pr-12"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>

                        <div className="bg-gray-100 rounded-2xl p-2">
                            <label className="block text-xs text-gray-600 px-2 mb-1">
                                Avatar
                            </label>
                            <input
                                type="file"
                                name="avatar"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-600 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full text-lg shadow-lg transform transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed font-['Outfit']"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Continue"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-xs mb-4 px-8">
                            By continuing, you agree to Viewly's{" "}
                            <span className="font-bold text-gray-600 cursor-pointer">
                                Terms of Service
                            </span>{" "}
                            and{" "}
                            <span className="font-bold text-gray-600 cursor-pointer">
                                Privacy Policy
                            </span>
                        </p>
                        <p className="text-gray-600 text-sm">
                            Already a member?{" "}
                            <Link
                                to="/login"
                                className="text-[#e60023] font-bold hover:underline"
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
