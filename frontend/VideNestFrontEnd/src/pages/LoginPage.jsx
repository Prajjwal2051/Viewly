import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
    loginStart,
    loginSuccess,
    loginFailure,
} from "../store/slices/authSlice"
import { loginUser } from "../api/authApi"
import toast from "react-hot-toast"
import Input from "../components/layout/ui/Input"
import Button from "../components/layout/ui/Button"
import authBgBright from "../assets/auth_bg_bright.png"

const LoginPage = () => {
    // Form state handling
    const [formData, setFormData] = useState({
        usernameOrEmail: "",
        password: "",
    })

    const navigate = useNavigate()
    const dispatch = useDispatch()

    // Select auth state from Redux store to check loading/error status
    const { loading } = useSelector((state) => state.auth)

    // Update form state on input change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    /**
     * HANDLE SUBMIT
     * 1. Validate inputs
     * 2. Dispatch loginStart action
     * 3. Call backend API
     * 4. Dispatch loginSuccess on success, or loginFailure on error
     * 5. Redirect to home page
     */
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Basic validation
        if (!formData.usernameOrEmail || !formData.password) {
            toast.error("⚠️ Please fill in all fields")
            return
        }

        try {
            dispatch(loginStart())
            const response = await loginUser(formData)

            // Assuming response contains user object and tokens
            const { user, accessToken } = response

            // Helper function to safely store tokens
            localStorage.setItem("accessToken", accessToken)

            dispatch(loginSuccess(user))
            toast.success(`Welcome back, ${user.username}!`)
            navigate("/") // Redirect to home page
        } catch (err) {
            const errorMessage = err.message || "Invalid credentials"
            dispatch(loginFailure(errorMessage))
            toast.error(`❌ ${errorMessage}`)
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-['Playfair_Display']">
                            Welcome to VidNest
                        </h2>
                        <p className="text-gray-500">Find new ideas to try</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username/Email Input */}
                        <Input
                            type="text"
                            name="usernameOrEmail"
                            placeholder="Username or Email"
                            value={formData.usernameOrEmail}
                            onChange={handleChange}
                            required
                            className="bg-gray-100 border-transparent rounded-2xl py-3 px-4 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-inner font-['Outfit']"
                            disabled={loading}
                        />

                        {/* Password Input */}
                        <Input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="bg-gray-100 border-transparent rounded-2xl py-3 px-4 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-inner font-['Outfit']"
                            disabled={loading}
                        />

                        <div className="text-right">
                            <a
                                href="#"
                                className="text-sm text-gray-500 hover:text-gray-900 font-medium"
                            >
                                Forgot your password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full text-lg shadow-lg transform transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed font-['Outfit']"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Log in"}
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
                        <p className="text-gray-500 text-sm">
                            Not on VidNest yet?{" "}
                            <Link
                                to="/register"
                                className="text-gray-900 font-bold hover:underline"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
