import mongoose, { mongo, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        require: true,
        index: true
    },
    videoFile: {
        type: String,
        require: true,
        unique: true,
        index: true
    },
    thumbNail: {
        type: String,
    },
    owner: {
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
    },
    duration: {
        type: Number, // time is in seconds
    },
    views: {
        type: Number,
        default:0
    },
    isPublished: {
        type: Boolean,
        require: true,
        default:true
    }
}, {
    timestamps: true
})
videoSchema.plugin(mongooseAggregatePaginate)

export const video = mongoose.model("video", videoSchema)
