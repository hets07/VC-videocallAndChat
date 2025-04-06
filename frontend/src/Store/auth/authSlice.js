import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../helper/axios.js';
import cookies from 'js-cookie'


export const uploadProfilepic = createAsyncThunk("uploadProfilepic", async (profilepic,thunkAPI) => {
   try {    
        const formdata=new FormData()
        formdata.append("profilepic",profilepic)
        const response=await axiosInstance.post('/api/auth/updateprofile',formdata,{headers:{"Content-Type":"multipart/form-data"}})
        return response.data
    } catch (error) {
    return thunkAPI.rejectWithValue(`Signup failed: ${error.response?.data?.message || error.message}`);
   }
})



export const signup = createAsyncThunk("signup", async (userData,thunkAPI) => {
    try {
        
        
        const response = await axiosInstance.post('/api/auth/signup', userData,{headers: { 'Content-Type': 'multipart/form-data' }})
        cookies.set("token",response.data.token)
        return response.data
    } catch (error) {
        console.log(`unexpected error occurd at Signup ${error}`);
        return thunkAPI.rejectWithValue(`Signup failed: ${error.response?.data?.message || error.message}`);
    }
})


export const loginUser = createAsyncThunk("loginUser", async (userData,thunkAPI) => {
    try{
        
        const response=await axiosInstance.post('/api/auth/login',userData,{headers: { 'Content-Type': 'multipart/form-data' }});
        cookies.set("token",response.data.token)
        return response.data
    }catch(error){
        console.log(`unexpected error occurd at Login ${error}`);
        return thunkAPI.rejectWithValue(`Login failed: ${error.response?.data?.message || error.message}`);
        
    }
})

const initialState = {
    data:[],
    isAuthenticated: false,
    loading: false,
    error:null,

}

const authslice = createSlice({
    name: "auth",
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(loginUser.pending,(state)=>{
            state.isAuthenticated=false;
            state.loading=true;
        })
        builder.addCase(loginUser.fulfilled,(state,action)=>{
            state.isAuthenticated=true;
            state.data=action.payload
            state.loading=false;
        })
        builder.addCase(loginUser.rejected,(state,action)=>{
            state.isAuthenticated=false;
            state.loading=false;
            state.error=action.error.message;
        })
        builder.addCase(signup.pending,(state)=>{
            state.isAuthenticated=false;
            state.loading=true;
        })
        builder.addCase(signup.fulfilled,(state,action)=>{
            state.isAuthenticated=true;
            state.data=action.payload
            state.loading=false;
        })
        builder.addCase(signup.rejected,(state,action)=>{
            state.isAuthenticated=false;
            state.loading=false;
            state.error=action.error.message;
        })
    }
})


export default authslice.reducer;