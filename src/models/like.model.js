import mongoose, { Mongoose, mongo, Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import { Comment } from "./comment.model.js"

const likeSchema = new mongoose.Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
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

// Ensure that a particular user likes a video, comment, or tweet only once
// Using partial indexes to exclude null values completely from the index
likeSchema.index(
    { video: 1, likedBy: 1 },
    { unique: true, partialFilterExpression: { video: { $type: "objectId" } } }
)
likeSchema.index(
    { comment: 1, likedBy: 1 },
    {
        unique: true,
        partialFilterExpression: { comment: { $type: "objectId" } },
    }
)
likeSchema.index(
    { tweet: 1, likedBy: 1 },
    { unique: true, partialFilterExpression: { tweet: { $type: "objectId" } } }
)

export const like = mongoose.model("Like", likeSchema)
