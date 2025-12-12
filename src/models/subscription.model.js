import mongoose, { mongo, Schema } from "mongoose"

const subscriptionSchema = new mongoose.Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
)

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

subscriptionSchema.plugin(mongooseAggregatePaginate)

export const subscription = mongoose.model("Subscription", subscriptionSchema)
