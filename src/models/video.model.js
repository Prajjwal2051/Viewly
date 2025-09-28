import mongoose,{mongo, Schema} from "mongoose";

const videoSchema=new mongoose.Schema({
    id:{
        type:String,
        unique:true,
        require:true,
        index:true
    },
    videoFile:{
        type:String,
        require:true,
        unique:true,
        index:true
    },
    thumbNail:{
        type:String,
    },
    owner:{
        type:String,
        require:true,
    },
    title:{
        type:String,
        require:true,
    },
    description:{
        type:String,
    },
    duration:{
        type:Number, // time is in seconds
    },
    views:{
        type:Number, 
    },
    isPublished:{
        type:Boolean,
        require:true
    }
},{
    timestamps:true
})

export const video=mongoose.model("video",videoSchema)
