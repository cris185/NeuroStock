import { useState } from 'react'
import './assets/css/style.css'
import Main from './components/Main'
import Register from './components/Register/Register'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import Login from './components/Login/Login'
import AuthProvider from './components/Hooks/AuthProvider'



function App() {


  return (
    <>
  <AuthProvider>
     <BrowserRouter>
    <Header />
      <Routes>
         <Route path='/' element={<Main />} />
         <Route path='/register' element={<Register />} />
         <Route path='/login' element={<Login />} />         
      </Routes>
    <Footer />
     </BrowserRouter> 
  </AuthProvider>   
 
    
    </>
  )
}

export default App
