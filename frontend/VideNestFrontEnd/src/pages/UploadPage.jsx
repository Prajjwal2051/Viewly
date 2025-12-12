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
                // Handle Tweet Post
                const formData = new FormData()
                formData.append("content", data.content)
                if (data.image) {
                    formData.append("image", data.image)
                }

                await createTweet(formData)
                toast.success("Tweet posted successfully!")
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
            <h1 className="text-3xl font-bold text-white mb-6">
                Create Post
            </h1>

            {/* Post Type Toggle */}
            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => togglePostType("video")}
                    className={`flex-1 py-4 rounded-xl flex items-center justify-center space-x-2 transition-all ${
                        postType === "video"
                            ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                            : "bg-[#1E2021] text-gray-400 hover:bg-[#2A2D2E]"
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
                            : "bg-[#1E2021] text-gray-400 hover:bg-[#2A2D2E]"
                    }`}
                >
                    <Type size={20} />
                    <span className="font-semibold">Create Tweet</span>
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
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-300 hover:border-red-500"
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
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                                            <Upload size={32} />
                                        </div>
                                        <span className="font-semibold text-gray-500">
                                            Click to upload video
                                        </span>
                                    </label>
                                ) : (
                                    <div className="relative rounded-lg overflow-hidden bg-[#1E2021]">
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
                                            className="absolute top-2 right-2 p-1 bg-[#1E2021]/50 text-white rounded-full hover:bg-red-500"
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
                                        : "border-gray-300 hover:border-red-500"
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
                                        <div className="w-12 h-12 bg-[#2A2D2E] rounded-full flex items-center justify-center mb-3 text-gray-400">
                                            <ImageIcon size={24} />
                                        </div>
                                        <span className="font-medium text-gray-500">
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
                                            className="absolute top-2 right-2 p-1 bg-[#1E2021]/50 text-white rounded-full hover:bg-red-500"
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
                        <div className="bg-[#1E2021] rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Video Title
                                </label>
                                <Input
                                    {...register("title", {
                                        required: "Title is required",
                                    })}
                                    placeholder="Enter title..."
                                    className="bg-[#2A2D2E] border-transparent rounded-2xl"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.title.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Description
                                </label>
                                <textarea
                                    {...register("description", {
                                        required: "Description is required",
                                    })}
                                    rows="4"
                                    className="w-full bg-[#2A2D2E] border-transparent rounded-2xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-600 outline-none resize-none"
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
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Category
                                    </label>
                                    <select
                                        {...register("category")}
                                        className="w-full bg-[#2A2D2E] border-transparent rounded-2xl p-3 text-white outline-none"
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
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Tags
                                    </label>
                                    <Input
                                        {...register("tags")}
                                        placeholder="Comma separated..."
                                        className="bg-[#2A2D2E] border-transparent rounded-2xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // TWEET CREATION FORM
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-[#1E2021] rounded-2xl p-8 shadow-lg border border-gray-100 space-y-6">
                            {/* Tweet Text Area */}
                            <div>
                                <label className="block text-lg font-semibold text-white mb-3">
                                    What's happening?
                                </label>
                                <textarea
                                    {...register("content", {
                                        required: "Tweet content is required",
                                        maxLength: {
                                            value: 280,
                                            message:
                                                "Tweet must be 280 characters or less",
                                        },
                                    })}
                                    rows="6"
                                    maxLength={280}
                                    className="w-full bg-[#2A2D2E] border-2 border-[#2A2D2E] rounded-xl p-4 text-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none resize-none"
                                    placeholder="Share your thoughts..."
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span
                                        className={`text-sm font-medium ${
                                            (watch("content")?.length || 0) >
                                            280
                                                ? "text-red-500"
                                                : (watch("content")?.length ||
                                                        0) > 250
                                                  ? "text-yellow-500"
                                                  : "text-gray-500"
                                        }`}
                                    >
                                        {watch("content")?.length || 0} / 280
                                    </span>
                                    {errors.content && (
                                        <p className="text-red-500 text-sm">
                                            {errors.content.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Optional Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">
                                    Add Image (Optional)
                                </label>
                                <div className="border-2 border-dashed rounded-xl p-6 text-center transition-colors border-gray-300 hover:border-red-500">
                                    <input
                                        type="file"
                                        id="tweet-image-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) =>
                                            handleFileChange(e, "image")
                                        }
                                    />
                                    {!imagePreview ? (
                                        <label
                                            htmlFor="tweet-image-upload"
                                            className="cursor-pointer flex flex-col items-center"
                                        >
                                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 text-red-600">
                                                <ImageIcon size={24} />
                                            </div>
                                            <span className="font-medium text-gray-400">
                                                Click to add image
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">
                                                JPG, PNG, GIF (Optional)
                                            </span>
                                        </label>
                                    ) : (
                                        <div className="relative rounded-lg overflow-hidden">
                                            <img
                                                src={imagePreview}
                                                alt="Tweet preview"
                                                className="w-full max-h-80 object-contain rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null)
                                                    setValue("image", null)
                                                }}
                                                className="absolute top-2 right-2 p-2 bg-[#1E2021]/70 text-white rounded-full hover:bg-red-500 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
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
                                    : "Post Tweet"}
                            </span>
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}

export default UploadPage
