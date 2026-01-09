import {useEffect, useState } from 'react'
import axiosInstance from '../axiosInstance';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSpinner, faChartLine, faCalculator, faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import StockChart from '../Charts/StockChart';




const Dashboard = () => {
  const [ticker, setTicker] = useState('');
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [predictionData, setPredictionData] = useState(null);
  const [futureDays, setFutureDays] = useState(30);
  const [futureDaysInput, setFutureDaysInput] = useState('30');
  const [futurePredictions, setFuturePredictions] = useState(null);
  const [loadingFuture, setLoadingFuture] = useState(false);
 
  useEffect(() => {
  const fetchProtectedData = async () => {
    try{
      const response = await axiosInstance.get('/protected-view/');
      //console.log('Success:', response.data);
    }catch(error){
      console.error('Error fetching  data:', error);
    }
  }
  fetchProtectedData();
 }, [])


const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFuturePredictions(null); // Reset future predictions when searching new ticker
  try{
    const response = await axiosInstance.post('/predict/', {
      ticker: ticker,
      future_days: 0 // Initial request is backtesting only
    });
    console.log('Prediction data received:', response.data);

    // Store entire response data for charts
    setPredictionData(response.data);

    if(response.data.error) {
      setError(response.data.error);
    }
  }catch(error){
    console.error('There was an error making the API request:', error);
    setError(error.response?.data?.error || 'Error al obtener predicciones. Intenta con otro ticker.');
    setPredictionData(null);
  }finally{
    setLoading(false);
  }
}

const isValidDays = () => {
  const days = parseInt(futureDaysInput);
  return !isNaN(days) && days >= 1 && days <= 365;
};

const handleFuturePrediction = async () => {
  if (!isValidDays()) return;

  setLoadingFuture(true);
  setError(null);
  const days = parseInt(futureDaysInput);

  try {
    const response = await axiosInstance.post('/predict/', {
      ticker: ticker,
      future_days: days
    });

    setFuturePredictions(response.data.future_predictions);
    setFutureDays(days);
    console.log('Future predictions received:', response.data.future_predictions);
  } catch (error) {
    console.error('Error generating future predictions:', error);
    setError(error.response?.data?.error || 'Error al generar predicciones futuras');
  } finally {
    setLoadingFuture(false);
  }
};


  return (
    <div className='sp-dashboard container'>
      <div className='sp-dashboard-header'>
        <h1 className='sp-dashboard-title'>Panel de Predicciones</h1>
        <p className='sp-dashboard-subtitle'>Analiza y predice el comportamiento de acciones con IA</p>
      </div>

      <div className='sp-search-section'>
        <div className='sp-search-icon-header'>
          <div className='sp-search-icon-circle'>
            <FontAwesomeIcon icon={faChartLine} />
          </div>
        </div>

        <h2 className='sp-search-heading'>Analiza tu Acción Favorita</h2>
        <p className='sp-search-subheading'>Ingresa el símbolo del ticker para obtener predicciones impulsadas por IA</p>

        {error && <div className='sp-alert sp-alert-error'>{error}</div>}

        <form onSubmit={handleSubmit} className='sp-search-form'>
          <div className='sp-ticker-input-container'>
            <div className='sp-ticker-input-icon'>
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <input
              type="text"
              className='sp-ticker-input'
              placeholder='Ej: AAPL, TSLA, GOOGL, AMZN'
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              required
            />
            {ticker && (
              <div className='sp-ticker-clear' onClick={() => setTicker('')}>
                ×
              </div>
            )}
          </div>

          <button type='submit' className='sp-btn sp-btn-primary sp-btn-submit' disabled={loading}>
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Analizando datos...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faChartLine} />
                <span>Analizar Acción</span>
              </>
            )}
          </button>
        </form>

        <div className='sp-popular-tickers'>
          <span className='sp-popular-label'>Populares:</span>
          <button
            type='button'
            className='sp-ticker-chip'
            onClick={() => setTicker('AAPL')}
          >
            AAPL
          </button>
          <button
            type='button'
            className='sp-ticker-chip'
            onClick={() => setTicker('TSLA')}
          >
            TSLA
          </button>
          <button
            type='button'
            className='sp-ticker-chip'
            onClick={() => setTicker('GOOGL')}
          >
            GOOGL
          </button>
          <button
            type='button'
            className='sp-ticker-chip'
            onClick={() => setTicker('MSFT')}
          >
            MSFT
          </button>
        </div>
      </div>

      {predictionData && (
        <>
          <div className='sp-results-section'>
            {/* Chart 1: Historical Closing Price */}
            <StockChart
              title={`Precio de Cierre Histórico - ${predictionData.ticker}`}
              labels={predictionData.historical_data.dates}
              datasets={[
                {
                  label: 'Precio de Cierre',
                  data: predictionData.historical_data.close_prices,
                  borderColor: '#2E5A8F',
                  backgroundColor: 'rgba(46, 90, 143, 0.1)',
                  fill: true
                }
              ]}
            />

            {/* Chart 2: Price with MA100 */}
            <StockChart
              title={`Precio de Cierre con MA100 - ${predictionData.ticker}`}
              labels={predictionData.historical_data.dates}
              datasets={[
                {
                  label: 'Precio de Cierre',
                  data: predictionData.historical_data.close_prices,
                  borderColor: '#2E5A8F',
                  backgroundColor: 'transparent'
                },
                {
                  label: 'MA100',
                  data: predictionData.ma_data.ma100,
                  borderColor: '#27AE60',
                  backgroundColor: 'transparent'
                }
              ]}
            />

            {/* Chart 3: Price with MA100 and MA200 */}
            <StockChart
              title={`Precio de Cierre con MA100 y MA200 - ${predictionData.ticker}`}
              labels={predictionData.historical_data.dates}
              datasets={[
                {
                  label: 'Precio de Cierre',
                  data: predictionData.historical_data.close_prices,
                  borderColor: '#2E5A8F',
                  backgroundColor: 'transparent'
                },
                {
                  label: 'MA100',
                  data: predictionData.ma_data.ma100,
                  borderColor: '#27AE60',
                  backgroundColor: 'transparent'
                },
                {
                  label: 'MA200',
                  data: predictionData.ma_data.ma200,
                  borderColor: '#F39C12',
                  backgroundColor: 'transparent'
                }
              ]}
            />

            {/* Chart 4: Prediction vs Real Price + Future Predictions */}
            <StockChart
              title={`Predicción Backtesting${futurePredictions ? ' y Futura' : ''} - ${predictionData.ticker}`}
              labels={[
                ...predictionData.backtesting.test_dates,
                ...(futurePredictions?.dates || [])
              ]}
              datasets={[
                // Dataset 1: Precios reales (solo backtesting)
                {
                  label: 'Precio Real',
                  data: [
                    ...predictionData.backtesting.test_prices,
                    ...Array(futurePredictions?.dates.length || 0).fill(null)
                  ],
                  borderColor: '#2E5A8F',
                  borderWidth: 2,
                  pointRadius: 0
                },
                // Dataset 2: Predicción backtesting
                {
                  label: 'Predicción LSTM (Backtesting)',
                  data: [
                    ...predictionData.backtesting.predicted_prices,
                    ...Array(futurePredictions?.dates.length || 0).fill(null)
                  ],
                  borderColor: '#E74C3C',
                  borderDash: [5, 5],
                  borderWidth: 2,
                  pointRadius: 0
                },
                // Dataset 3: Predicción futura (si existe)
                ...(futurePredictions ? [{
                  label: 'Predicción Futura',
                  data: [
                    ...Array(predictionData.backtesting.test_dates.length).fill(null),
                    ...futurePredictions.predicted_prices
                  ],
                  borderColor: '#9B59B6',
                  borderDash: [8, 4],
                  borderWidth: 2,
                  pointRadius: 3
                }] : []),
                // Dataset 4 y 5: Bandas de confianza (si existen)
                ...(futurePredictions ? [
                  {
                    label: 'Límite Superior (95% CI)',
                    data: [
                      ...Array(predictionData.backtesting.test_dates.length).fill(null),
                      ...futurePredictions.upper_bound
                    ],
                    borderColor: 'rgba(155, 89, 182, 0.3)',
                    backgroundColor: 'rgba(155, 89, 182, 0.15)',
                    fill: '+1',
                    borderWidth: 1,
                    borderDash: [2, 2],
                    pointRadius: 0
                  },
                  {
                    label: 'Límite Inferior (95% CI)',
                    data: [
                      ...Array(predictionData.backtesting.test_dates.length).fill(null),
                      ...futurePredictions.lower_bound
                    ],
                    borderColor: 'rgba(155, 89, 182, 0.3)',
                    backgroundColor: 'rgba(155, 89, 182, 0.15)',
                    fill: false,
                    borderWidth: 1,
                    borderDash: [2, 2],
                    pointRadius: 0
                  }
                ] : [])
              ]}
            />
          </div>

          {/* Future Prediction Section */}
          <div className='sp-future-prediction-section'>
            <h2 className='sp-future-heading'>Predicciones Futuras</h2>
            <p className='sp-future-description'>
              Genera predicciones a futuro con intervalos de confianza del 95%
            </p>

            <div className='sp-future-controls'>
              <div className='sp-form-group sp-future-input-group'>
                <label className='sp-form-label'>Días a Predecir (1-365)</label>
                <div className='sp-future-input-wrapper'>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    className='sp-form-input sp-future-input'
                    value={futureDaysInput}
                    onChange={(e) => setFutureDaysInput(e.target.value)}
                    placeholder="Ej: 30, 60, 90"
                  />
                  <span className='sp-future-input-suffix'>días</span>
                </div>
              </div>

              <button
                className='sp-btn sp-btn-secondary sp-btn-future'
                onClick={handleFuturePrediction}
                disabled={loadingFuture || !isValidDays()}
              >
                {loadingFuture ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Generando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faChartLine} />
                    Generar Predicción
                  </>
                )}
              </button>
            </div>

            {futurePredictions && futurePredictions.warning && (
              <div className='sp-alert sp-alert-warning' style={{marginTop: '1rem'}}>
                {futurePredictions.warning}
              </div>
            )}
          </div>

          <div className='sp-metrics-section'>
            <h2 className='sp-metrics-heading'>Métricas de Precisión del Modelo (Backtesting)</h2>
            <div className='sp-metrics-table-wrapper'>
              <table className='sp-metrics-table'>
                <thead>
                  <tr>
                    <th>Métrica</th>
                    <th>Valor</th>
                    <th>Descripción</th>
                    <th>Interpretación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className='sp-metric-row-warning'>
                    <td className='sp-metric-name'>
                      <FontAwesomeIcon icon={faCalculator} className='sp-metric-icon-inline' />
                      MSE
                    </td>
                    <td className='sp-metric-value'>{predictionData.backtesting.metrics.mse.toFixed(2)}</td>
                    <td className='sp-metric-desc'>Mean Squared Error</td>
                    <td className='sp-metric-interpretation'>
                      {predictionData.backtesting.metrics.mse < 5 ? 'Excelente' :
                       predictionData.backtesting.metrics.mse < 15 ? 'Bueno' : 'Regular'}
                    </td>
                  </tr>
                  <tr className='sp-metric-row-info'>
                    <td className='sp-metric-name'>
                      <FontAwesomeIcon icon={faCalculator} className='sp-metric-icon-inline' />
                      RMSE
                    </td>
                    <td className='sp-metric-value'>{predictionData.backtesting.metrics.rmse.toFixed(2)}</td>
                    <td className='sp-metric-desc'>Root Mean Squared Error</td>
                    <td className='sp-metric-interpretation'>
                      {predictionData.backtesting.metrics.rmse < 2.5 ? 'Excelente' :
                       predictionData.backtesting.metrics.rmse < 5 ? 'Bueno' : 'Regular'}
                    </td>
                  </tr>
                  <tr className='sp-metric-row-success'>
                    <td className='sp-metric-name'>
                      <FontAwesomeIcon icon={faCheckCircle} className='sp-metric-icon-inline' />
                      R² Score
                    </td>
                    <td className='sp-metric-value'>{predictionData.backtesting.metrics.r2.toFixed(4)}</td>
                    <td className='sp-metric-desc'>Coeficiente de Determinación</td>
                    <td className='sp-metric-interpretation'>
                      {predictionData.backtesting.metrics.r2 > 0.95 ? 'Excelente' :
                       predictionData.backtesting.metrics.r2 > 0.90 ? 'Muy Bueno' :
                       predictionData.backtesting.metrics.r2 > 0.80 ? 'Bueno' : 'Regular'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard