import mongoose from "mongoose"
import { Schema } from "mongoose"

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        type: {
            type: String,
            enum: ["LIKE", "COMMENT", "SUBSCRIPTION", "VIDEO_UPLOAD"],
            required: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        }
    },
    { timestamps: true }
)

export const Notification = mongoose.model("Notification", notificationSchema)
