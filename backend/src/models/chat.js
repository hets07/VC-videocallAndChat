import mongoose from "mongoose";
import User from "./user.js";

const chatSchema=mongoose.Schema({
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User
    },
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User
    },
    message:{
        type:String,
        default:null
    },
    msgstatus:{
        type:String,
        enum:["delivered","read","sent"],
        default:"sent"
    },
    media:{
        type:String,
        default:null
    }
},{timestamps:true})


const Chat=mongoose.model("Chat",chatSchema)

export default Chat