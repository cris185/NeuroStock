import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faLock, faCheckCircle, faTimesCircle, faArrowLeft, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const ResetPassword = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  });

  // Validate token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/v1/password-reset/verify/', { token });
        setTokenValid(response.data.valid);
      } catch (error) {
        console.error('Token validation error:', error);
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setValidatingToken(false);
      setTokenValid(false);
    }
  }, [token]);

  // Validate password on change
  useEffect(() => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  const isPasswordValid = Object.values(passwordValidation).every(v => v);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError(t('resetPassword.passwordRequirements'));
      return;
    }
    
    if (!passwordsMatch) {
      setError(t('resetPassword.passwordsNotMatch'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/password-reset/confirm/', {
        token,
        password,
        password_confirm: confirmPassword
      });
      
      if (response.data.success) {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Password Reset Error:', error.response?.data);
      setError(error.response?.data?.message || t('resetPassword.error'));
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (validatingToken) {
    return (
      <div className='sp-form-container'>
        <div className='sp-form-gradient-card'>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <FontAwesomeIcon icon={faSpinner} spin size="3x" style={{ color: '#4A7AB7', marginBottom: '1rem' }} />
            <p className='sp-form-subheading'>{t('resetPassword.validatingToken')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token
  if (!tokenValid) {
    return (
      <div className='sp-form-container'>
        <div className='sp-form-gradient-card'>
          <div className='sp-error-icon'>
            <FontAwesomeIcon icon={faTimesCircle} size="3x" style={{ color: '#e74c3c' }} />
          </div>
          <h2 className='sp-form-heading'>{t('resetPassword.invalidTokenTitle')}</h2>
          <p className='sp-form-subheading' style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {t('resetPassword.invalidTokenMessage')}
          </p>
          <Link to='/forgot-password' className='sp-btn-form-submit' style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
            {t('resetPassword.requestNewLink')}
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className='sp-form-container'>
        <div className='sp-form-gradient-card'>
          <div className='sp-success-icon'>
            <FontAwesomeIcon icon={faCheckCircle} size="3x" style={{ color: '#27ae60' }} />
          </div>
          <h2 className='sp-form-heading'>{t('resetPassword.successTitle')}</h2>
          <p className='sp-form-subheading' style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {t('resetPassword.successMessage')}
          </p>
          <Link to='/login' className='sp-btn-form-submit' style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
            {t('resetPassword.goToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  // Password validation indicator component
  const ValidationItem = ({ isValid, label }) => (
    <div className={`sp-password-requirement ${isValid ? 'valid' : 'invalid'}`}>
      <FontAwesomeIcon 
        icon={isValid ? faCheckCircle : faTimesCircle} 
        style={{ marginRight: '8px', color: isValid ? '#27ae60' : '#e74c3c' }} 
      />
      <span>{label}</span>
    </div>
  );

  return (
    <div className='sp-form-container'>
      <div className='sp-form-gradient-card'>
        <h2 className='sp-form-heading'>{t('resetPassword.title')}</h2>
        <p className='sp-form-subheading'>{t('resetPassword.subtitle')}</p>

        {error && <div className='sp-alert-danger'>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className='sp-form-group'>
            <label className='sp-form-label' htmlFor='password'>{t('resetPassword.newPasswordLabel')}</label>
            <div className='sp-form-input-wrapper'>
              <FontAwesomeIcon icon={faLock} className='sp-form-input-icon' />
              <input
                type={showPassword ? 'text' : 'password'}
                id='password'
                className='sp-form-input sp-form-input-with-icon'
                placeholder={t('resetPassword.newPasswordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className='sp-password-toggle'
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          {password.length > 0 && (
            <div className='sp-password-requirements'>
              <ValidationItem isValid={passwordValidation.minLength} label={t('validation.reqMinChars')} />
              <ValidationItem isValid={passwordValidation.hasUppercase} label={t('validation.reqUppercase')} />
              <ValidationItem isValid={passwordValidation.hasLowercase} label={t('validation.reqLowercase')} />
              <ValidationItem isValid={passwordValidation.hasNumber} label={t('validation.reqNumber')} />
              <ValidationItem isValid={passwordValidation.hasSpecial} label={t('validation.reqSpecial')} />
            </div>
          )}

          <div className='sp-form-group'>
            <label className='sp-form-label' htmlFor='confirmPassword'>{t('resetPassword.confirmPasswordLabel')}</label>
            <div className='sp-form-input-wrapper'>
              <FontAwesomeIcon icon={faLock} className='sp-form-input-icon' />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id='confirmPassword'
                className='sp-form-input sp-form-input-with-icon'
                placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className='sp-password-toggle'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <div className={`sp-password-match ${passwordsMatch ? 'valid' : 'invalid'}`}>
                <FontAwesomeIcon 
                  icon={passwordsMatch ? faCheckCircle : faTimesCircle}
                  style={{ marginRight: '8px', color: passwordsMatch ? '#27ae60' : '#e74c3c' }}
                />
                <span>{passwordsMatch ? t('resetPassword.passwordsMatch') : t('resetPassword.passwordsNotMatch')}</span>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className='sp-btn-form-submit' 
            disabled={loading || !isPasswordValid || !passwordsMatch}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                {t('resetPassword.resetting')}
              </>
            ) : (
              t('resetPassword.submit')
            )}
          </button>
        </form>

        <div className='sp-form-footer'>
          <Link to='/login' className='sp-form-link sp-form-footer-link'>
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
            {t('resetPassword.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
