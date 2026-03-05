import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp, BarChart2, Brain, Zap, ArrowUpRight, ArrowDownRight,
  LineChart, FlaskConical, Clock,
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import axiosInstance from '../axiosInstance';
import PredictionHistory from '../history/PredictionHistory';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend
);

// -----------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------

const StatCard = ({ icon: Icon, label, value, color = '#2E5A8F', suffix = '' }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '1rem',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'border-color 0.2s',
  }}
    onMouseEnter={e => e.currentTarget.style.borderColor = `${color}44`}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
  >
    <div style={{
      width: '2.75rem', height: '2.75rem',
      borderRadius: '0.75rem',
      background: `${color}18`,
      border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon style={{ width: '1.25rem', height: '1.25rem', color }} />
    </div>
    <div>
      <div style={{ fontSize: '0.75rem', color: '#6C7589', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#E8EAF0', lineHeight: 1 }}>
        {value ?? '—'}{suffix}
      </div>
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 style={{
    fontSize: '1rem', fontWeight: '600', color: '#B8BFCC',
    marginBottom: '1rem', marginTop: '2rem',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
  }}>
    {children}
  </h2>
);

// -----------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    axiosInstance.get('/predictions/stats/')
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const r2TrendData = stats?.r2_trend?.length > 0 ? {
    labels: stats.r2_trend.map(d => d.date),
    datasets: [{
      label: 'R² Score',
      data: stats.r2_trend.map(d => d.r2),
      borderColor: '#2E5A8F',
      backgroundColor: 'rgba(46, 90, 143, 0.1)',
      borderWidth: 2,
      pointRadius: 3,
      tension: 0.4,
      fill: true,
    }],
  } : null;

  const topStocksData = stats?.top_stocks?.length > 0 ? {
    labels: stats.top_stocks.map(s => s.ticker),
    datasets: [{
      label: t('dashboardHub.chartTopStocksDataset'),
      data: stats.top_stocks.map(s => s.count),
      backgroundColor: [
        'rgba(46, 90, 143, 0.7)',
        'rgba(74, 122, 183, 0.7)',
        'rgba(39, 174, 96, 0.6)',
        'rgba(243, 156, 18, 0.6)',
        'rgba(155, 89, 182, 0.6)',
      ],
      borderColor: 'transparent',
      borderRadius: 6,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#6C7589', maxTicksLimit: 6 }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#6C7589' }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0D1117 0%, #111827 50%, #0D1117 100%)',
      padding: '2rem 1.5rem',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#E8EAF0', margin: 0 }}>
            {t('dashboardHub.title')}
          </h1>
          <p style={{ color: '#6C7589', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {t('dashboardHub.subtitle')}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[
            { label: t('dashboardHub.btnNewPrediction'), icon: LineChart, path: '/predictions', color: '#2E5A8F' },
            { label: t('dashboardHub.btnConfigModel'), icon: FlaskConical, path: '/playground', color: '#27AE60' },
            { label: t('dashboardHub.btnViewHistory'), icon: Clock, onClick: () => setShowHistory(v => !v), color: '#F39C12' },
          ].map(({ label, icon: Icon, path, onClick, color }) => (
            <button
              key={label}
              onClick={path ? () => navigate(path) : onClick}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                borderRadius: '0.75rem',
                background: `${color}18`,
                border: `1px solid ${color}30`,
                color,
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${color}28`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${color}18`; }}
            >
              <Icon style={{ width: '1rem', height: '1rem' }} />
              {label}
            </button>
          ))}
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                height: '6rem', borderRadius: '1rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}>
            <StatCard icon={TrendingUp} label={t('dashboardHub.statTotalPredictions')} value={stats?.total_predictions ?? 0} color="#2E5A8F" />
            <StatCard icon={BarChart2} label={t('dashboardHub.statStocksAnalyzed')} value={stats?.unique_tickers ?? 0} color="#27AE60" />
            <StatCard icon={Brain} label={t('dashboardHub.statModelsConfigured')} value={stats?.model_configs ?? 0} color="#9B59B6" />
            <StatCard icon={Zap} label={t('dashboardHub.statProvidersActive')} value={stats?.providers_active ?? 1} color="#F39C12" />
          </div>
        )}

        {/* Active Model Config */}
        {stats?.active_config && (
          <>
            <SectionTitle><Brain style={{ width: '1rem', height: '1rem' }} />{t('dashboardHub.sectionActiveConfig')}</SectionTitle>
            <div style={{
              background: 'rgba(155, 89, 182, 0.06)',
              border: '1px solid rgba(155, 89, 182, 0.2)',
              borderRadius: '1rem',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ color: '#E8EAF0', fontWeight: '600', marginBottom: '0.25rem' }}>
                  {stats.active_config.name}
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#9B59B6', fontWeight: '400' }}>
                    v{stats.active_config.version}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6C7589' }}>
                  {stats.active_config.architecture.toUpperCase()} · seq {stats.active_config.sequence_length}d · {stats.active_config.mc_iterations} MC iters
                </div>
              </div>
              {stats.active_config.metrics && (
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {['r2', 'rmse'].map(k => (
                    <div key={k} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#6C7589', textTransform: 'uppercase' }}>{k}</div>
                      <div style={{ color: '#E8EAF0', fontWeight: '600' }}>{stats.active_config.metrics[k] ?? '—'}</div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => navigate('/playground')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(155, 89, 182, 0.15)',
                  border: '1px solid rgba(155, 89, 182, 0.3)',
                  color: '#9B59B6',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {t('dashboardHub.btnEdit')}
              </button>
            </div>
          </>
        )}

        {/* Charts Row */}
        {(r2TrendData || topStocksData) && (
          <>
            <SectionTitle><TrendingUp style={{ width: '1rem', height: '1rem' }} />{t('dashboardHub.sectionAnalytics')}</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {r2TrendData && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '1rem', padding: '1.25rem',
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#6C7589', marginBottom: '0.75rem' }}>
                    {t('dashboardHub.chartR2Trend')}
                  </div>
                  <div style={{ height: '160px' }}>
                    <Line data={r2TrendData} options={chartOptions} />
                  </div>
                </div>
              )}
              {topStocksData && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '1rem', padding: '1.25rem',
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#6C7589', marginBottom: '0.75rem' }}>
                    {t('dashboardHub.chartTopStocks')}
                  </div>
                  <div style={{ height: '160px' }}>
                    <Bar data={topStocksData} options={chartOptions} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Recent Predictions */}
        {stats?.recent_predictions?.length > 0 && (
          <>
            <SectionTitle><Clock style={{ width: '1rem', height: '1rem' }} />{t('dashboardHub.sectionRecentActivity')}</SectionTitle>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '1rem',
              overflow: 'hidden',
            }}>
              {stats.recent_predictions.map((rec, i) => (
                <div
                  key={rec.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1.25rem',
                    borderBottom: i < stats.recent_predictions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '2rem', height: '2rem', borderRadius: '0.5rem',
                      background: 'rgba(46, 90, 143, 0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: '700', color: '#4A7AB7',
                    }}>
                      {rec.ticker}
                    </div>
                    <div>
                      <div style={{ color: '#E8EAF0', fontSize: '0.875rem', fontWeight: '500' }}>
                        {rec.ticker}
                        {rec.prediction_summary?.trend && (
                          <span style={{ marginLeft: '0.5rem' }}>
                            {rec.prediction_summary.trend === 'up'
                              ? <ArrowUpRight style={{ width: '0.875rem', height: '0.875rem', color: '#27AE60', display: 'inline' }} />
                              : <ArrowDownRight style={{ width: '0.875rem', height: '0.875rem', color: '#E74C3C', display: 'inline' }} />
                            }
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6C7589' }}>
                        {rec.provider} · {rec.created_at?.slice(0, 10)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {rec.metrics?.r2 != null && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#6C7589' }}>R²</div>
                        <div style={{
                          fontSize: '0.875rem', fontWeight: '600',
                          color: rec.metrics.r2 > 0.9 ? '#27AE60' : rec.metrics.r2 > 0.7 ? '#F39C12' : '#E74C3C',
                        }}>
                          {rec.metrics.r2}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => navigate('/predictions')}
                      style={{
                        fontSize: '0.75rem', color: '#4A7AB7',
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0.25rem',
                      }}
                    >
                      {t('dashboardHub.btnRepeat')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* History Table */}
        {showHistory && (
          <>
            <SectionTitle><Clock style={{ width: '1rem', height: '1rem' }} />{t('dashboardHub.sectionFullHistory')}</SectionTitle>
            <PredictionHistory />
          </>
        )}

        {/* Empty state */}
        {!loading && stats?.total_predictions === 0 && (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem', marginTop: '2rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '1.5rem',
          }}>
            <TrendingUp style={{ width: '3rem', height: '3rem', color: '#2E5A8F', margin: '0 auto 1rem' }} />
            <p style={{ color: '#B8BFCC', fontWeight: '600', marginBottom: '0.5rem' }}>
              {t('dashboardHub.emptyTitle')}
            </p>
            <p style={{ color: '#6C7589', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {t('dashboardHub.emptyDesc')}
            </p>
            <button
              onClick={() => navigate('/predictions')}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #1E3A5F, #2E5A8F)',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {t('dashboardHub.emptyBtn')}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default DashboardOverview;
