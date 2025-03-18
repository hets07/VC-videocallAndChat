import Chat from "../models/chat.js";
import User from "../models/user.js";


export const getFriends = async (req, res) => {
    try {
        const { username } = req.body

        const friends = await User.findOne({username}).populate("firends","username SocketId").select("friends")
       
        
        

        return res.status(200).json({ success: true, messege: "friend list fetched successfully", friends })

    } catch (err) {
        return res.status(500).json({ success: false, meesege: "Internal server error", err })
    }
}

export const getFriendRequests = async (req, res) => {
    try {
        const { username } = req.body

        const friendRequests = await User.findOne({username}).populate("firends","username SocketId").select("friends")
        
        return res.status(200).json({ success: true, messege: "friend requests fetched successfully", friendRequests })

    } catch (err) {
        return res.status(500).json({ success: false, meesege: "Internal server error", err })
    }
}


export const getmessages = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body

        const mesgs = await Chat.find({
            or: [
                { senderId: senderId }, { receiverId: receiverId },
                { senderId: receiverId }, { receiverId: senderId },
            ]
        })

        return res.status(200).json({ success: true, message: "messages fetched successfully", mesgs })
    } catch (err) {
        return res.status(500).json({ success: false, message: "failes fetching messages" }, err)
    }
}


export const removefriend = async (req, res) => {
    const { userId, friendId } = req.body
    try {
        if (!userId) {
            return res.status(404).json({ success: false, message: "userId must be provided" })
        }
        const removed = await User.updateOne(
            { _id: userId },
            { $pull: { friends: { _id: friendId } } }
        );

        if (removed) {
            return res.status(200).json({ success: true, message: "friend removed successfully" })
        }

        return res.status(404).json({ success: false, message: "Friend not found or already removed" })


    } catch (err) {

        return res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}   

export const searchUsers = async (req, res) => {
    try {
        const { username } = req.body
        const users = await User.find({ username: { $regex: `^${username}`, $options: "i" } })

        return res.json({ success: true, users })

    } catch (error  ) {
        return res.status(500).json({ success: false, message: "Internal ServerError", error })
    }
}


export const deleteChat=async (req,res)=>{
    const {massageId,senderId,receiverId}=req.body
    try {
        const deletedChat=await Chat.findByIdAndDelete(chatId)

        if (!deletedChat) {
            return res.status(404).json({ success: false, message: "Chat not found" })
        }

        return res.status(200).json({ success: true, message: "Chat deleted successfully" })

    } catch (error) {
        return res.status(500).json({sucees:false,message:"Internal Servre Error",error})
    }
}