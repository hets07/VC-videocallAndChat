import mongoose from "mongoose";

const userSchema=mongoose.Schema({
    password:{
        type:String,
        required:true,
        
    },
    name:{
        type:String,
        required:true,
    },
    surname:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    profile:{
        type:String,
        default:null
    },
    bio:{
        type:String,
        default:null
    },
    lastseen:{
        type:Date,
        default:null
    },
    SocketId:{
        type:String,
        default:null
    },
    friends:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    friendRequests:[{type:mongoose.Schema.Types.ObjectId,ref:'User' }],


},{ timestamps: true })


const User=mongoose.model("User",userSchema,"users")


export default User;