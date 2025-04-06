import User from '../models/user.js';
import uploadImage from '../utils/image_upload.js';
import { generateToken } from '../utils/jwt.js';
import bcrypt from 'bcrypt';

export const login = async (req, res) => {
    const { username, password } = req.body
    try {


        const loginuser = await User.findOne({ username })

        if (loginuser) {
            const matchPassword = await bcrypt.compare(password, loginuser.password)
            if (!matchPassword) {
                return res.status(401).json({ success: false, message: "invalid password" })
            }
            const token = generateToken(loginuser._id)
            return res.status(200).json({ success: true, message: 'user loggin successfull', token,user:loginuser })
        } else {
            return res.status(404).json({ success: false, message: 'user no found' })
        }
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error", err })
    }
}

// if field is active then request will not go
export const usernameExist=async(req,res)=>{
    try{
        
        
        const {username}=req.body
        if(!username){
            return res.status(400).json({success:false,message:"Username is required"})
        }
        const usernameExist=await User.exists({username})
        if(usernameExist){
            return res.status(200).json({success:false,message:'username already exists'})
        }
        return res.json({success:true,message:"username doesn't exist"})

    }catch(err){
        return res.status(500).json({ message: "Internal Server Error", err })
    }
}


export const signup = async (req, res) => {
    
    const { password, username,name,surname ,bio} = req.body
    
    const profilepic=req.file

    
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        let profilepic_url=null
        if(profilepic){
            
            const timestamp=new Date().toISOString().replace(/[:.]/,'-')
            const extension=profilepic.originalname.split('.').pop()
            const filename=`ProfilePic/${username}/${timestamp}.${extension}`
            const result=await uploadImage(profilepic.buffer,filename) 
                       
            if(result.secure_url){

                profilepic_url=result.secure_url
            }

        }
        
        const user = new User({  username, password: hashedPassword,name,surname,profile:profilepic_url,bio })
        await user.save()

        if (user) {
            const token = generateToken(user._id)
            return res.status(200).json({ success: true, message: 'user signup successfull', token,user:user })
        }
    } catch (err) {
        await User.deleteOne({username})
        return res.status(500).json({ message: "Internal Server Error", err })
    }
}


export const changeProfilePic = async (req, res) => {
    
    const {username}=req.body
    console.log(username);
    
    const profilepic=req.file

    
    try {
      
        let profilepic_url=null
        if(profilepic){
            
            const timestamp=new Date().toISOString().replace(/[:.]/,'-')
            const extension=profilepic.originalname.split('.').pop()
            const filename=`ProfilePic/${username}/${timestamp}.${extension}`
            const result=await uploadImage(profilepic.buffer,filename)            
            if(result.secure_url){
                profilepic_url=result.secure_url
            }

        }
        
        const user = await User.findOneAndupdate({  username },{profilepic:profilepic_url},{new:true}).select("profilepic")

        if (user) {
            return res.status(200).json({ success: true, message: 'profile picture updated successfully', user })
        }
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error", err })
    }
}


export const updateprofile = async (req, res) => {
    const {name,surname,bio,username } = req.body
    
    try {
        
        const updatedprofile=await User.findOneAndUpdate({username},{name,surname,bio},{new:true})

        if (updatedprofile) {
            return res.status(200).json({ success: true, message: 'userProfile updated successfully', updatedprofile })
        }
    } catch (err) {
        
        return res.status(500).json({ message: "Internal Server Error", err })
    }
}


export const changeUsername = async (req, res) => {
    const {username,newusename } = req.body

    try {
        const changedusername=await User.findOneAndUpdate({username:username},{username:newusename},{new:true})
        
        
        if (changedusername) {
            return res.status(200).json({ success: true, message: "Username has been changed" })
        } else {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        
    } catch (err) {
        
        return res.status(500).json({ message: "Internal Server Error", err })
    }
}


export const verifypassword=async(req,res)=>{
    const {password,userId}=req.body
    try{
        if(!password){
            return res.status(401).json({success:false,message:"password needed"})
        }
        const userPassword=await User.findById(userId).select("password")

        const ismatch=await bcrypt.compare(password,userPassword.password)
         
        if(ismatch){
            return res.status(200).json({success:true,message:"correct password"})
        }
        return res.status(401).json({success:false,message:"incorrect password"})

    }catch(err){
        return res.status(500).json({ message: "Internal Server Error", err })

    }

}
