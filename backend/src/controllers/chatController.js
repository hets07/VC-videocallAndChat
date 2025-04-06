import Chat from "../models/chat.js";
import User from "../models/user.js";
import uploadImage from "../utils/image_upload.js";

export const getFriends = async (req, res) => {
    try {
      const { username } = req.body;
  
      // Validate input
      if (!username) {
        return res.status(400).json({
          success: false,
          message: "Username is required",
        });
      }
  
      // Fetch user with friends field
      const user =  await User.findOne({username}).select("friends").populate("friends").exec()
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Friend list fetched successfully",
        friends: user,
      });
    } catch (err) {
      console.error("Error fetching friends:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message,
      });
    }
  };
export const getFriendRequests = async (req, res) => {
    try {
        const { username } = req.body

        const friendRequests = await User.findOne({username}).populate("firends","username SocketId").select("friends")
        
        return res.status(200).json({ success: true, messege: "friend requests fetched successfully", friendRequests })

    } catch (err) {
        return res.status(500).json({ success: false, meesege: "Internal server error", err })
    }
}


export const sentphoto = async (req, res) => {
    try {
        const picture = req.file
        
        const {senderId,receiverId}=req.body
        
        const timestamp=new Date().toISOString().replace(/[:.]/,'-')
        
        const extension=picture.originalname.split('.').pop()
        const filename=`picture//${timestamp}.${extension}`
        
        const result=await uploadImage(picture.buffer,filename)
        
        let picture_url=""
        if(result.secure_url){

            picture_url=result.secure_url
            
        }

        const chat = new Chat({  receiverId, senderId,media:picture_url })
        const media=await chat.save()
        
        return res.status(200).json({ success: true, messege: "picture url successful", media })

    } catch (err) {
        return res.status(500).json({ success: false, meesege: "Internal server error", err })
    }
}   


export const getmessages = async (req, res) => {
    try {
        
        const { senderId, receiverId } = req.body;

        if (!senderId || !receiverId) {
            return res.status(400).json({ success: false, message: "senderId and receiverId are required" });
        }

        const messages = await Chat.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).sort({ createdAt: 1 }); 

        return res.status(200).json({ success: true, message: "Messages fetched successfully", messages });
    } catch (err) {
        console.error("Error fetching messages:", err);
        return res.status(500).json({ success: false, message: "Failed fetching messages", error: err.message });
    }
};


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

export const searchUser= async (req, res) => {
    try {
        const { username } = req.params
        if (!username) {
            return res.status(400).json({ success: false, message: "Username is required" });
        }
        const user = await User.find({ username: { $regex: `^${username}`, $options: "i" } }).select("profile name surname")

        return res.json({ success: true, user })

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