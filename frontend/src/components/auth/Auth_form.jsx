import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useDispatch,useSelector } from 'react-redux'
import { signup, loginUser } from '../../Store/auth/authSlice'
import axiosInstance from '../../helper/axios'
import {io} from 'socket.io-client'

const Auth_form = () => {
  const [name, setName] = useState(null)
  const [surname, setSurame] = useState(null)
  const [username, setUsername] = useState(null)
  const [password, setPassword] = useState(null)
  const [bio, setBio] = useState(null)
  const [isLogin, setisLogin] = useState(true)
  const [message,setMessage]=useState(null)  //message of warnings
  const dispatch = useDispatch()
  const {isAuthenticated}=useSelector((state)=>state.auth)



  const handleSubmit = (e) => {
    e.preventDefault()
    if (isLogin) {
      dispatch(loginUser({ username, password }))
    } else {
      dispatch(signup({ name, surname, username, password, bio }))
    }
  }

  const handleBlur = async (e) => {
    const username = e.target?.value; 
    if(!username) return;
    try {
        const response = await axiosInstance.post('/api/auth/usernameExists', { username });

       if(!response.data.success){
        setMessage(response.data.message)
       }
        
    } catch (error) {
        console.error('Error checking username:', error);
    }
}


  if(isAuthenticated){
    return <Navigate to='/chat'/>
  }


  
  return (
    <div className='bg-blue-300 w-fit '>
      <form action="" className='flex flex-col gap-4 w-fit' onSubmit={handleSubmit}>

        <label htmlFor='username' className=''>
          Username:
          <input
            type="text"
            className='border border-blue-400 rounded-md'
            onChange={(e) => setUsername(e.target.value)}
            onBlur={(e)=>handleBlur(e)}
            name="username"
            id="username"
            placeholder='Username'
            autoComplete="username"
          />
        </label>
        <label htmlFor='password' className=''>

          {isLogin ? "" : "create"}Password:
          <input
            type="password"
            className='border border-blue-400 rounded-md'
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            id="password"
            placeholder='password'
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </label>
        {!isLogin && (
          <>
            <label htmlFor='name'>
              Name:
              <input
                type="text"
                className='border border-blue-400 rounded-md'
                onChange={(e) => setName(e.target.value)}
                name="name"
                id="name"
                placeholder='name'
              />
            </label>

            <label htmlFor='surname'>
              Surname:
              <input
                type="text"
                className='border border-blue-400 rounded-md'
                onChange={(e) => setSurame(e.target.value)}
                name="surname"
                id="surname"
                placeholder='surname'
              />
            </label>

            <label htmlFor='bio'>
              Bio:
              <textarea
                className='border border-red-400 w-full resize-none'
                onChange={(e) => setBio(e.target.value)}
                name="bio"
                id="bio"
                placeholder='Bio'
              />
            </label>
          </>
        )}

        <button type='submit'>{`${isLogin ? "Login" : "SignUp"}`}</button>
      </form>
    </div>
  )
}

export default Auth_form





// inputs validation
// css
// responsivenerss
// design animation


// warnings using daisy