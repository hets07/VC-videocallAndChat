import mongoose, { mongo } from "mongoose";


const callschema=mongoose.Schema({
    caller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    callType: {
        type: String,
        enum: ["video", "audio"], 
        required: true,
    },
    status: {
        type: String,
        enum: ["missed", "completed", "rejected"],
        default: "completed",
    },
    duration: {
        type: Number, 
        default: 0,
    },
    callStartTime: {
        type: Date,
        default: Date.now,
    },
    callEndTime: {
        type: Date, 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

const Callhistory=mongoose.model("callhistory",callschema)
export default Callhistory