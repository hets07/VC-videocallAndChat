import express from "express";
import cors from "cors";
import {MY_IP} from './src/config/envConfig.js'
import authRoutes from "./src/routes/authRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import compression from 'compression'
import ratelimit from "express-rate-limit"
import helmet from "helmet"
import path from 'path'
import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app=express()

const alloworigin=[
    `https://vc-lq4i.onrender.com`,
]
const corsOption={
    origin:alloworigin,
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}

// production
// app.use(express.static(path.join(__dirname,'../frontend/dist')))

const limiter = ratelimit({
    max: 200,
    windowMs: 60 * 60 * 1000,
    message: "Too many request from this IP"
});


app.use(cors(corsOption))
app.use(limiter)
app.use(express.json())
app.use(compression())
app.use(helmet()); 
app.use('/api/auth',authRoutes)
app.use('/api/chat',chatRoutes)

// production
// app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'../frontend/dist','index.html')))

export default app
