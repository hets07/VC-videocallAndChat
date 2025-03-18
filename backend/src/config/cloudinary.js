import {v2 as cloudinary} from 'cloudinary'
import {CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_SECRET,CLOUDINARY_API_KEY} from './envConfig.js'

cloudinary.config({
    cloud_name:CLOUDINARY_CLOUD_NAME,
    api_key:CLOUDINARY_API_KEY,
    api_secret:CLOUDINARY_API_SECRET,
})


export default cloudinary