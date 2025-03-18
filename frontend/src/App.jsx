import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Chatcontainer from './components/chat/Chatcontainer'
import Login_signup from './pages/Login_signup'
import Chatusers from './components/chat/Chatusers'

const App = () => {
  return (

    <Router>
      <Routes>
        <Route path='/chat' element={<Chatcontainer />} />
        <Route path='/login' element={<Login_signup />} />
        <Route path='/chaters' element={<Chatusers />} />
      </Routes>
    </Router>
  )
}

export default App
