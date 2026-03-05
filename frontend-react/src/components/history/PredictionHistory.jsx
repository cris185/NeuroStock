import { useState, useEffect, useCallback } from 'react';
import { Download, Trash2, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import axiosInstance from '../axiosInstance';

const PROVIDERS = ['yfinance', 'alphavantage', 'finnhub'];

const PredictionHistory = () => {
  const [records, setRecords] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ ticker: '', provider: '', date_from: '', date_to: '' });
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const pageSize = 20;

  const fetchHistory = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, page_size: pageSize });
    if (filters.ticker) params.append('ticker', filters.ticker);
    if (filters.provider) params.append('provider', filters.provider);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    axiosInstance.get(`/predictions/?${params}`)
      .then(res => {
        setRecords(res.data.results || res.data);
        setCount(res.data.count || (res.data.results ? res.data.count : res.data.length));
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDelete = (id) => {
    axiosInstance.delete(`/predictions/${id}/`)
      .then(() => fetchHistory())
      .catch(() => {});
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filters.ticker) params.append('ticker', filters.ticker);
    if (filters.provider) params.append('provider', filters.provider);
    axiosInstance.get(`/predictions/export/?${params}`, { responseType: 'blob' })
      .then(res => {
        const url = URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'neurostock_predictions.csv';
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const toggleCompare = (id) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const compareRecords = records.filter(r => compareIds.includes(r.id));
  const totalPages = Math.ceil(count / pageSize);

  const r2Color = (r2) => {
    if (r2 == null) return '#6C7589';
    if (r2 > 0.9) return '#27AE60';
    if (r2 > 0.7) return '#F39C12';
    return '#E74C3C';
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Filters */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
        marginBottom: '1rem', alignItems: 'flex-end',
      }}>
        <input
          placeholder="Ticker (ej. AAPL)"
          value={filters.ticker}
          onChange={e => { setFilters(f => ({ ...f, ticker: e.target.value })); setPage(1); }}
          style={inputStyle}
        />
        <select
          value={filters.provider}
          onChange={e => { setFilters(f => ({ ...f, provider: e.target.value })); setPage(1); }}
          style={inputStyle}
        >
          <option value="">Todos los providers</option>
          {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input type="date" value={filters.date_from}
          onChange={e => { setFilters(f => ({ ...f, date_from: e.target.value })); setPage(1); }}
          style={inputStyle} />
        <input type="date" value={filters.date_to}
          onChange={e => { setFilters(f => ({ ...f, date_to: e.target.value })); setPage(1); }}
          style={inputStyle} />
        <button onClick={handleExport} style={actionBtnStyle('#27AE60')}>
          <Download style={{ width: '0.875rem', height: '0.875rem' }} />
          Exportar CSV
        </button>
        {compareIds.length === 2 && (
          <button onClick={() => setShowCompare(true)} style={actionBtnStyle('#9B59B6')}>
            Comparar {compareIds.length}/2
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ color: '#6C7589', textAlign: 'center', padding: '2rem' }}>Cargando historial...</div>
      ) : records.length === 0 ? (
        <div style={{ color: '#6C7589', textAlign: 'center', padding: '2rem' }}>
          No se encontraron predicciones con los filtros aplicados.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['', 'Ticker', 'Provider', 'Modelo', 'Días futuro', 'R²', 'RMSE', 'Tendencia', 'Fecha', ''].map((h, i) => (
                  <th key={i} style={{ padding: '0.625rem 0.75rem', color: '#6C7589', textAlign: 'left', fontWeight: '500' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map(rec => (
                <tr
                  key={rec.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: compareIds.includes(rec.id) ? 'rgba(155, 89, 182, 0.08)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!compareIds.includes(rec.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { if (!compareIds.includes(rec.id)) e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '0.625rem 0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={compareIds.includes(rec.id)}
                      onChange={() => toggleCompare(rec.id)}
                      style={{ cursor: 'pointer', accentColor: '#9B59B6' }}
                    />
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: '#E8EAF0', fontWeight: '600' }}>{rec.ticker}</td>
                  <td style={{ padding: '0.625rem 0.75rem', color: '#B8BFCC' }}>{rec.provider}</td>
                  <td style={{ padding: '0.625rem 0.75rem', color: '#B8BFCC' }}>{rec.model_config_name || 'Default'}</td>
                  <td style={{ padding: '0.625rem 0.75rem', color: '#B8BFCC' }}>{rec.future_days || '—'}</td>
                  <td style={{ padding: '0.625rem 0.75rem', fontWeight: '600', color: r2Color(rec.metrics?.r2) }}>
                    {rec.metrics?.r2 ?? '—'}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: '#B8BFCC' }}>{rec.metrics?.rmse ?? '—'}</td>
                  <td style={{ padding: '0.625rem 0.75rem' }}>
                    {rec.prediction_summary?.trend === 'up'
                      ? <ArrowUpRight style={{ width: '1rem', height: '1rem', color: '#27AE60' }} />
                      : rec.prediction_summary?.trend === 'down'
                        ? <ArrowDownRight style={{ width: '1rem', height: '1rem', color: '#E74C3C' }} />
                        : <span style={{ color: '#6C7589' }}>—</span>
                    }
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: '#6C7589', whiteSpace: 'nowrap' }}>
                    {rec.created_at?.slice(0, 10)}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem' }}>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C', padding: '0.25rem' }}
                      title="Eliminar"
                    >
                      <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{ ...paginBtnStyle, opacity: page === 1 ? 0.3 : 1 }}
          >
            <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
          </button>
          <span style={{ color: '#B8BFCC', fontSize: '0.875rem' }}>
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{ ...paginBtnStyle, opacity: page === totalPages ? 0.3 : 1 }}
          >
            <ChevronRight style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>
      )}

      {/* Compare Modal */}
      {showCompare && compareRecords.length === 2 && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '1rem',
        }} onClick={() => setShowCompare(false)}>
          <div
            style={{
              background: '#111827',
              border: '1px solid rgba(155, 89, 182, 0.3)',
              borderRadius: '1rem',
              padding: '1.5rem',
              maxWidth: '600px',
              width: '100%',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCompare(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6C7589' }}
            >
              <X style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
            <h3 style={{ color: '#E8EAF0', marginBottom: '1.25rem', fontWeight: '600' }}>Comparar predicciones</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {compareRecords.map(rec => (
                <div key={rec.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#4A7AB7', marginBottom: '0.5rem' }}>{rec.ticker}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6C7589', marginBottom: '0.75rem' }}>
                    {rec.created_at?.slice(0, 10)} · {rec.provider}
                  </div>
                  {[['R²', rec.metrics?.r2], ['RMSE', rec.metrics?.rmse], ['MSE', rec.metrics?.mse]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color: '#6C7589', fontSize: '0.8rem' }}>{k}</span>
                      <span style={{ color: '#E8EAF0', fontWeight: '600', fontSize: '0.8rem' }}>{v ?? '—'}</span>
                    </div>
                  ))}
                  {rec.prediction_summary?.trend && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      {rec.prediction_summary.trend === 'up'
                        ? <><ArrowUpRight style={{ width: '0.875rem', height: '0.875rem', color: '#27AE60' }} /><span style={{ color: '#27AE60', fontSize: '0.8rem' }}>Tendencia alcista</span></>
                        : <><ArrowDownRight style={{ width: '0.875rem', height: '0.875rem', color: '#E74C3C' }} /><span style={{ color: '#E74C3C', fontSize: '0.8rem' }}>Tendencia bajista</span></>
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.5rem',
  color: '#B8BFCC',
  padding: '0.5rem 0.875rem',
  fontSize: '0.8rem',
  outline: 'none',
  minWidth: '130px',
  colorScheme: 'dark',
};

const actionBtnStyle = (color) => ({
  display: 'flex', alignItems: 'center', gap: '0.375rem',
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  background: `${color}18`,
  border: `1px solid ${color}30`,
  color,
  fontSize: '0.8rem',
  cursor: 'pointer',
});

const paginBtnStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.5rem',
  color: '#B8BFCC',
  cursor: 'pointer',
  padding: '0.375rem',
  display: 'flex',
};

export default PredictionHistory;
