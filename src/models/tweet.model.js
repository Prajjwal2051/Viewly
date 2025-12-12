import mongoose, { Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const tweetSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        image: {
            type: String, // Cloudinary URL
            required: false, // Optional for text-only tweets
        },
        likes: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
)

tweetSchema.plugin(mongooseAggregatePaginate)

export const Tweet = mongoose.model("Tweet", tweetSchema)
