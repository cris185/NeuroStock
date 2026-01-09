import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { registerSchema } from './registerSchema';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSpinner, faUser, faEnvelope, faLock} from '@fortawesome/free-solid-svg-icons';

const RegisterForm = () => {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    setSuccess(false);
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/register/', {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      setSuccess(true);
      console.log('Register successful:', response.data);
      reset();
    } catch (error) {
      if (error.response?.data?.username) {
        setServerError(`Usuario: ${error.response.data.username[0]}`);
      } else if (error.response?.data?.email) {
        setServerError(`Email: ${error.response.data.email[0]}`);
      } else {
        setServerError('Error en el registro. Intenta más tarde.');
      }
    }finally{
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='sp-form-group'>
        <label className='sp-form-label' htmlFor='username'>Usuario</label>
        <div className='sp-form-input-wrapper'>
          <FontAwesomeIcon icon={faUser} className='sp-form-input-icon' />
          <input
            type="text"
            id='username'
            className={`sp-form-input sp-form-input-with-icon ${errors.username ? 'sp-form-input-error' : ''}`}
            placeholder='Ingresa tu usuario'
            {...register('username')}
          />
        </div>
        {errors.username && <span className='sp-form-error-message'>{errors.username.message}</span>}
      </div>

      <div className='sp-form-group'>
        <label className='sp-form-label' htmlFor='email'>Email</label>
        <div className='sp-form-input-wrapper'>
          <FontAwesomeIcon icon={faEnvelope} className='sp-form-input-icon' />
          <input
            type="email"
            id='email'
            className={`sp-form-input sp-form-input-with-icon ${errors.email ? 'sp-form-input-error' : ''}`}
            placeholder='Ingresa tu email'
            {...register('email')}
          />
        </div>
        {errors.email && <span className='sp-form-error-message'>{errors.email.message}</span>}
      </div>

      <div className='sp-form-group'>
        <label className='sp-form-label' htmlFor='password'>Contraseña</label>
        <div className='sp-form-input-wrapper'>
          <FontAwesomeIcon icon={faLock} className='sp-form-input-icon' />
          <input
            type="password"
            id='password'
            className={`sp-form-input sp-form-input-with-icon ${errors.password ? 'sp-form-input-error' : ''}`}
            placeholder='Crea una contraseña'
            {...register('password')}
          />
        </div>
        {errors.password && <span className='sp-form-error-message'>{errors.password.message}</span>}
      </div>

      <div className='sp-form-group'>
        <label className='sp-form-label' htmlFor='confirmPassword'>Confirmar Contraseña</label>
        <div className='sp-form-input-wrapper'>
          <FontAwesomeIcon icon={faLock} className='sp-form-input-icon' />
          <input
            type="password"
            id='confirmPassword'
            className={`sp-form-input sp-form-input-with-icon ${errors.confirmPassword ? 'sp-form-input-error' : ''}`}
            placeholder='Confirma tu contraseña'
            {...register('confirmPassword')}
          />
        </div>
        {errors.confirmPassword && <span className='sp-form-error-message'>{errors.confirmPassword.message}</span>}
      </div>

      {serverError && <div className='sp-alert-danger'>{serverError}</div>}
      {success && <div className='sp-alert-success'>¡Registro exitoso! Ya puedes iniciar sesión.</div>}

      <button type="submit" className='sp-btn-form-submit' disabled={loading}>
        {loading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin />
            Registrando...
          </>
        ) : (
          'Registrarse'
        )}
      </button>
    </form>
  );
};

export default RegisterForm;