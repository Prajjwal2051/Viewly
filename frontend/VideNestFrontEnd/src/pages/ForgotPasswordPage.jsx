import { useState } from "react"
import { Link } from "react-router-dom"
import { forgotPassword } from "../api/authApi"
import toast from "react-hot-toast"
import { Mail, ArrowLeft, Loader2 } from "lucide-react"

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email) {
            toast.error("Please enter your email address")
            return
        }

        setLoading(true)

        try {
            await forgotPassword(email)
            setEmailSent(true)
            toast.success("Password reset link sent to your email!")
        } catch (error) {
            toast.error(error?.message || "Failed to send reset link")
        } finally {
            setLoading(false)
        }
    }

    if (emailSent) {
        return (
            <div className="min-h-screen bg-[#1E2021] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Check Your Email
                    </h2>
                    <p className="text-gray-600 mb-6">
                        We've sent a password reset link to{" "}
                        <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        The link will expire in 15 minutes. Don't forget to
                        check your spam folder.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1E2021] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Forgot Password?
                </h2>
                <p className="text-gray-600 mb-8">
                    Enter your email and we'll send you a link to reset your
                    password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="you@example.com"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordPage
