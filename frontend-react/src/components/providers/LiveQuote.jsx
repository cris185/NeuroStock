import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Clock } from 'lucide-react';
import axiosInstance from '../axiosInstance';

/**
 * LiveQuote — polling widget that fetches market quote every 60s.
 * Shows price, change%, volume, and a "Delayed 15min" / "Real-time" badge
 * depending on what the backend provider reports.
 *
 * @param {string} ticker — stock symbol to quote (e.g. "AAPL")
 */
const LiveQuote = ({ ticker }) => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  const fetchQuote = () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    axiosInstance.get(`/market/quote/${ticker}/`)
      .then(res => {
        setQuote(res.data);
        setLastUpdated(new Date());
        setCountdown(60);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'No se pudo obtener la cotización');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!ticker) return;
    fetchQuote();

    intervalRef.current = setInterval(fetchQuote, 60_000);
    countdownRef.current = setInterval(() => {
      setCountdown(c => (c <= 1 ? 60 : c - 1));
    }, 1_000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  if (!ticker) return null;

  const isPositive = quote?.change_pct >= 0;
  const changeColor = isPositive ? '#27AE60' : '#E74C3C';

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '0.75rem',
      padding: '0.875rem 1.125rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
      minWidth: '0',
    }}>
      {/* Ticker label */}
      <div style={{ fontWeight: '700', color: '#4A7AB7', fontSize: '1rem', fontFamily: 'Roboto Mono, monospace', minWidth: '60px' }}>
        {ticker}
      </div>

      {loading && !quote ? (
        <span style={{ color: '#6C7589', fontSize: '0.8rem' }}>Cargando...</span>
      ) : error ? (
        <span style={{ color: '#E74C3C', fontSize: '0.8rem' }}>{error}</span>
      ) : quote ? (
        <>
          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#E8EAF0', fontFamily: 'Roboto Mono, monospace' }}>
              ${Number(quote.price).toFixed(2)}
            </span>
          </div>

          {/* Change */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: changeColor }}>
            {isPositive
              ? <TrendingUp style={{ width: '0.875rem', height: '0.875rem' }} />
              : <TrendingDown style={{ width: '0.875rem', height: '0.875rem' }} />
            }
            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
              {isPositive ? '+' : ''}{Number(quote.change).toFixed(2)} ({isPositive ? '+' : ''}{Number(quote.change_pct).toFixed(2)}%)
            </span>
          </div>

          {/* Volume */}
          {quote.volume && (
            <div style={{ color: '#6C7589', fontSize: '0.75rem' }}>
              Vol: {Number(quote.volume).toLocaleString()}
            </div>
          )}

          {/* Delay badge */}
          <div style={{
            padding: '0.2rem 0.5rem',
            borderRadius: '0.375rem',
            background: quote.is_delayed ? 'rgba(243,156,18,0.12)' : 'rgba(39,174,96,0.12)',
            border: `1px solid ${quote.is_delayed ? 'rgba(243,156,18,0.3)' : 'rgba(39,174,96,0.3)'}`,
            color: quote.is_delayed ? '#F39C12' : '#27AE60',
            fontSize: '0.7rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
          }}>
            {quote.is_delayed ? 'Delayed 15min' : 'Real-time'}
          </div>
        </>
      ) : null}

      {/* Refresh controls */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {quote && (
          <span style={{ color: '#6C7589', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock style={{ width: '0.7rem', height: '0.7rem' }} />
            {countdown}s
          </span>
        )}
        <button
          onClick={fetchQuote}
          disabled={loading}
          title="Actualizar ahora"
          style={{
            background: 'none',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: '#6C7589',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <RefreshCw style={{
            width: '0.875rem',
            height: '0.875rem',
            animation: loading ? 'lq-spin 1s linear infinite' : 'none',
          }} />
        </button>
      </div>

      <style>{`
        @keyframes lq-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LiveQuote;
