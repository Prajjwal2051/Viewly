import { useState } from "react"
import { useForm } from "react-hook-form"
import {
    Upload,
    X,
    Film,
    Image as ImageIcon,
    Loader2,
    Type,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { uploadVideo } from "../api/videoApi"
import { createTweet } from "../api/tweetApi"
import Input from "../components/layout/ui/Input"

const UploadPage = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [postType, setPostType] = useState("video") // 'video' or 'tweet'

    // Previews
    const [videoPreview, setVideoPreview] = useState(null)
    const [thumbnailPreview, setThumbnailPreview] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm()

    // Handle file selection
    const handleFileChange = (e, field) => {
        const file = e.target.files[0]
        if (file) {
            setValue(field, file)

            // Create preview URL
            const url = URL.createObjectURL(file)
            if (field === "videoFile") setVideoPreview(url)
            if (field === "thumbnail") setThumbnailPreview(url)
            if (field === "image") setImagePreview(url)
        }
    }

    const onSubmit = async (data) => {
        try {
            setIsLoading(true)

            if (postType === "video") {
                const formData = new FormData()
                formData.append("video", data.videoFile)
                formData.append("thumbnail", data.thumbnail)
                formData.append("title", data.title)
                formData.append("description", data.description)
                formData.append("category", data.category || "General")
                formData.append("tags", data.tags)

                await uploadVideo(formData)
                toast.success("Video uploaded successfully!")
            } else {
                // Handle Tweet/Photo Post
                await createTweet({
                    content: data.description, // using description field as content
                    image: data.image,
                })
                toast.success("Post created successfully!")
            }

            navigate("/")
        } catch (error) {
            console.error("Upload failed:", error)
            toast.error(error.message || "Failed to upload")
        } finally {
            setIsLoading(false)
        }
    }

    // Toggle handler to clear state when switching modes
    const togglePostType = (type) => {
        if (type === postType) return
        setPostType(type)
        reset()
        setVideoPreview(null)
        setThumbnailPreview(null)
        setImagePreview(null)
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Create Post
            </h1>

            {/* Post Type Toggle */}
            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => togglePostType("video")}
                    className={`flex-1 py-4 rounded-xl flex items-center justify-center space-x-2 transition-all ${
                        postType === "video"
                            ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                    <Film size={20} />
                    <span className="font-semibold">Upload Video</span>
                </button>
                <button
                    onClick={() => togglePostType("tweet")}
                    className={`flex-1 py-4 rounded-xl flex items-center justify-center space-x-2 transition-all ${
                        postType === "tweet"
                            ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                    <ImageIcon size={20} />
                    <span className="font-semibold">Post Video / Photo</span>
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {postType === "video" ? (
                    // VIDEO UPLOAD FORM
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            {/* Video Upload Area */}
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                    errors.videoFile
                                        ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                                        : "border-gray-300 dark:border-gray-700 hover:border-red-500"
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
                                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                                            <Upload size={32} />
                                        </div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                                            Click to upload video
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
                                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500"
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
                                        : "border-gray-300 dark:border-gray-700 hover:border-red-500"
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
                                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500"
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

                        {/* Metadata inputs */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Video Title
                                </label>
                                <Input
                                    {...register("title", {
                                        required: "Title is required",
                                    })}
                                    placeholder="Enter title..."
                                    className="bg-gray-100 dark:bg-gray-700 border-transparent rounded-2xl"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.title.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    {...register("description", {
                                        required: "Description is required",
                                    })}
                                    rows="4"
                                    className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-2xl p-4 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-red-600 outline-none resize-none"
                                    placeholder="Tell viewers about your video..."
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Category
                                    </label>
                                    <select
                                        {...register("category")}
                                        className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-2xl p-3 text-gray-900 dark:text-white outline-none"
                                    >
                                        <option value="General">General</option>
                                        <option value="Music">Music</option>
                                        <option value="Gaming">Gaming</option>
                                        <option value="Technology">
                                            Technology
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tags
                                    </label>
                                    <Input
                                        {...register("tags")}
                                        placeholder="Comma separated..."
                                        className="bg-gray-100 dark:bg-gray-700 border-transparent rounded-2xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // TWEET / PHOTO POST FORM
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                errors.image
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-gray-700 hover:border-red-500"
                            }`}
                        >
                            <input
                                type="file"
                                id="image-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, "image")}
                            />
                            {!imagePreview ? (
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                                        <ImageIcon size={32} />
                                    </div>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                        Upload Photo
                                    </span>
                                    <span className="text-sm text-gray-500 mt-2">
                                        JPG, PNG, GIF
                                    </span>
                                </label>
                            ) : (
                                <div className="relative rounded-lg overflow-hidden">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full max-h-96 object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null)
                                            setValue("image", null)
                                        }}
                                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            {errors.image && (
                                <p className="text-red-500 text-sm mt-2">
                                    Image is required for photo posts
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Caption
                            </label>
                            <textarea
                                {...register("description", {
                                    required: "Caption is required",
                                })}
                                rows="3"
                                className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-2xl p-4 text-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-red-600 outline-none resize-none"
                                placeholder="What's on your mind?"
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 text-lg bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-red-500/30"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={24} />
                            <span>Publishing...</span>
                        </>
                    ) : (
                        <>
                            <Upload size={24} />
                            <span>
                                {postType === "video"
                                    ? "Publish Video"
                                    : "Post Photo"}
                            </span>
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}

export default UploadPage
