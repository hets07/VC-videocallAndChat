import express from 'express';
import { deleteChat, getFriendRequests, getFriends, getmessages, removefriend,searchUsers } from '../controllers/chatController.js';
import { verifyAccessToken } from '../utils/jwt.js';

const chatRoutes=express.Router();

chatRoutes.get("/getfriends",verifyAccessToken,getFriends)
chatRoutes.get("/getfriendrequest",verifyAccessToken,getFriendRequests)
chatRoutes.get("/getmessages",verifyAccessToken,getmessages)
chatRoutes.delete("/removefriend",verifyAccessToken,removefriend)
chatRoutes.delete("/deletechat",verifyAccessToken,deleteChat)

export default chatRoutes;