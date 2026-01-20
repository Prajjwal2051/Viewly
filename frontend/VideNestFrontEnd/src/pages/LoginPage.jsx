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
import { Eye, EyeOff, Info, Github, Mail } from "lucide-react"
import developerProfile from "../assets/developer_profile.jpg"
import logo from "../assets/logo.png"

// console.log("Login Background Path:", authBgBright)

const LoginPage = () => {
    // Form state handling
    const [formData, setFormData] = useState({
        usernameOrEmail: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    // Select auth state from Redux store to check loading/error status
    const { loading } = useSelector((state) => state.auth)

    // Check for session expired URL parameter
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get("sessionExpired") === "true") {
            toast.error("Your session has expired. Please log in again.")
            // Clean up URL
            window.history.replaceState({}, "", "/login")
        }
    }, [])

    // Update form state on input change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    /**
     * HANDLE SUBMIT (older version)
     * 1. Validate inputs
     * 2. Dispatch loginStart action
     * 3. Call backend API
     * 4. Dispatch loginSuccess on success, or loginFailure on error
     * 5. Redirect to home page
     */
    /**
     * HANDLE SUBMIT (SECURE VERSION)
     *
     * What changed?
     * ❌ REMOVED: localStorage.setItem("accessToken", ...)
     * ✅ SECURE: Tokens now in HTTP-only cookies (set by backend)
     *
     * Flow:
     * 1. User submits login form
     * 2. Backend validates credentials
     * 3. Backend sets HTTP-only cookies (accessToken + refreshToken)
     * 4. Frontend receives user data (NO tokens in response)
     * 5. All future requests include cookies automatically
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

            console.log("Login response:", response) // Debug log

            // Backend returns: ApiResponse { statusCode, data: { user, accessToken, refreshToken }, message }
            // Interceptor returns: response.data = the whole ApiResponse object
            // So response.data contains { user, accessToken, refreshToken }
            // But we DON'T store accessToken anymore!  ---> this is the new thing in secure version
            let user
            // let accessToken

            if (response.data) {
                // Response structure: { data: { user, accessToken } }
                user = response.data.user
                // accessToken = response.data.accessToken
            } else if (response.user) {
                // Fallback: direct structure { user, accessToken }
                user = response.user
                // accessToken = response.accessToken
            } else {
                throw new Error("Invalid response structure from server")
            }

            // if (!user || !accessToken) {
            //     console.error("Missing data:", { user, accessToken })
            //     throw new Error("Login failed: incomplete server response")
            // }
            if (!user) {
                console.error("Missing data:", { user })
                throw new Error("Login failed: incomplete server response")
            }
            // SECURE: Only store user data in Redux (NO tokens!)
            // Tokens are already in HTTP-only cookies (set by backend)

            // Store token and update state
            // localStorage.setItem("accessToken", accessToken)

            dispatch(loginSuccess(user))
            toast.success(`Welcome back, ${user.username || user.fullName}!`)
            navigate("/") // Redirect to home page
        } catch (err) {
            const errorMessage = err.message || "Invalid credentials"
            dispatch(loginFailure(errorMessage))
            toast.error(`❌ ${errorMessage}`)
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
                            <div className="h-20 w-20 flex items-center justify-center transition-transform duration-300 hover:scale-110 rounded-full overflow-hidden shadow-lg shadow-red-500/20">
                                <img
                                    src={logo}
                                    alt="Viewly"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-[#e60023] mb-2 font-['Playfair_Display']">
                            Welcome to Viewly
                        </h2>
                        <p className="text-gray-500 font-light tracking-wide">
                            Find new ideas to try
                        </p>
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
                            className="!bg-gray-50 dark:!bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 !text-gray-800 dark:!text-gray-800 placeholder-gray-400 focus:!bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all text-[15px] font-['Calibri']"
                            disabled={loading}
                        />

                        {/* Password Input */}
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="!bg-gray-50 dark:!bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 !text-gray-800 dark:!text-gray-800 placeholder-gray-400 focus:!bg-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all text-[15px] font-['Calibri'] pr-12"
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

                        <div className="text-right">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Forgot your password?
                            </Link>
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
                            Not on Viewly yet?{" "}
                            <Link
                                to="/register"
                                className="text-[#e60023] font-bold hover:underline"
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
