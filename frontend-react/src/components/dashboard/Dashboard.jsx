import { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { TrendingUp, Loader2, Calculator, CheckCircle2, Activity } from 'lucide-react';
import StockChart from '../Charts/StockChart';
import PremiumButton from '../ui/PremiumButton';
import PremiumCard from '../ui/PremiumCard';
import SkeletonLoader from '../ui/SkeletonLoader';
import EmptyState from '../ui/EmptyState';
import MetricCard from '../ui/MetricCard';

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
      try {
        const response = await axiosInstance.get('/protected-view/');
        //console.log('Success:', response.data);
      } catch (error) {
        console.error('Error fetching  data:', error);
      }
    };
    fetchProtectedData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFuturePredictions(null); // Reset future predictions when searching new ticker
    try {
      const response = await axiosInstance.post('/predict/', {
        ticker: ticker,
        future_days: 0, // Initial request is backtesting only
      });
      console.log('Prediction data received:', response.data);

      // Store entire response data for charts
      setPredictionData(response.data);

      if (response.data.error) {
        setError(response.data.error);
      }
    } catch (error) {
      console.error('There was an error making the API request:', error);
      setError(
        error.response?.data?.error ||
          'Error al obtener predicciones. Intenta con otro ticker.'
      );
      setPredictionData(null);
    } finally {
      setLoading(false);
    }
  };

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
        future_days: days,
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

  // Ticker chip styles with hover handlers
  const tickerChipStyle = {
    padding: '0.5rem 1rem',
    background: 'rgba(46, 90, 143, 0.1)',
    border: '1px solid rgba(46, 90, 143, 0.2)',
    borderRadius: '0.5rem',
    color: '#4A7AB7',
    fontFamily: 'Roboto Mono, monospace',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const handleChipMouseEnter = (e) => {
    e.currentTarget.style.background = 'rgba(46, 90, 143, 0.2)';
    e.currentTarget.style.borderColor = '#4A7AB7';
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(46, 90, 143, 0.2)';
  };

  const handleChipMouseLeave = (e) => {
    e.currentTarget.style.background = 'rgba(46, 90, 143, 0.1)';
    e.currentTarget.style.borderColor = 'rgba(46, 90, 143, 0.2)';
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className="sp-dashboard container">
      <div className="sp-dashboard-header">
        <h1 className="sp-dashboard-title">Panel de Predicciones</h1>
        <p className="sp-dashboard-subtitle">
          Analiza y predice el comportamiento de acciones con IA
        </p>
      </div>

      {/* Search Section */}
      <PremiumCard
        borderGradient="linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 100%)"
        style={{ marginBottom: '2rem' }}
      >
        <h2 className="sp-search-heading">Analiza tu Acción Favorita</h2>
        <p className="sp-search-subheading">
          Ingresa el símbolo del ticker para obtener predicciones impulsadas por IA
        </p>

        {error && <div className="sp-alert sp-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="sp-search-form">
          <div className="sp-ticker-input-container" style={{ marginBottom: '1.5rem' }}>
            <div className="sp-ticker-input-icon">
              <TrendingUp style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <input
              type="text"
              className="sp-ticker-input"
              placeholder="Ej: AAPL, TSLA, GOOGL, AMZN"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              required
            />
            {ticker && (
              <div className="sp-ticker-clear" onClick={() => setTicker('')}>
                ×
              </div>
            )}
          </div>

          <PremiumButton
            variant="primary"
            type="submit"
            loading={loading}
            style={{ width: '100%', height: '56px', fontSize: '1.125rem' }}
          >
            {loading ? (
              <>
                <Loader2 style={{ width: '1rem', height: '1rem' }} className="sp-spin" />
                <span>Analizando datos...</span>
              </>
            ) : (
              <>
                <TrendingUp style={{ width: '1rem', height: '1rem' }} />
                <span>Analizar Acción</span>
              </>
            )}
          </PremiumButton>
        </form>

        <div className="sp-popular-tickers">
          <span className="sp-popular-label">Populares:</span>
          {['AAPL', 'TSLA', 'GOOGL', 'MSFT'].map((stock) => (
            <button
              key={stock}
              type="button"
              style={tickerChipStyle}
              onClick={() => setTicker(stock)}
              onMouseEnter={handleChipMouseEnter}
              onMouseLeave={handleChipMouseLeave}
            >
              {stock}
            </button>
          ))}
        </div>
      </PremiumCard>

      {/* Loading State */}
      {loading && (
        <>
          <SkeletonLoader variant="chart" count={4} />
        </>
      )}

      {/* Empty State */}
      {!loading && !predictionData && (
        <PremiumCard>
          <EmptyState onTickerSelect={(selectedTicker) => setTicker(selectedTicker)} />
        </PremiumCard>
      )}

      {/* Results Section */}
      {predictionData && !loading && (
        <>
          <div
            className="charts-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            {/* Chart 1: Historical Closing Price */}
            <div style={{ animation: 'fadeInUp 0.6s ease-out 0ms backwards' }}>
              <PremiumCard borderGradient="linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 100%)">
                <StockChart
                  title={`Precio de Cierre Histórico - ${predictionData.ticker}`}
                  labels={predictionData.historical_data.dates}
                  datasets={[
                    {
                      label: 'Precio de Cierre',
                      data: predictionData.historical_data.close_prices,
                      borderColor: '#2E5A8F',
                      backgroundColor: 'rgba(46, 90, 143, 0.1)',
                      fill: true,
                    },
                  ]}
                />
              </PremiumCard>
            </div>

            {/* Chart 2: Price with MA100 */}
            <div style={{ animation: 'fadeInUp 0.6s ease-out 100ms backwards' }}>
              <PremiumCard borderGradient="linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 100%)">
                <StockChart
                  title={`Precio de Cierre con MA100 - ${predictionData.ticker}`}
                  labels={predictionData.historical_data.dates}
                  datasets={[
                    {
                      label: 'Precio de Cierre',
                      data: predictionData.historical_data.close_prices,
                      borderColor: '#2E5A8F',
                      backgroundColor: 'transparent',
                    },
                    {
                      label: 'MA100',
                      data: predictionData.ma_data.ma100,
                      borderColor: '#27AE60',
                      backgroundColor: 'transparent',
                    },
                  ]}
                />
              </PremiumCard>
            </div>

            {/* Chart 3: Price with MA100 and MA200 */}
            <div style={{ animation: 'fadeInUp 0.6s ease-out 200ms backwards' }}>
              <PremiumCard borderGradient="linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 100%)">
                <StockChart
                  title={`Precio de Cierre con MA100 y MA200 - ${predictionData.ticker}`}
                  labels={predictionData.historical_data.dates}
                  datasets={[
                    {
                      label: 'Precio de Cierre',
                      data: predictionData.historical_data.close_prices,
                      borderColor: '#2E5A8F',
                      backgroundColor: 'transparent',
                    },
                    {
                      label: 'MA100',
                      data: predictionData.ma_data.ma100,
                      borderColor: '#27AE60',
                      backgroundColor: 'transparent',
                    },
                    {
                      label: 'MA200',
                      data: predictionData.ma_data.ma200,
                      borderColor: '#F39C12',
                      backgroundColor: 'transparent',
                    },
                  ]}
                />
              </PremiumCard>
            </div>

            {/* Chart 4: Prediction vs Real Price + Future Predictions */}
            <div style={{ animation: 'fadeInUp 0.6s ease-out 300ms backwards' }}>
              <PremiumCard borderGradient="linear-gradient(90deg, #9B59B6 0%, #8E44AD 100%)">
                <StockChart
                  title={`Predicción Backtesting${futurePredictions ? ' y Futura' : ''} - ${
                    predictionData.ticker
                  }`}
                  labels={[
                    ...predictionData.backtesting.test_dates,
                    ...(futurePredictions?.dates || []),
                  ]}
                  datasets={[
                    // Dataset 1: Precios reales (solo backtesting)
                    {
                      label: 'Precio Real',
                      data: [
                        ...predictionData.backtesting.test_prices,
                        ...Array(futurePredictions?.dates.length || 0).fill(null),
                      ],
                      borderColor: '#2E5A8F',
                      borderWidth: 2,
                      pointRadius: 0,
                    },
                    // Dataset 2: Predicción backtesting
                    {
                      label: 'Predicción LSTM (Backtesting)',
                      data: [
                        ...predictionData.backtesting.predicted_prices,
                        ...Array(futurePredictions?.dates.length || 0).fill(null),
                      ],
                      borderColor: '#E74C3C',
                      borderDash: [5, 5],
                      borderWidth: 2,
                      pointRadius: 0,
                    },
                    // Dataset 3: Predicción futura (si existe)
                    ...(futurePredictions
                      ? [
                          {
                            label: 'Predicción Futura',
                            data: [
                              ...Array(predictionData.backtesting.test_dates.length).fill(null),
                              ...futurePredictions.predicted_prices,
                            ],
                            borderColor: '#9B59B6',
                            borderDash: [8, 4],
                            borderWidth: 2,
                            pointRadius: 3,
                          },
                        ]
                      : []),
                    // Dataset 4 y 5: Bandas de confianza (si existen)
                    ...(futurePredictions
                      ? [
                          {
                            label: 'Límite Superior (95% CI)',
                            data: [
                              ...Array(predictionData.backtesting.test_dates.length).fill(null),
                              ...futurePredictions.upper_bound,
                            ],
                            borderColor: 'rgba(155, 89, 182, 0.3)',
                            backgroundColor: 'rgba(155, 89, 182, 0.15)',
                            fill: '+1',
                            borderWidth: 1,
                            borderDash: [2, 2],
                            pointRadius: 0,
                          },
                          {
                            label: 'Límite Inferior (95% CI)',
                            data: [
                              ...Array(predictionData.backtesting.test_dates.length).fill(null),
                              ...futurePredictions.lower_bound,
                            ],
                            borderColor: 'rgba(155, 89, 182, 0.3)',
                            backgroundColor: 'rgba(155, 89, 182, 0.15)',
                            fill: false,
                            borderWidth: 1,
                            borderDash: [2, 2],
                            pointRadius: 0,
                          },
                        ]
                      : []),
                  ]}
                />
              </PremiumCard>
            </div>
          </div>

          {/* Future Prediction Section */}
          <div style={{ animation: 'fadeInUp 0.6s ease-out 400ms backwards' }}>
            <PremiumCard
              borderGradient="linear-gradient(90deg, #9B59B6 0%, #8E44AD 100%)"
              style={{ marginBottom: '2rem' }}
            >
              <h2 className="sp-future-heading">Predicciones Futuras</h2>
              <p className="sp-future-description">
                Genera predicciones a futuro con intervalos de confianza del 95%
              </p>

              <div className="sp-future-controls">
                <div className="sp-form-group sp-future-input-group">
                  <label className="sp-form-label">Días a Predecir (1-365)</label>
                  <div className="sp-future-input-wrapper">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      className="sp-form-input sp-future-input"
                      value={futureDaysInput}
                      onChange={(e) => setFutureDaysInput(e.target.value)}
                      placeholder="Ej: 30, 60, 90"
                    />
                    <span className="sp-future-input-suffix">días</span>
                  </div>
                </div>

                <PremiumButton
                  variant="secondary"
                  onClick={handleFuturePrediction}
                  loading={loadingFuture}
                  style={{
                    background: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
                    height: '48px',
                    padding: '0 1.5rem',
                    whiteSpace: 'nowrap',
                    minWidth: '220px',
                  }}
                  disabled={!isValidDays()}
                >
                  {loadingFuture ? (
                    <>
                      <Loader2 style={{ width: '1rem', height: '1rem' }} className="sp-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <TrendingUp style={{ width: '1rem', height: '1rem' }} />
                      Generar Predicción
                    </>
                  )}
                </PremiumButton>
              </div>

              {futurePredictions && futurePredictions.warning && (
                <div className="sp-alert sp-alert-warning" style={{ marginTop: '1rem' }}>
                  {futurePredictions.warning}
                </div>
              )}
            </PremiumCard>
          </div>

          {/* Metrics Section - Premium Cards */}
          <div style={{ animation: 'fadeInUp 0.6s ease-out 500ms backwards' }}>
            <h2
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#FFFFFF',
                marginBottom: '1.5rem',
                textAlign: 'center',
              }}
            >
              Métricas de Precisión del Modelo (Backtesting)
            </h2>

            <div
              className="metrics-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
              }}
            >
              {/* MSE Metric */}
              <MetricCard
                icon={Calculator}
                name="MSE"
                value={predictionData.backtesting.metrics.mse.toFixed(2)}
                description="Mean Squared Error - Promedio de errores al cuadrado"
                interpretation={
                  predictionData.backtesting.metrics.mse < 5
                    ? 'Excelente'
                    : predictionData.backtesting.metrics.mse < 15
                    ? 'Bueno'
                    : 'Regular'
                }
                status="warning"
              />

              {/* RMSE Metric */}
              <MetricCard
                icon={Activity}
                name="RMSE"
                value={predictionData.backtesting.metrics.rmse.toFixed(2)}
                description="Root Mean Squared Error - Desviación estándar de errores"
                interpretation={
                  predictionData.backtesting.metrics.rmse < 2.5
                    ? 'Excelente'
                    : predictionData.backtesting.metrics.rmse < 5
                    ? 'Bueno'
                    : 'Regular'
                }
                status="info"
              />

              {/* R² Score Metric */}
              <MetricCard
                icon={CheckCircle2}
                name="R² Score"
                value={predictionData.backtesting.metrics.r2.toFixed(4)}
                description="Coeficiente de Determinación - Calidad del ajuste del modelo"
                interpretation={
                  predictionData.backtesting.metrics.r2 > 0.95
                    ? 'Excelente'
                    : predictionData.backtesting.metrics.r2 > 0.9
                    ? 'Muy Bueno'
                    : predictionData.backtesting.metrics.r2 > 0.8
                    ? 'Bueno'
                    : 'Regular'
                }
                status="success"
              />
            </div>
          </div>
        </>
      )}

      {/* Add keyframes for animations and custom styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .sp-spin {
          animation: spin 1s linear infinite;
        }

        /* Responsive grid for charts */
        @media (max-width: 1199px) {
          .charts-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.25rem !important;
          }
        }

        @media (max-width: 767px) {
          .charts-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }

        /* Responsive grid for metrics */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 640px) {
          .metrics-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
