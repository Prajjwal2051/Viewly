// ============================================
// RESET PASSWORD PAGE - SET NEW PASSWORD
// ============================================
// Allows users to create new password using reset token from email
// Second step in password recovery process

import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { resetPassword } from "../api/authApi"
import toast from "react-hot-toast"
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import Input from "../components/layout/ui/Input"
import Button from "../components/layout/ui/Button"

/**
 * RESET PASSWORD PAGE COMPONENT
 * Final step of password recovery - user sets new password
 *
 * Purpose:
 * - Allow users to create new password after email verification
 * - Validate new password meets requirements
 * - Confirm password matches before submission
 * - Provide secure password reset flow
 *
 * Features:
 * - Password and confirm password fields
 * - Show/hide password toggles for better UX
 * - Client-side validation (length, matching)
 * - Token-based authentication (from URL)
 * - Success screen with auto-redirect to login
 * - Loading states during submission
 *
 * User Flow:
 * 1. User clicks reset link from email (contains token)
 * 2. Token extracted from URL parameters
 * 3. User enters new password twice
 * 4. System validates and updates password
 * 5. Success screen shown, then redirect to login
 *
 * URL Structure:
 * /reset-password/:token
 * Example: /reset-password/eyJhbGciOiJIUzI1NiIs...
 *
 * State:
 * - formData: New password and confirmation
 * - showPassword: Toggle password visibility
 * - loading: Whether API request is in progress
 * - success: Whether password was successfully reset
 *
 * @returns {JSX.Element} Reset password form or success screen
 */
const ResetPasswordPage = () => {
    // Extract reset token from URL (sent via email link)
    const { token } = useParams()
    const navigate = useNavigate()

    // Form state
    const [formData, setFormData] = useState({
        password: "", // New password
        confirmPassword: "", // Password confirmation
    })

    // UI state
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    /**
     * HANDLE INPUT CHANGES
     * Updates form data as user types
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    /**
     * HANDLE FORM SUBMISSION
     * Validates inputs and calls API to reset password
     */
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation: Check all fields are filled
        if (!formData.password || !formData.confirmPassword) {
            toast.error("Please fill in all fields")
            return
        }

        // Validation: Passwords must match
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        // Validation: Minimum password length
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setLoading(true)

        try {
            // Call API with token and new password
            await resetPassword(token, formData)
            setSuccess(true)
            toast.success("Password reset successful!")

            // Auto-redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login")
            }, 2000)
        } catch (error) {
            toast.error(error?.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    /**
     * SUCCESS SCREEN
     * Shown after password is successfully reset
     * Auto-redirects to login page
     */
    if (success) {
        return (
            <div className="min-h-screen bg-[#1E2021] flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Password Reset Successful!
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Your password has been updated. Redirecting to login...
                    </p>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1E2021] flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                        Reset Password
                    </h2>
                    <p className="text-muted-foreground">
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                disabled={loading}
                                className="pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                disabled={loading}
                                className="pr-12"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                                Resetting...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        Back to Login
                    </Link>
                </div>
            </Card>
        </div>
    )
}

export default ResetPasswordPage
