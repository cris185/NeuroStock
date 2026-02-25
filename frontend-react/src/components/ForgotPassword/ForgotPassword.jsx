import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faEnvelope, faArrowLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post('http://127.0.0.1:8000/api/v1/password-reset/request/', { email });
      setSuccess(true);
    } catch (error) {
      console.error('Password Reset Error:', error.response?.data);
      setError(t('forgotPassword.error'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className='sp-form-container'>
        <div className='sp-form-gradient-card'>
          <div className='sp-success-icon'>
            <FontAwesomeIcon icon={faCheckCircle} size="3x" style={{ color: '#27ae60' }} />
          </div>
          <h2 className='sp-form-heading'>{t('forgotPassword.successTitle')}</h2>
          <p className='sp-form-subheading' style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {t('forgotPassword.successMessage')}
          </p>
          <Link to='/login' className='sp-btn-form-submit' style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
            {t('forgotPassword.backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='sp-form-container'>
      <div className='sp-form-gradient-card'>
        <h2 className='sp-form-heading'>{t('forgotPassword.title')}</h2>
        <p className='sp-form-subheading'>{t('forgotPassword.subtitle')}</p>

        {error && <div className='sp-alert-danger'>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className='sp-form-group'>
            <label className='sp-form-label' htmlFor='email'>{t('forgotPassword.emailLabel')}</label>
            <div className='sp-form-input-wrapper'>
              <FontAwesomeIcon icon={faEnvelope} className='sp-form-input-icon' />
              <input
                type="email"
                id='email'
                className='sp-form-input sp-form-input-with-icon'
                placeholder={t('forgotPassword.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className='sp-btn-form-submit' disabled={loading}>
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                {t('forgotPassword.sending')}
              </>
            ) : (
              t('forgotPassword.submit')
            )}
          </button>
        </form>

        <div className='sp-form-footer'>
          <Link to='/login' className='sp-form-link sp-form-footer-link'>
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
            {t('forgotPassword.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
