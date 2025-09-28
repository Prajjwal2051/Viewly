import mongoose, { mongo, Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: [true, "Password is Required"]
    },
    refreshToken: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "video",
        }
    ],
    avatar: {
        type: String, // cloudinary url
    },
    coverImag: {
        type: String
    }
}, { timestamps: true })

userSchema.pre("save",async function (next) {
    if(this.isModified("password")){
        this.password=bcrypt.hash(this.password,10)
        next()
    }else{
        return next()
    }
    
})

userSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAcessToken= function(){
    return jwt.sign({
        __id:this.__id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefresh=function(){
    return jwt.sign({
        __id:this.__id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}


export const user = mongoose.model("user", userSchema)