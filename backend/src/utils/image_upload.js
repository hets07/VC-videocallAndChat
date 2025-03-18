import cloudinary from "../config/cloudinary.js";

const uploadImage=(filebuffer,filename)=>{
    return new Promise((resolve,reject)=>{
        const Stream=cloudinary.uploader.upload_stream({
            public_id:filename,
            overwrite:true,
        },(error,result)=>{
            if(error){
                return reject(new Error("Image upload Failed:"+ error.message))
            }
            resolve(result)
        });
        Stream.end(filebuffer)
    })
}
    
export default uploadImage