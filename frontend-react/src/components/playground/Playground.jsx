import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlaskConical, ChevronDown, ChevronUp, Save, Zap, CheckCircle2,
  Loader2, AlertTriangle, Info, Clock, Cpu, Sliders, BarChart2,
} from 'lucide-react';
import axiosInstance from '../axiosInstance';

/* ─── Constants ─────────────────────────────────────────────────── */

const ARCHITECTURES = [
  { value: 'lstm',   label: 'LSTM',   descKey: 'playground.archLSTMDesc',   color: '#4A7AB7' },
  { value: 'gru',    label: 'GRU',    descKey: 'playground.archGRUDesc',    color: '#27AE60' },
  { value: 'bilstm', label: 'BiLSTM', descKey: 'playground.archBiLSTMDesc', color: '#9B59B6' },
];

const INDICATORS = [
  { value: 'rsi',       label: 'RSI',            descKey: 'playground.indicatorRSIDesc' },
  { value: 'macd',      label: 'MACD',           descKey: 'playground.indicatorMACDDesc' },
  { value: 'bollinger', label: 'Bollinger Bands', descKey: 'playground.indicatorBollingerDesc' },
  { value: 'ema',       label: 'EMA 50',          descKey: 'playground.indicatorEMADesc' },
];

/* ─── Sub-components ─────────────────────────────────────────────── */

const Cell = ({ title, icon: Icon, iconColor = '#4A7AB7', children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '0.875rem',
      overflow: 'hidden',
      marginBottom: '0.875rem',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.125rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#E8EAF0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Icon style={{ width: '1rem', height: '1rem', color: iconColor }} />
          <span style={{ fontWeight: '600', fontSize: '0.9375rem' }}>{title}</span>
        </div>
        {open
          ? <ChevronUp style={{ width: '1rem', height: '1rem', color: '#6C7589' }} />
          : <ChevronDown style={{ width: '1rem', height: '1rem', color: '#6C7589' }} />
        }
      </button>
      {open && (
        <div style={{ padding: '0 1.125rem 1.125rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const Slider = ({ label, value, min, max, step = 1, onChange, unit = '', description }) => (
  <div style={{ marginTop: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.375rem' }}>
      <label style={{ color: '#B8BFCC', fontSize: '0.875rem', fontWeight: '500' }}>{label}</label>
      <span style={{ color: '#4A7AB7', fontWeight: '700', fontSize: '0.875rem', fontFamily: 'Roboto Mono, monospace' }}>
        {value}{unit}
      </span>
    </div>
    {description && (
      <p style={{ color: '#6C7589', fontSize: '0.75rem', margin: '0 0 0.5rem' }}>{description}</p>
    )}
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: '#4A7AB7', cursor: 'pointer' }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
      <span style={{ color: '#6C7589', fontSize: '0.7rem' }}>{min}{unit}</span>
      <span style={{ color: '#6C7589', fontSize: '0.7rem' }}>{max}{unit}</span>
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────── */

const Playground = () => {
  const { t } = useTranslation();
  const [configs, setConfigs] = useState([]);
  const [activeConfig, setActiveConfig] = useState(null);
  const [availability, setAvailability] = useState({});
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  // Draft state (what's currently in the form)
  const [draft, setDraft] = useState({
    name: t('playground.defaultConfigName'),
    architecture: 'lstm',
    sequence_length: 100,
    mc_iterations: 50,
    uncertainty_growth: 0.02,
    default_confidence: 0.95,
    technical_indicators: [],
    notes: '',
  });

  const fetchAll = useCallback(() => {
    setLoadingConfigs(true);
    Promise.all([
      axiosInstance.get('/model-configs/'),
      axiosInstance.get('/model-configs/availability/'),
    ])
      .then(([configsRes, availRes]) => {
        const list = configsRes.data.results || configsRes.data;
        setConfigs(list);
        setAvailability(availRes.data);
        const active = list.find(c => c.is_active);
        if (active) {
          setActiveConfig(active);
          setDraft({
            name: active.name,
            architecture: active.architecture,
            sequence_length: active.sequence_length,
            mc_iterations: active.mc_iterations,
            uncertainty_growth: active.uncertainty_growth,
            default_confidence: active.default_confidence,
            technical_indicators: active.technical_indicators || [],
            notes: active.notes || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingConfigs(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = async () => {
    setSaving(true);
    setSavedMsg('');
    try {
      await axiosInstance.post('/model-configs/', { ...draft });
      setSavedMsg(t('playground.savedSuccess'));
      fetchAll();
    } catch (err) {
      setSavedMsg(err.response?.data ? JSON.stringify(err.response.data) : t('playground.savedError'));
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(''), 4000);
    }
  };

  const handleActivate = async (id) => {
    setActivating(true);
    try {
      await axiosInstance.post(`/model-configs/${id}/activate/`);
      fetchAll();
    } catch {
    } finally {
      setActivating(false);
    }
  };

  const handleActivateLatest = async () => {
    setSaving(true);
    try {
      const res = await axiosInstance.post('/model-configs/', { ...draft });
      await axiosInstance.post(`/model-configs/${res.data.id}/activate/`);
      fetchAll();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const toggleIndicator = (val) => {
    setDraft(d => ({
      ...d,
      technical_indicators: d.technical_indicators.includes(val)
        ? d.technical_indicators.filter(x => x !== val)
        : [...d.technical_indicators, val],
    }));
  };

  const isAvailable = (arch) => availability[arch] !== false;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <FlaskConical style={{ width: '1.75rem', height: '1.75rem', color: '#9B59B6' }} />
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2rem', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
            {t('playground.title')}
          </h1>
        </div>
        <p style={{ color: '#6C7589', margin: 0, fontSize: '0.9375rem' }}>
          {t('playground.subtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left — Cells */}
        <div>
          {/* Architecture Cell */}
          <Cell title={t('playground.cellArchitecture')} icon={Cpu} iconColor="#9B59B6">
            <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {ARCHITECTURES.map(arch => {
                const available = isAvailable(arch.value);
                const selected = draft.architecture === arch.value;
                return (
                  <button
                    key={arch.value}
                    onClick={() => available && setDraft(d => ({ ...d, architecture: arch.value }))}
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: '0.625rem',
                      border: `1px solid ${selected ? `${arch.color}50` : 'rgba(255,255,255,0.08)'}`,
                      background: selected ? `${arch.color}12` : 'transparent',
                      cursor: available ? 'pointer' : 'not-allowed',
                      opacity: available ? 1 : 0.45,
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '0.875rem', height: '0.875rem', borderRadius: '50%',
                          border: `2px solid ${arch.color}`,
                          background: selected ? arch.color : 'transparent',
                        }} />
                        <span style={{ fontWeight: '700', color: selected ? arch.color : '#E8EAF0', fontSize: '0.9375rem' }}>
                          {arch.label}
                        </span>
                      </div>
                      {!available && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6C7589', fontSize: '0.7rem' }}>
                          <AlertTriangle style={{ width: '0.7rem', height: '0.7rem' }} />
                          {t('playground.archNotAvailable')}
                        </span>
                      )}
                      {selected && available && (
                        <CheckCircle2 style={{ width: '0.875rem', height: '0.875rem', color: arch.color }} />
                      )}
                    </div>
                    <p style={{ color: '#6C7589', fontSize: '0.8rem', margin: 0, paddingLeft: '1.375rem' }}>
                      {t(arch.descKey)}
                    </p>
                  </button>
                );
              })}
            </div>

            {!isAvailable(draft.architecture) && (
              <div style={{
                marginTop: '0.875rem',
                padding: '0.625rem 0.875rem',
                background: 'rgba(243,156,18,0.08)',
                border: '1px solid rgba(243,156,18,0.25)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}>
                <AlertTriangle style={{ width: '0.875rem', height: '0.875rem', color: '#F39C12', flexShrink: 0, marginTop: '0.1rem' }} />
                <span style={{ color: '#F39C12', fontSize: '0.8rem' }}>
                  {t('playground.archWarning', { filename: `stock_prediction_model_${draft.architecture}.onnx` })}
                </span>
              </div>
            )}
          </Cell>

          {/* Inference Parameters Cell */}
          <Cell title={t('playground.cellInference')} icon={Sliders} iconColor="#4A7AB7">
            <div style={{ paddingTop: '0.5rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 0.75rem', marginBottom: '0.5rem',
                background: 'rgba(74,122,183,0.08)', borderRadius: '0.5rem',
                border: '1px solid rgba(74,122,183,0.15)',
              }}>
                <Info style={{ width: '0.75rem', height: '0.75rem', color: '#4A7AB7', flexShrink: 0 }} />
                <span style={{ color: '#6C7589', fontSize: '0.75rem' }}>
                  {t('playground.inferenceInfo')}
                </span>
              </div>

              <Slider
                label={t('playground.sliderMC')}
                value={draft.mc_iterations}
                min={10}
                max={100}
                step={5}
                unit=""
                onChange={v => setDraft(d => ({ ...d, mc_iterations: v }))}
                description={t('playground.sliderMCDesc')}
              />

              <Slider
                label={t('playground.sliderUncertainty')}
                value={draft.uncertainty_growth}
                min={0.005}
                max={0.05}
                step={0.005}
                unit={` ${t('playground.unitPerDay')}`}
                onChange={v => setDraft(d => ({ ...d, uncertainty_growth: v }))}
                description={t('playground.sliderUncertaintyDesc')}
              />

              <div style={{ marginTop: '1rem' }}>
                <label style={{ color: '#B8BFCC', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  {t('playground.labelConfidence')}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[0.80, 0.90, 0.95, 0.99].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setDraft(d => ({ ...d, default_confidence: lvl }))}
                      style={{
                        padding: '0.4rem 0.875rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${draft.default_confidence === lvl ? '#4A7AB750' : 'rgba(255,255,255,0.1)'}`,
                        background: draft.default_confidence === lvl ? 'rgba(74,122,183,0.15)' : 'transparent',
                        color: draft.default_confidence === lvl ? '#4A7AB7' : '#B8BFCC',
                        fontSize: '0.875rem',
                        fontWeight: draft.default_confidence === lvl ? '700' : '400',
                        cursor: 'pointer',
                        fontFamily: 'Roboto Mono, monospace',
                      }}
                    >
                      {(lvl * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Cell>

          {/* Technical Indicators Cell */}
          <Cell title={t('playground.cellIndicators')} icon={BarChart2} iconColor="#27AE60" defaultOpen={false}>
            <div style={{ paddingTop: '1rem' }}>
              <p style={{ color: '#6C7589', fontSize: '0.8rem', marginBottom: '0.875rem' }}>
                {t('playground.indicatorsDesc')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {INDICATORS.map(ind => {
                  const active = draft.technical_indicators.includes(ind.value);
                  return (
                    <button
                      key={ind.value}
                      onClick={() => toggleIndicator(ind.value)}
                      style={{
                        padding: '0.625rem 0.875rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${active ? 'rgba(39,174,96,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        background: active ? 'rgba(39,174,96,0.1)' : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                        <div style={{
                          width: '0.625rem', height: '0.625rem', borderRadius: '0.125rem',
                          background: active ? '#27AE60' : 'rgba(255,255,255,0.15)',
                          transition: 'background 0.15s',
                        }} />
                        <span style={{ color: active ? '#27AE60' : '#E8EAF0', fontWeight: '600', fontSize: '0.8rem' }}>
                          {ind.label}
                        </span>
                      </div>
                      <span style={{ color: '#6C7589', fontSize: '0.7rem', paddingLeft: '1.125rem' }}>
                        {t(ind.descKey)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Cell>

          {/* Notes Cell */}
          <Cell title={t('playground.cellNotes')} icon={Info} iconColor="#6C7589" defaultOpen={false}>
            <textarea
              value={draft.notes}
              onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
              placeholder={t('playground.notesPlaceholder')}
              style={{
                width: '100%',
                marginTop: '0.875rem',
                minHeight: '100px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.5rem',
                color: '#B8BFCC',
                padding: '0.75rem',
                fontSize: '0.875rem',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </Cell>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  value={draft.name}
                  onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                  placeholder={t('playground.configNamePlaceholder')}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '0.5rem',
                    color: '#E8EAF0',
                    padding: '0.5rem 0.875rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>
              {savedMsg && (
                <div style={{
                  padding: '0.5rem 0.75rem',
                  background: savedMsg.startsWith('Error') ? 'rgba(231,76,60,0.1)' : 'rgba(39,174,96,0.1)',
                  border: `1px solid ${savedMsg.startsWith('Error') ? 'rgba(231,76,60,0.3)' : 'rgba(39,174,96,0.3)'}`,
                  borderRadius: '0.5rem',
                  color: savedMsg.startsWith('Error') ? '#E74C3C' : '#27AE60',
                  fontSize: '0.8rem',
                  marginBottom: '0.5rem',
                }}>
                  {savedMsg}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '0.5rem 1.125rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(74,122,183,0.12)',
                  border: '1px solid rgba(74,122,183,0.35)',
                  color: '#4A7AB7',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {saving
                  ? <Loader2 style={{ width: '0.875rem', height: '0.875rem', animation: 'pg-spin 1s linear infinite' }} />
                  : <Save style={{ width: '0.875rem', height: '0.875rem' }} />
                }
                {t('playground.btnSaveVersion')}
              </button>

              <button
                onClick={handleActivateLatest}
                disabled={saving || activating}
                style={{
                  padding: '0.5rem 1.125rem',
                  borderRadius: '0.5rem',
                  background: isAvailable(draft.architecture) ? 'rgba(39,174,96,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isAvailable(draft.architecture) ? 'rgba(39,174,96,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  color: isAvailable(draft.architecture) ? '#27AE60' : '#6C7589',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: (saving || activating) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {activating
                  ? <Loader2 style={{ width: '0.875rem', height: '0.875rem', animation: 'pg-spin 1s linear infinite' }} />
                  : <Zap style={{ width: '0.875rem', height: '0.875rem' }} />
                }
                {t('playground.btnSaveActivate')}
              </button>
            </div>
          </div>
        </div>

        {/* Right — Sidebar */}
        <div style={{ position: 'sticky', top: '6rem' }}>
          {/* Active config card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(155,89,182,0.25)',
            borderRadius: '0.875rem',
            padding: '1.125rem',
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <CheckCircle2 style={{ width: '0.875rem', height: '0.875rem', color: '#27AE60' }} />
              <span style={{ color: '#E8EAF0', fontWeight: '600', fontSize: '0.875rem' }}>{t('playground.sidebarActiveConfig')}</span>
            </div>

            {loadingConfigs ? (
              <div style={{ color: '#6C7589', fontSize: '0.8rem' }}>{t('playground.loading')}</div>
            ) : activeConfig ? (
              <>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#9B59B6', marginBottom: '0.25rem' }}>
                  {activeConfig.name}
                </div>
                <div style={{ color: '#6C7589', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                  v{activeConfig.version} · {activeConfig.created_at?.slice(0, 10)}
                </div>
                {[
                  [t('playground.sidebarArchitecture'), activeConfig.architecture?.toUpperCase()],
                  [t('playground.sidebarSeqLength'), `${activeConfig.sequence_length} ${t('playground.suffixDays')}`],
                  [t('playground.sidebarMCIterations'), activeConfig.mc_iterations],
                  [t('playground.sidebarUncertainty'), `${activeConfig.uncertainty_growth}/${t('playground.unitPerDay')}`],
                  [t('playground.sidebarConfidence'), `${(activeConfig.default_confidence * 100).toFixed(0)}%`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: '#6C7589', fontSize: '0.75rem' }}>{k}</span>
                    <span style={{ color: '#E8EAF0', fontSize: '0.75rem', fontWeight: '600', fontFamily: 'Roboto Mono, monospace' }}>{v}</span>
                  </div>
                ))}
                {activeConfig.metrics && (
                  <div style={{ marginTop: '0.625rem' }}>
                    <span style={{ color: '#6C7589', fontSize: '0.7rem' }}>{t('playground.sidebarLastBacktest')}</span>
                    {activeConfig.metrics.r2 != null && (
                      <div style={{ color: '#27AE60', fontSize: '0.8rem', fontWeight: '600', fontFamily: 'Roboto Mono, monospace' }}>
                        R² {Number(activeConfig.metrics.r2).toFixed(4)}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: '#6C7589', fontSize: '0.8rem' }}>
                {t('playground.noActiveConfig')}
              </div>
            )}
          </div>

          {/* Version history */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '0.875rem',
            padding: '1.125rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <Clock style={{ width: '0.875rem', height: '0.875rem', color: '#6C7589' }} />
              <span style={{ color: '#E8EAF0', fontWeight: '600', fontSize: '0.875rem' }}>{t('playground.sidebarHistory')}</span>
            </div>

            {loadingConfigs ? (
              <div style={{ color: '#6C7589', fontSize: '0.8rem' }}>{t('playground.loading')}</div>
            ) : configs.length === 0 ? (
              <div style={{ color: '#6C7589', fontSize: '0.8rem' }}>{t('playground.noVersionsSaved')}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {configs.slice(0, 8).map(cfg => (
                  <div
                    key={cfg.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.625rem',
                      borderRadius: '0.5rem',
                      background: cfg.is_active ? 'rgba(155,89,182,0.08)' : 'transparent',
                      border: cfg.is_active ? '1px solid rgba(155,89,182,0.2)' : '1px solid transparent',
                    }}
                  >
                    <div style={{
                      width: '0.5rem', height: '0.5rem', borderRadius: '50%',
                      background: cfg.is_active ? '#9B59B6' : 'rgba(255,255,255,0.15)',
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: cfg.is_active ? '#E8EAF0' : '#B8BFCC', fontSize: '0.8rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cfg.name}
                      </div>
                      <div style={{ color: '#6C7589', fontSize: '0.7rem' }}>
                        v{cfg.version} · {cfg.architecture?.toUpperCase()} · {cfg.created_at?.slice(0, 10)}
                      </div>
                    </div>
                    {!cfg.is_active && (
                      <button
                        onClick={() => handleActivate(cfg.id)}
                        disabled={activating}
                        title={t('playground.btnActivateTitle')}
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.375rem',
                          background: 'rgba(39,174,96,0.1)',
                          border: '1px solid rgba(39,174,96,0.25)',
                          color: '#27AE60',
                          fontSize: '0.65rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t('playground.btnActivate')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pg-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .pg-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Playground;
