import express from 'express';
import { deleteChat, getFriendRequests, getFriends, getmessages, removefriend,searchUser,sentphoto } from '../controllers/chatController.js';
import { verifyAccessToken } from '../utils/jwt.js';
import upload from '../middleware/multer.js'

const chatRoutes=express.Router();

chatRoutes.post("/getfriends",verifyAccessToken,getFriends)
chatRoutes.get("/getfriendrequest",verifyAccessToken,getFriendRequests)
chatRoutes.post("/getmessages",verifyAccessToken,getmessages)
chatRoutes.delete("/removefriend",verifyAccessToken,removefriend)
chatRoutes.delete("/deletechat",verifyAccessToken,deleteChat)
chatRoutes.post("/sentphoto",verifyAccessToken,upload.single("picture"),sentphoto)
chatRoutes.get("/searchuser/:username",searchUser)

export default chatRoutes;