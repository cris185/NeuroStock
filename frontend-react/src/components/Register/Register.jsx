import React from 'react';
import RegisterForm from './RegisterForm';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation();

  return (
    <div className='sp-form-container'>
      <div className='sp-form-gradient-card'>
        <h2 className='sp-form-heading'>{t('register.title')}</h2>
        <p className='sp-form-subheading'>{t('register.subtitle')}</p>

        <RegisterForm />

        <div className='sp-form-footer'>
          <span className='sp-text-secondary'>{t('register.hasAccount')}</span>
          <Link to='/login' className='sp-form-link sp-form-footer-link'>
            {t('register.loginHere')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;