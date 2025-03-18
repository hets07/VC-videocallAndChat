import jwt from 'jsonwebtoken'
import { JWT_SECRET,TOKEN_EXPIRATION_TIME } from '../config/envConfig.js'

export const generateToken=(userId)=>{  
    return jwt.sign({id:userId},JWT_SECRET,{ expiresIn:TOKEN_EXPIRATION_TIME})
}

export const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JET_REFRESH, { expiresIn: '7d' });
};


export const verifyAccessToken = (req, res, next) => {
    try {
      
      
      const {token} = req.body
      
      if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
      }
  
      const valid = jwt.verify(token, process.env.JWT_SECRET);
      
      
      if(valid){
        return next();
      }
      return res.status(401).json({ success: false, message: 'Unauthorized: Token is not valid' });
    } catch (error) {
      console.log(error)
      res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
  };
  
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};
  
  
