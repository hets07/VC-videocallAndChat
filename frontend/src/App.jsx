import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login_signup from './pages/Login_signup'
import Chat from './pages/Chat.jsx'
const App = () => {
  return (

    <Router>
      <Routes>
        <Route path='/chat' element={<Chat />} />
        <Route path='/login' element={<Login_signup />} />
      </Routes>
    </Router>
  )
}

export default App
