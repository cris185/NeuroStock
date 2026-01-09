import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faBrain, faChartBar } from '@fortawesome/free-solid-svg-icons'

const Main = () => {
  return (
    <div className='sp-hero-section'>
      <div className='sp-hero-content'>
        <h1 className='sp-hero-title'>
          Stock <span className='sp-hero-title-accent'>Prediction</span> Portal
        </h1>
        <p className='sp-hero-subtitle'>
          Predice precios de acciones con precisión usando redes neuronales LSTM avanzadas.
          Análisis de 10 años de datos históricos con inteligencia artificial.
        </p>

        <div className='sp-hero-cta-container'>
          <Link className='sp-btn-hero-primary' to='/dashboard'>
            Comenzar Ahora
          </Link>
          <Link className='sp-btn-hero-secondary' to='/register'>
            Registrarse Gratis
          </Link>
        </div>
      </div>

      <div className='sp-feature-grid'>
        <div className='sp-feature-card'>
          <div className='sp-feature-icon'>
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <h3 className='sp-feature-title'>Análisis en Tiempo Real</h3>
          <p className='sp-feature-description'>
            Visualiza precios actuales, promedios móviles de 100 y 200 días con gráficos profesionales.
          </p>
        </div>

        <div className='sp-feature-card'>
          <div className='sp-feature-icon'>
            <FontAwesomeIcon icon={faBrain} />
          </div>
          <h3 className='sp-feature-title'>Machine Learning Avanzado</h3>
          <p className='sp-feature-description'>
            Modelo LSTM entrenado con TensorFlow para predicciones precisas basadas en patrones históricos.
          </p>
        </div>

        <div className='sp-feature-card'>
          <div className='sp-feature-icon'>
            <FontAwesomeIcon icon={faChartBar} />
          </div>
          <h3 className='sp-feature-title'>Métricas de Precisión</h3>
          <p className='sp-feature-description'>
            Evalúa la confiabilidad con MSE, RMSE y R² para tomar decisiones informadas.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Main