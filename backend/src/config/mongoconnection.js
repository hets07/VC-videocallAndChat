import mongoose from 'mongoose'

const mongoConnect=(url)=>{
    
    mongoose.connect(url)
    .then(()=>{console.log("mongo cluster connectted successfully")})
    .catch((err)=>{console.error(`error connecting cluster:${err}`)})
}

export default mongoConnect
