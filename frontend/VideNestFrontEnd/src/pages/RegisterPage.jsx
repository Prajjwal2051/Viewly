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

const RegisterPage = () => {
    // Form state
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        fullName: "",
        password: "",
        confirmPassword: "",
    })
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
            toast.success(`🎉 Welcome to VidNest, ${user.username}!`)
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
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden font-['Outfit']"
            style={{ backgroundImage: `url(${authBgBright})` }}
        >
            {/* Reduced blur and overlay opacity for cleaner look */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-20">
                {/* Left Side: Slogan (Animated) */}
                <div className="hidden md:block w-full md:w-1/2 text-center md:text-left space-y-6">
                    <h1 className="text-6xl lg:text-8xl font-bold text-white tracking-tighter leading-tight drop-shadow-2xl font-['Playfair_Display'] italic">
                        <span className="block animate-fadeInUp">
                            Sign up to
                        </span>
                        <span className="block animate-fadeInUp delay-200">
                            get your
                        </span>
                        <span className="block animate-fadeInUp delay-400">
                            ideas
                        </span>
                    </h1>
                </div>

                {/* Right Side: Form Card (Removed border) */}
                <div className="w-full md:w-[480px] bg-white rounded-[32px] shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 bg-red-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-2xl font-['Outfit']">
                                    V
                                </span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-[#e60023] mb-2 font-['Playfair_Display']">
                            Welcome to VidNest
                        </h2>
                        <p className="text-gray-600">Find new ideas to try</p>
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
                            className="bg-gray-100 border-transparent rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-inner font-['Outfit']"
                            disabled={loading}
                        />
                        <Input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-gray-100 border-transparent rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-inner font-['Outfit']"
                            disabled={loading}
                        />
                        <Input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="bg-gray-100 border-transparent rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-inner font-['Outfit']"
                            disabled={loading}
                        />
                        <Input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="bg-gray-100 border-transparent rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-inner font-['Outfit']"
                            disabled={loading}
                        />
                        <Input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="bg-gray-100 border-transparent rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-inner font-['Outfit']"
                            disabled={loading}
                        />

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
                            By continuing, you agree to VidNest's{" "}
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
