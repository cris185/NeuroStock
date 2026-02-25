import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faBrain, faChartBar } from '@fortawesome/free-solid-svg-icons'

const Main = () => {
  const { t } = useTranslation();

  return (
    <div className='sp-hero-section'>
      <div className='sp-hero-content'>
        <h1 className='sp-hero-title'>
          {t('main.title1')} <span className='sp-hero-title-accent'>{t('main.title2')}</span> {t('main.title3')}
        </h1>
        <p className='sp-hero-subtitle'>
          {t('main.subtitle')}
        </p>

        <div className='sp-hero-cta-container'>
          <Link className='sp-btn-hero-primary' to='/dashboard'>
            {t('main.getStarted')}
          </Link>
          <Link className='sp-btn-hero-secondary' to='/register'>
            {t('main.registerFree')}
          </Link>
        </div>
      </div>

      <div className='sp-feature-grid'>
        <div className='sp-feature-card'>
          <div className='sp-feature-icon'>
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <h3 className='sp-feature-title'>{t('main.feature1Title')}</h3>
          <p className='sp-feature-description'>
            {t('main.feature1Description')}
          </p>
        </div>

        <div className='sp-feature-card'>
          <div className='sp-feature-icon'>
            <FontAwesomeIcon icon={faBrain} />
          </div>
          <h3 className='sp-feature-title'>{t('main.feature2Title')}</h3>
          <p className='sp-feature-description'>
            {t('main.feature2Description')}
          </p>
        </div>

        <div className='sp-feature-card'>
          <div className='sp-feature-icon'>
            <FontAwesomeIcon icon={faChartBar} />
          </div>
          <h3 className='sp-feature-title'>{t('main.feature3Title')}</h3>
          <p className='sp-feature-description'>
            {t('main.feature3Description')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Main