import React, { useState } from 'react';
import { set, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { registerSchema } from './registerSchema';
import { FontAwesomeIcon as FonftAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSpinner} from '@fortawesome/free-solid-svg-icons';


// Componente que maneja la logica de registro de usuarios y el manejo de errores
const RegisterForm = () => {
  const [serverError, setServerError] = useState('');
  const[success, setSuccess] = useState(false);
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
        setServerError(`Username: ${error.response.data.username[0]}`);
      } else if (error.response?.data?.email) {
        setServerError(`Email: ${error.response.data.email[0]}`);
      } else {
        setServerError('Registration error, probably the conexion failed. Try later.');
      }
    }finally{
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" className='form-control mb-2' placeholder='Username' {...register('username')} />
      {errors.username && <p className='text-danger'>{errors.username.message}</p>}

      <input type="email" className='form-control mb-2' placeholder='Email' {...register('email')} />
      {errors.email && <p className='text-danger'>{errors.email.message}</p>}

      <input type="password" className='form-control mb-2' placeholder='Password' {...register('password')} />
      {errors.password && <p className='text-danger'>{errors.password.message}</p>}

      <input type="password" className='form-control mb-2' placeholder='Confirm password' {...register('confirmPassword')} />
      {errors.confirmPassword && <p className='text-danger'>{errors.confirmPassword.message}</p>}

      {serverError && <p className='text-danger text-center my-3'>{serverError}</p>}

      {success && <p className='alert alert-success text-center my-3'>Registration successful!</p>}

      {loading ? (<button type="submit" className='btn btn-info d-block mx-auto' disabled><FonftAwesomeIcon icon={faSpinner} spin /> Please wait...</button>)
        :  
      ( <button type="submit" className='btn btn-info d-block mx-auto'>Register</button>)
      }

    </form>
  );
};

export default RegisterForm;