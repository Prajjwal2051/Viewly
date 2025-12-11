// ============================================
// UPLOAD PAGE - VIDEO UPLOAD INTERFACE
// ============================================
// Placeholder page for uploading videos to the platform.
// Future features: video upload, thumbnail selection, metadata editing.

/**
 * UPLOAD PAGE COMPONENT
 * Will provide interface for content creators to upload videos
 *
 * Future Implementation:
 * - Video file upload with drag-and-drop
 * - Thumbnail image upload/selection
 * - Title, description, and tags input
 * - Category and visibility settings
 * - Upload progress bar
 * - Video preview before publishing
 */
// ============================================
// UPLOAD PAGE - VIDEO UPLOAD INTERFACE
// ============================================
// Provides interface for content creators to upload videos.
// Features: Drag-and-drop, metadata form, progress indication.

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Upload, X, Film, Image as ImageIcon, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { uploadVideo } from "../api/videoApi"
import Input from "../components/layout/ui/Input"

const UploadPage = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [videoPreview, setVideoPreview] = useState(null)
    const [thumbnailPreview, setThumbnailPreview] = useState(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm()

    // Watch files to show names/previews
    const videoFile = watch("videoFile")
    const thumbnailFile = watch("thumbnail")

    // Handle file selection
    const handleFileChange = (e, field) => {
        const file = e.target.files[0]
        if (file) {
            setValue(field, file)

            // Create preview URL
            const url = URL.createObjectURL(file)
            if (field === "videoFile") setVideoPreview(url)
            if (field === "thumbnail") setThumbnailPreview(url)
        }
    }

    const onSubmit = async (data) => {
        try {
            setIsLoading(true)
            const formData = new FormData()

            // Append files (critical: must match backend expectations)
            formData.append("videoFile", data.videoFile)
            formData.append("thumbnail", data.thumbnail)

            // Append metadata
            formData.append("title", data.title)
            formData.append("description", data.description)
            formData.append("category", data.category || "General")
            // Handle tags (split string into array if needed, or send as string depending on backend)
            // Assuming backend accepts comma-separated string or handles parsing
            formData.append("tags", data.tags)

            await uploadVideo(formData)

            toast.success("Video uploaded successfully!")
            navigate("/") // Redirect to home after success
        } catch (error) {
            console.error("Upload failed:", error)
            toast.error(error.message || "Failed to upload video")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Upload Video
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT COLUMN: File Uploads */}
                    <div className="space-y-6">
                        {/* Video Upload Area */}
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                errors.videoFile
                                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                                    : "border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400"
                            }`}
                        >
                            <input
                                type="file"
                                id="video-upload"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) =>
                                    handleFileChange(e, "videoFile")
                                }
                            />

                            {!videoPreview ? (
                                <label
                                    htmlFor="video-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                                        <Upload size={32} />
                                    </div>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                        Click to upload video
                                    </span>
                                    <span className="text-sm text-gray-500 mt-2">
                                        MP4, WebM, or Ogg
                                    </span>
                                </label>
                            ) : (
                                <div className="relative rounded-lg overflow-hidden bg-black">
                                    <video
                                        src={videoPreview}
                                        className="w-full h-48 object-contain"
                                        controls
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setVideoPreview(null)
                                            setValue("videoFile", null)
                                        }}
                                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            {errors.videoFile && (
                                <p className="text-red-500 text-sm mt-2">
                                    Video is required
                                </p>
                            )}
                        </div>

                        {/* Thumbnail Upload Area */}
                        <div
                            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                                errors.thumbnail
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-gray-700 hover:border-purple-500"
                            }`}
                        >
                            <input
                                type="file"
                                id="thumbnail-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                    handleFileChange(e, "thumbnail")
                                }
                            />

                            {!thumbnailPreview ? (
                                <label
                                    htmlFor="thumbnail-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 text-gray-600 dark:text-gray-400">
                                        <ImageIcon size={24} />
                                    </div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        Upload Thumbnail
                                    </span>
                                </label>
                            ) : (
                                <div className="relative rounded-lg overflow-hidden">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Thumbnail preview"
                                        className="w-full h-40 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setThumbnailPreview(null)
                                            setValue("thumbnail", null)
                                        }}
                                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            {errors.thumbnail && (
                                <p className="text-red-500 text-sm mt-2">
                                    Thumbnail is required
                                </p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Metadata Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Video Title
                                </label>

                                <Input
                                    {...register("title", {
                                        required: "Title is required",
                                    })}
                                    type="text"
                                    className="bg-gray-100 dark:bg-gray-700 border-transparent rounded-2xl py-3 px-4 text-gray-900 dark:text-white placeholder-gray-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all shadow-inner font-['Outfit']"
                                    placeholder="Enter generic title..."
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.title.message}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>

                                <textarea
                                    {...register("description", {
                                        required: "Description is required",
                                    })}
                                    rows="4"
                                    className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-2xl py-3 px-4 text-gray-900 dark:text-white placeholder-gray-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all shadow-inner font-['Outfit'] outline-none resize-none"
                                    placeholder="Tell viewers about your video..."
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>

                            {/* Category & Tags Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Category
                                    </label>

                                    <select
                                        {...register("category")}
                                        className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-2xl py-3 px-4 text-gray-900 dark:text-white placeholder-gray-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all shadow-inner font-['Outfit'] outline-none"
                                    >
                                        <option value="General">General</option>
                                        <option value="Music">Music</option>
                                        <option value="Gaming">Gaming</option>
                                        <option value="Education">
                                            Education
                                        </option>
                                        <option value="Technology">
                                            Technology
                                        </option>
                                        <option value="Entertainment">
                                            Entertainment
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tags
                                    </label>

                                    <Input
                                        {...register("tags")}
                                        type="text"
                                        className="bg-gray-100 dark:bg-gray-700 border-transparent rounded-2xl py-3 px-4 text-gray-900 dark:text-white placeholder-gray-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all shadow-inner font-['Outfit']"
                                        placeholder="Comma separated..."
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-6 py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2
                                            className="animate-spin"
                                            size={20}
                                        />
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        <span>Publish Video</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default UploadPage
