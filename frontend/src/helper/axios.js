import axios from "axios";
import cookies from 'js-cookie'

const axiosInstance=axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    headers:{
        'Content-Type':'application/json'
    },
    withCredentials:true
})

axiosInstance.interceptors.request.use(
    (config)=>{
        const token=cookies.get('token')
        if(token){
            config.headers["Authorization"]=`Bearer ${token}`
        }
        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
)

export default axiosInstance;