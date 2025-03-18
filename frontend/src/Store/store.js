import {configureStore} from "@reduxjs/toolkit"
import authslice from './auth/authSlice.js'

const store=configureStore({
    reducer:{
        auth:authslice
    }

})

export default store