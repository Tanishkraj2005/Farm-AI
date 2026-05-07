import React from 'react'
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Chatbot from './components/Chatbot/Chatbot';
import { BrowserRouter, Routes, Route } from "react-router-dom";

export const App = () => {
  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path='/home' element={<Home/>} />
        <Route path='/chatbot' element={<Chatbot/>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App;