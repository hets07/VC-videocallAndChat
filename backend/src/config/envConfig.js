import dotenv from 'dotenv'

dotenv.config()


export const MY_IP=process.env.MY_IP;
export const PORT=process.env.PORT || 5000;
export const CLOUDINARY_CLOUD_NAME=process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY=process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET=process.env.CLOUDINARY_API_SECRET;
export const JWT_SECRET=process.env.JWT_SECRET;
export const JET_REFRESH=process.env.JET_REFRESH;
export const DATABASE_URL=process.env.DATABASE_URL;
export const TOKEN_EXPIRATION_TIME=process.env.TOKEN_EXPIRATION_TIME;
