import {configureStore} from "@reduxjs/toolkit"
import authslice from './auth/authSlice.js'
import chatslice from './chat/chatSlice.js'

const store=configureStore({
    reducer:{
        auth:authslice,
        chat:chatslice,
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these specific action types
        ignoredActions: ['chat/setSocket'],
        // Ignore these paths in the state
        ignoredPaths: ['chat.Socket'],
      },
    }),

})

export default store