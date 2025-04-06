import app from "./app.js";
import mongoConnect from "./src/config/mongoconnection.js"; 
import {DATABASE_URL,PORT} from './src/config/envConfig.js'
import { initializechatsocket } from "./src/config/chatsocketConfig.js";


const port=PORT

function startserver(){


mongoConnect(DATABASE_URL)

    const server=app.listen(port,"0.0.0.0",()=>{console.log(`server is running on ${port}`)})

    initializechatsocket(server)
    // initializemeetsocket(server)
}


startserver()


