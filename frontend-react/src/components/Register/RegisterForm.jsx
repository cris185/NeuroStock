import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getRegisterSchema, getPasswordRequirements } from './registerSchema';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSpinner, faUser, faEnvelope, faLock, faCheck, faXmark} from '@fortawesome/free-solid-svg-icons';

const RegisterForm = () => {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  const registerSchema = getRegisterSchema(t);
  const passwordRequirements = getPasswordRequirements(t);

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
      setPassword('');
    } catch (error) {
      if (error.response?.data?.username) {
        setServerError(`${t('register.userPrefix')} ${error.response.data.username[0]}`);
      } else if (error.response?.data?.email) {
        setServerError(`${t('register.emailPrefix')} ${error.response.data.email[0]}`);
      } else if (error.response?.data?.password) {
        // Manejar errores de validación de contraseña del backend
        const passwordErrors = error.response.data.password;
        if (Array.isArray(passwordErrors)) {
          setServerError(passwordErrors.join(' '));
        } else {
          setServerError(`${t('register.passwordPrefix')} ${passwordErrors}`);
        }
      } else {
        setServerError(t('register.error'));
      }
    }finally{
      setLoading(false);
    }
  };

  // Handler para actualizar el estado del password en tiempo real
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='sp-form-group'>
        <label className='sp-form-label' htmlFor='username'>{t('register.usernameLabel')}</label>
        <div className='sp-form-input-wrapper'>
          <FontAwesomeIcon icon={faUser} className='sp-form-input-icon' />
          <input
            type="text"
            id='username'
            className={`sp-form-input sp-form-input-with-icon ${errors.username ? 'sp-form-input-error' : ''}`}
            placeholder={t('register.usernamePlaceholder')}
            {...register('username')}
          />
        </div>
        {errors.username && <span className='sp-form-error-message'>{errors.username.message}</span>}
      </div>

      <div className='sp-form-group'>
        <label className='sp-form-label' htmlFor='email'>{t('register.emailLabel')}</label>
        <div className='sp-form-input-wrapper'>
          <FontAwesomeIcon icon={faEnvelope} className='sp-form-input-icon' />
          <input
            type="email"
            id='email'
            className={`sp-form-input sp-form-input-with-icon ${errors.email ? 'sp-form-input-error' : ''}`}
            placeholder={t('register.emailPlaceholder')}
            {...register('email')}
          />
        </div>
        {errors.email && <span className='sp-form-error-message'>{errors.email.message}</span>}
      </div>

      <div className='sp-form-group'>
        <label className='sp-form-label' htmlFor='password'>{t('register.passwordLabel')}</label>
        <div className='sp-form-input-wrapper'>
          <FontAwesomeIcon icon={faLock} className='sp-form-input-icon' />
          <input
            type="password"
            id='password'
            className={`sp-form-input sp-form-input-with-icon ${errors.password ? 'sp-form-input-error' : ''}`}
            placeholder={t('register.passwordPlaceholder')}
            {...register('password', {
              onChange: handlePasswordChange
            })}
          />
        </div>
        {errors.password && <span className='sp-form-error-message'>{errors.password.message}</span>}
        
        {/* Indicadores de requisitos de contraseña */}
        <div className='sp-password-requirements'>
          {passwordRequirements.map((req) => {
            const isValid = req.test(password);
            return (
              <div 
                key={req.id} 
                className={`sp-password-requirement ${isValid ? 'sp-requirement-valid' : 'sp-requirement-invalid'}`}
              >
                <FontAwesomeIcon 
                  icon={isValid ? faCheck : faXmark} 
                  className='sp-requirement-icon'
                />
                <span>{req.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className='sp-form-group'>
        <label className='sp-form-label' htmlFor='confirmPassword'>{t('register.confirmPasswordLabel')}</label>
        <div className='sp-form-input-wrapper'>
          <FontAwesomeIcon icon={faLock} className='sp-form-input-icon' />
          <input
            type="password"
            id='confirmPassword'
            className={`sp-form-input sp-form-input-with-icon ${errors.confirmPassword ? 'sp-form-input-error' : ''}`}
            placeholder={t('register.confirmPasswordPlaceholder')}
            {...register('confirmPassword')}
          />
        </div>
        {errors.confirmPassword && <span className='sp-form-error-message'>{errors.confirmPassword.message}</span>}
      </div>

      {serverError && <div className='sp-alert-danger'>{serverError}</div>}
      {success && <div className='sp-alert-success'>{t('register.success')}</div>}

      <button type="submit" className='sp-btn-form-submit' disabled={loading}>
        {loading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin />
            {t('register.registering')}
          </>
        ) : (
          t('register.submit')
        )}
      </button>
    </form>
  );
};

export default RegisterForm;