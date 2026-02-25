import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className='sp-footer'>
      <div className='container'>
        <div className='sp-footer-top'>
          <div className='sp-footer-brand'>
            <FontAwesomeIcon icon={faChartLine} className='sp-footer-brand-icon' />
            <span className='sp-footer-brand-text'>{t('footer.brand')}</span>
          </div>
          <p className='sp-footer-description'>
            {t('footer.description')}
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
            <p className='sp-footer-copyright'>{t('footer.copyright')}</p>
            <div className='sp-footer-bottom-links'>
              <a href='#' className='sp-footer-bottom-link'>{t('footer.privacy')}</a>
              <a href='#' className='sp-footer-bottom-link'>{t('footer.terms')}</a>
              <a href='#' className='sp-footer-bottom-link'>{t('footer.cookies')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
