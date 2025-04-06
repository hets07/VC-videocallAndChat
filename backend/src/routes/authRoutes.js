import express from 'express'
import { login, signup, usernameExist ,updateprofile,changeUsername, changeProfilePic} from '../controllers/authController.js'
import upload from '../middleware/multer.js';
import { verifyAccessToken } from '../utils/jwt.js';

const authRoutes=express.Router();


authRoutes.post('/login',upload.none(),login) //working
authRoutes.post('/signup',upload.single('profilepic'),signup) //working
authRoutes.post('/usernameExists',usernameExist)  //working
authRoutes.post('/updateprofile',verifyAccessToken,updateprofile)//working
authRoutes.post('/changeusername',verifyAccessToken,changeUsername)//working
authRoutes.post('/changeprofilepic',verifyAccessToken,changeProfilePic)//working

export default authRoutes;