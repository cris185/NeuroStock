import React, {useContext,useState} from 'react'
import { FontAwesomeIcon as FonftAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSpinner} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import { AuthContext } from '../Hooks/AuthProvider';

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

    const userData ={username, password}
    console.log('UserData:',userData);

    try{
      const response = await axios.post('http://127.0.0.1:8000/api/v1/token/', userData)
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      console.log('Login successful:', response.data);
      navigate('/dashboard');
      setIsLoggedIn(true);
    }catch(error){
      console.error('Login Error:', error.response.data);
      setError('Invalid username or password');
    }finally{
      setLoading(false);
    }
  }

  return (
    <>
    <div className='container'>
    <div className='row justify-content-center'>
      <div className='col-md-6 bg-light-dark p-5 rounded'>
        <h3 className='text-light text-center mb-4'>Login</h3>

        <form onSubmit={handleLogin}>
      <input type="text" className='form-control mb-2' placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} />
       

      <input type="password" className='form-control mb-2' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)}  />

      {error && <div className='text-danger'>{error}</div>}

      {loading ? (<button type="submit" className='btn btn-info d-block mx-auto' disabled><FonftAwesomeIcon icon={faSpinner} spin /> Logging in...</button>)
        :  
      ( <button type="submit" className='btn btn-info d-block mx-auto'>Login</button>)
      }

    </form>
      </div>
    </div>
  </div>
    </>
  )
}

export default Login