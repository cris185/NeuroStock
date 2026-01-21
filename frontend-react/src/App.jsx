import { useState } from 'react'
import './assets/css/globals.css'
import './assets/css/style.css'
import Main from './components/Main'
import Register from './components/Register/Register'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import Login from './components/Login/Login'
import AuthProvider from './components/Hooks/AuthProvider'
import Dashboard from './components/dashboard/Dashboard'
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'

function App() {


  return (
    <>
  <AuthProvider>
     <BrowserRouter>
    <Header />
      <Routes>
         <Route path='/' element={<Main />} />
         <Route path='/register' element={<PublicRoute> <Register /> </PublicRoute>} />
         <Route path='/login' element={<PublicRoute> <Login /> </PublicRoute>} />
         <Route path='/dashboard' element={<PrivateRoute> <Dashboard /> </PrivateRoute>} />         
      </Routes>
    <Footer />
     </BrowserRouter> 
  </AuthProvider>   
 
    
    </>
  )
}

export default App
