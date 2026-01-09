import React, {useContext,useState} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faSpinner, faUser, faLock} from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import {useNavigate, Link} from 'react-router-dom'
import { AuthContext } from '../Hooks/AuthProvider'

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {isLoggedIn, setIsLoggedIn} = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const userData = {username, password}

    try{
      const response = await axios.post('http://127.0.0.1:8000/api/v1/token/', userData)
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      console.log('Login successful:', response.data);
      setIsLoggedIn(true);
      navigate('/dashboard');
    }catch(error){
      console.error('Login Error:', error.response?.data);
      setError('Usuario o contraseña inválidos');
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className='sp-form-container'>
      <div className='sp-form-gradient-card'>
        <h2 className='sp-form-heading'>Iniciar Sesión</h2>
        <p className='sp-form-subheading'>Accede a tus predicciones de acciones</p>

        {error && <div className='sp-alert-danger'>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className='sp-form-group'>
            <label className='sp-form-label' htmlFor='username'>Usuario</label>
            <div className='sp-form-input-wrapper'>
              <FontAwesomeIcon icon={faUser} className='sp-form-input-icon' />
              <input
                type="text"
                id='username'
                className='sp-form-input sp-form-input-with-icon'
                placeholder='Ingresa tu usuario'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className='sp-form-group'>
            <label className='sp-form-label' htmlFor='password'>Contraseña</label>
            <div className='sp-form-input-wrapper'>
              <FontAwesomeIcon icon={faLock} className='sp-form-input-icon' />
              <input
                type="password"
                id='password'
                className='sp-form-input sp-form-input-with-icon'
                placeholder='Ingresa tu contraseña'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className='sp-btn-form-submit' disabled={loading}>
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className='sp-form-footer'>
          <span className='sp-text-secondary'>¿No tienes una cuenta?</span>
          <Link to='/register' className='sp-form-link sp-form-footer-link'>
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login