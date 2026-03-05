import { lazy, Suspense } from 'react'
import './assets/css/globals.css'
import './assets/css/style.css'
import Main from './components/Main'
import Register from './components/Register/Register'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import Login from './components/Login/Login'
import ForgotPassword from './components/ForgotPassword/ForgotPassword'
import ResetPassword from './components/ResetPassword/ResetPassword'
import AuthProvider from './components/Hooks/AuthProvider'
import Profile from './components/Profile/Profile'
import Settings from './components/Settings/Settings'
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'

// Code-split heavy routes to keep initial bundle small
const DashboardOverview = lazy(() => import('./components/dashboard/DashboardOverview'))
const Predictions = lazy(() => import('./components/predictions/Predictions'))
const Playground = lazy(() => import('./components/playground/Playground'))

const PageLoader = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6C7589',
    fontSize: '0.875rem',
  }}>
    Cargando...
  </div>
)

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/register' element={<PublicRoute><Register /></PublicRoute>} />
          <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
          <Route path='/forgot-password' element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path='/reset-password/:token' element={<PublicRoute><ResetPassword /></PublicRoute>} />

          <Route path='/dashboard' element={
            <PrivateRoute>
              <Suspense fallback={<PageLoader />}>
                <DashboardOverview />
              </Suspense>
            </PrivateRoute>
          } />
          <Route path='/predictions' element={
            <PrivateRoute>
              <Suspense fallback={<PageLoader />}>
                <Predictions />
              </Suspense>
            </PrivateRoute>
          } />
          <Route path='/playground' element={
            <PrivateRoute>
              <Suspense fallback={<PageLoader />}>
                <Playground />
              </Suspense>
            </PrivateRoute>
          } />
          <Route path='/profile' element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path='/settings' element={<PrivateRoute><Settings /></PrivateRoute>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
