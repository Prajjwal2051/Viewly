import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { resetPassword } from "../api/authApi"
import toast from "react-hot-toast"
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"

const ResetPasswordPage = () => {
    const { token } = useParams()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.password || !formData.confirmPassword) {
            toast.error("Please fill in all fields")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setLoading(true)

        try {
            await resetPassword(token, formData)
            setSuccess(true)
            toast.success("Password reset successful!")

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login")
            }, 2000)
        } catch (error) {
            toast.error(error?.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#1E2021] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Password Reset Successful!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Your password has been updated. Redirecting to login...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1E2021] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl p-8">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Reset Password
                    </h2>
                    <p className="text-gray-600">
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Enter new password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Confirm new password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Resetting...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordPage
