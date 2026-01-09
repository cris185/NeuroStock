import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons'

const Footer = () => {
  return (
    <footer className='sp-footer'>
      <div className='container'>
        <div className='sp-footer-top'>
          <div className='sp-footer-brand'>
            <FontAwesomeIcon icon={faChartLine} className='sp-footer-brand-icon' />
            <span className='sp-footer-brand-text'>Stock Prediction</span>
          </div>
          <p className='sp-footer-description'>
            Predicción de acciones con IA. Análisis avanzado con redes neuronales LSTM.
          </p>
          <div className='sp-footer-social'>
            <a href='https://github.com' target='_blank' rel='noopener noreferrer' className='sp-footer-social-icon' aria-label='GitHub'>
              <FontAwesomeIcon icon={faGithub} />
            </a>
            <a href='https://linkedin.com' target='_blank' rel='noopener noreferrer' className='sp-footer-social-icon' aria-label='LinkedIn'>
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            <a href='https://x.com' target='_blank' rel='noopener noreferrer' className='sp-footer-social-icon' aria-label='X (formerly Twitter)'>
              <FontAwesomeIcon icon={faXTwitter} />
            </a>
          </div>
        </div>
      </div>

      <div className='sp-footer-bottom'>
        <div className='container'>
          <div className='sp-footer-bottom-content'>
            <p className='sp-footer-copyright'>&copy; 2025 Stock Prediction Portal. Built by CPD</p>
            <div className='sp-footer-bottom-links'>
              <a href='#' className='sp-footer-bottom-link'>Privacidad</a>
              <a href='#' className='sp-footer-bottom-link'>Términos</a>
              <a href='#' className='sp-footer-bottom-link'>Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
