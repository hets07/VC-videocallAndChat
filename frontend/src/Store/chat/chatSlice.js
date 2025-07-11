import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../helper/axios";

// Delete chat message
export const deleteChat = createAsyncThunk("chat/deleteChat", async (data, thunkAPI) => {
    try {
        const { messageId, senderId, receiverId } = data;
        const response = await axiosInstance.delete('/api/chat/deletechat', { data: { messageId, senderId, receiverId } });
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(`Deleting message failed: ${error.response?.data?.message || error.message}`);
    }
});

// Get friend requests 
export const getFriendRequests = createAsyncThunk("chat/getFriendRequests", async (_, thunkAPI) => {
    try {
        const response = await axiosInstance.get('/api/chat/getfriendrequests');
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(`Fetching friend requests failed: ${error.response?.data?.message || error.message}`);
    }
});

// Get friends list
export const getFriends = createAsyncThunk("chat/getFriends", async (data, thunkAPI) => {
    try {
        
        const response = await axiosInstance.post(`/api/chat/getfriends`,data);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(`Fetching friends failed: ${error.response?.data?.message || error.message}`);
    }
});

// Get messages between users
export const getMessages = createAsyncThunk("chat/getMessages", async (data, thunkAPI) => {
    try {
        const { senderId, receiverId } = data;
        
        const response = await axiosInstance.post(`/api/chat/getmessages`,{ senderId, receiverId });
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(`Fetching messages failed: ${error.response?.data?.message || error.message}`);
    }
});

// Remove friend
export const removeFriend = createAsyncThunk("chat/removeFriend", async (data, thunkAPI) => {
    try {
        const { userId, friendId } = data;
        const response = await axiosInstance.delete('/api/chat/removefriend', { data: { userId, friendId } });
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(`Removing friend failed: ${error.response?.data?.message || error.message}`);
    }
});

const initialState = {
    friends: null,
    friendRequests: null,
    messages: null,
    friendRemoved: false,
    messageDeleted: false,
    loading: false,
    SocketId:null,
    reciverId:null,
    selectedUser:null,
    selectedUserProfile:null,
    Socket:null,
    error: null
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setSocketId:(state,action)=>{
            state.SocketId=action.payload
        },
        setSocket:(state,action)=>{
            state.Socket=action.payload
        },
        setReciverId:(state,action)=>{
            state.reciverId=action.payload
        },
        setUser:(state,action)=>{
            state.selectedUser=action.payload
        },
        setprofile:(state,action)=>{
            state.selectedUserProfile=action.payload
        }
    
    
    },
    extraReducers: (builder) => {
        builder
            .addCase(deleteChat.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteChat.fulfilled, (state) => {
                state.loading = false;
                state.messageDeleted = true;
            })
            .addCase(deleteChat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getFriendRequests.pending, (state) => {
                state.loading = true;
            })
            .addCase(getFriendRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.friendRequests = action.payload;
            })
            .addCase(getFriendRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getFriends.pending, (state) => {
                state.loading = true;
            })
            .addCase(getFriends.fulfilled, (state, action) => {
                state.loading = false;
                state.friends = action.payload;
            })
            .addCase(getFriends.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getMessages.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
            })
            .addCase(getMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(removeFriend.pending, (state) => {
                state.loading = true;
            })
            .addCase(removeFriend.fulfilled, (state) => {
                state.loading = false;
                state.friendRemoved = true;
            })
            .addCase(removeFriend.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});


export const { setSocket,setSocketId,setReciverId,setUser,setprofile } = chatSlice.actions;
export default chatSlice.reducer;
