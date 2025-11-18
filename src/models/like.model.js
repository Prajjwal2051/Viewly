import mongoose, { Mongoose, mongo, Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import { comment } from "./comment.model"

const likeSchema = new mongoose.Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "video",
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
)
likeSchema.plugin(mongooseAggregatePaginate)

// and we also need to ensure that a particular user likes a video or comment only once
likeSchema.index({ video: 1, likedBy: 1 }, { unique: true, sparse: true })
likeSchema.index({ comment: 1, likedBy: 1 }, { unique: true, sparse: true })

export const like = mongoose.model("Like", likeSchema)
