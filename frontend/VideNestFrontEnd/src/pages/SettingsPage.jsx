// ============================================
// SETTINGS PAGE - USER PREFERENCES
// ============================================
// Allows users to customize app appearance and manage account settings.
// Implements functional profile updates, password change, and file uploads.

import React, { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { loginSuccess } from "../store/slices/authSlice"
import {
    User,
    Lock,
    Camera,
    Image as ImageIcon,
    Save,
    Loader2,
} from "lucide-react"
import toast from "react-hot-toast"
import {
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    changePassword,
} from "../api/userApi"
import { Card } from "@/components/ui/card"
import Input from "../components/layout/ui/Input"
import Button from "../components/layout/ui/Button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

/**
 * SETTINGS PAGE COMPONENT
 *
 * Sections:
 * 1. Appearance (Dark Mode)
 * 2. Profile Images (Avatar & Cover)
 * 3. Personal Information (Name & Email)
 * 4. Security (Change Password)
 */
const SettingsPage = () => {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    // State for form loading states
    const [loading, setLoading] = useState({
        profile: false,
        password: false,
        avatar: false,
        cover: false,
    })

    // Personal Info State
    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
    })

    // Password State
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    // Handle text input changes
    const handleInfoChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
    }

    // --- FORM SUBMISSION HANDLERS ---

    // 1. Update Personal Information
    const onSavePersonalInfo = async (e) => {
        e.preventDefault()
        if (!formData.fullName || !formData.email) {
            toast.error("Name and Email are required")
            return
        }

        try {
            setLoading((prev) => ({ ...prev, profile: true }))
            const response = await updateAccountDetails(formData)

            // Update Redux state with new user data
            dispatch(loginSuccess(response.data)) // Assuming login action updates user state
            toast.success("Profile updated successfully!")
        } catch (error) {
            console.error("Profile update failed:", error)
            toast.error(error.message || "Failed to update profile")
        } finally {
            setLoading((prev) => ({ ...prev, profile: false }))
        }
    }

    // 2. Change Password
    const onChangePassword = async (e) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match")
            return
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        try {
            setLoading((prev) => ({ ...prev, password: true }))
            await changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword,
            })

            toast.success("Password changed successfully")
            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
        } catch (error) {
            console.error("Password change failed:", error)
            toast.error(error.message || "Failed to change password")
        } finally {
            setLoading((prev) => ({ ...prev, password: false }))
        }
    }

    // 3. Update Avatar
    const onAvatarChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append("avatar", file)

        try {
            setLoading((prev) => ({ ...prev, avatar: true }))
            const response = await updateUserAvatar(formData)

            // Update Redux state
            dispatch(loginSuccess(response.data))
            toast.success("Avatar updated!")
        } catch (error) {
            console.error("Avatar update failed:", error)
            toast.error("Failed to update avatar")
        } finally {
            setLoading((prev) => ({ ...prev, avatar: false }))
        }
    }

    // 4. Update Cover Image
    const onCoverImageChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append("coverImage", file) // Note: route expects 'coverImage'

        try {
            setLoading((prev) => ({ ...prev, cover: true }))
            const response = await updateUserCoverImage(formData)

            // Update Redux state
            dispatch(loginSuccess(response.data))
            toast.success("Cover image updated!")
        } catch (error) {
            console.error("Cover image update failed:", error)
            toast.error("Failed to update cover image")
        } finally {
            setLoading((prev) => ({ ...prev, cover: false }))
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
            <h1 className="text-3xl font-bold mb-8 text-foreground">
                Settings
            </h1>

            {/* SECTION 1: PROFILE IMAGES */}
            <Card className="overflow-hidden mb-6">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-foreground">
                        <ImageIcon className="w-5 h-5 text-red-600" />
                        Profile Images
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center">
                            <div className="relative group mb-4">
                                <Avatar className="w-32 h-32 border-4 border-background shadow-lg ring-2 ring-red-600/20">
                                    <AvatarImage
                                        src={user?.avatar}
                                        alt="Avatar"
                                        className="object-cover"
                                    />
                                    <AvatarFallback>
                                        {user?.fullName?.[0] || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    {loading.avatar ? (
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-8 h-8 text-white" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={onAvatarChange}
                                        disabled={loading.avatar}
                                    />
                                </label>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                Profile Picture
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Click to change
                            </p>
                        </div>

                        {/* Cover Image Upload */}
                        <div className="flex flex-col items-center">
                            <div className="relative group mb-4 w-full h-32 rounded-xl overflow-hidden shadow-md ring-1 ring-white/10">
                                {user?.coverImage ||
                                user?.coverImg ||
                                user?.coverimage ? (
                                    <img
                                        src={
                                            user?.coverImage ||
                                            user?.coverImg ||
                                            user?.coverimage
                                        }
                                        alt="Cover"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-700 flex items-center justify-center">
                                        <ImageIcon className="text-gray-500" />
                                    </div>
                                )}
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    {loading.cover ? (
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-8 h-8 text-white" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={onCoverImageChange}
                                        disabled={loading.cover}
                                    />
                                </label>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                Cover Image
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Click to change
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* SECTION 2: PERSONAL INFORMATION */}
            <Card className="overflow-hidden mb-6">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-foreground">
                        <User className="w-5 h-5 text-red-600" />
                        Personal Information
                    </h2>
                    <form onSubmit={onSavePersonalInfo} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Full Name
                                </label>
                                <Input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInfoChange}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Email Address
                                </label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInfoChange}
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={loading.profile}
                                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                            >
                                {loading.profile ? (
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Save size={18} />
                                )}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>

            {/* SECTION 3: SECURITY */}
            <Card className="overflow-hidden">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-foreground">
                        <Lock className="w-5 h-5 text-red-600" />
                        Security
                    </h2>
                    <form
                        onSubmit={onChangePassword}
                        className="space-y-4 max-w-lg"
                    >
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Current Password
                            </label>
                            <Input
                                type="password"
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                New Password
                            </label>
                            <Input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Confirm New Password
                            </label>
                            <Input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="flex justify-start pt-2">
                            <Button
                                type="submit"
                                disabled={loading.password}
                                variant="secondary"
                                className="flex items-center gap-2"
                            >
                                {loading.password ? (
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Lock size={18} />
                                )}
                                Change Password
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    )
}

export default SettingsPage
