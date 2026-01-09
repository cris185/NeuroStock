import {useContext} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../Hooks/AuthProvider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine } from '@fortawesome/free-solid-svg-icons'

const Header = () => {
  const {isLoggedIn, setIsLoggedIn} = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    console.log('Logged out successfully');
    navigate('/login');
  }

  return (
    <nav className='sp-nav-sticky container'>
      <Link className='sp-logo-container' to="/">
        <FontAwesomeIcon icon={faChartLine} className='sp-logo-icon' />
        <span className='sp-logo-text'>Stock Prediction Portal</span>
      </Link>

      <div className='sp-nav-actions'>
        {isLoggedIn ? (
          <>
            <Link className='sp-btn-header-primary' to='/dashboard'>
              Dashboard
            </Link>
            <button className='sp-btn-header-danger' onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className='sp-btn-header-secondary' to="/login">
              Login
            </Link>
            <Link className='sp-btn-header-primary' to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Header