import React from 'react';
import RegisterForm from './RegisterForm';

// Renderización del componente de registro
// Este componente es el que se muestra en la página de registro
const Register = () => (
  <div className='container'>
    <div className='row justify-content-center'>
      <div className='col-md-6 bg-light-dark p-5 rounded'>
        <h3 className='text-light text-center mb-4'>Crear cuenta</h3>
        <RegisterForm />
      </div>
    </div>
  </div>
);

export default Register;