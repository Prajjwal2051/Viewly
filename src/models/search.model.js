import mongoose, { mongo, Schema } from "mongoose"

const searchSchema = new mongoose.Schema(
    {
        query: {
            type: String,
            required: true,
            trim: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        resulsCount: {
            type: Number,
            default: 0,
        },
        searchAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
)

searchSchema.index({ query: 1, searchAt: -1 })

export const Search = mongoose.model("Search", searchSchema)
