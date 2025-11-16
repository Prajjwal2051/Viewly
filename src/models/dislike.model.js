import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const dislikeSchema = new mongoose.Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: 'video',
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    dislikedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true
})

dislikeSchema.plugin(mongooseAggregatePaginate)

// Ensure user can dislike a video or comment only once
dislikeSchema.index({ video: 1, dislikedBy: 1 }, { unique: true, sparse: true })
dislikeSchema.index({ comment: 1, dislikedBy: 1 }, { unique: true, sparse: true })

export const Dislike = mongoose.model("Dislike", dislikeSchema)
