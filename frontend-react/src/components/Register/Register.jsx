import React from 'react';
import RegisterForm from './RegisterForm';
import { Link } from 'react-router-dom';

const Register = () => (
  <div className='sp-form-container'>
    <div className='sp-form-gradient-card'>
      <h2 className='sp-form-heading'>Crear Cuenta</h2>
      <p className='sp-form-subheading'>Únete y comienza a predecir precios de acciones</p>

      <RegisterForm />

      <div className='sp-form-footer'>
        <span className='sp-text-secondary'>¿Ya tienes una cuenta?</span>
        <Link to='/login' className='sp-form-link sp-form-footer-link'>
          Inicia sesión aquí
        </Link>
      </div>
    </div>
  </div>
);

export default Register;