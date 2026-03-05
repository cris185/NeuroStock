import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Loader2, Key, Wifi, WifiOff, ExternalLink, RefreshCw } from 'lucide-react';
import axiosInstance from '../axiosInstance';

const PROVIDER_CONFIG = {
  alphavantage: { color: '#F39C12', url: 'https://www.alphavantage.co/support/#api-key', requiresKey: true },
  finnhub:      { color: '#27AE60', url: 'https://finnhub.io/register',                  requiresKey: true },
  yfinance:     { color: '#4A7AB7',                                                        requiresKey: false },
};

const maskKey = (key) => key.slice(0, 3) + '••••••••••••';

const ProviderCard = ({ provider, config, onTest }) => {
  const { t } = useTranslation();
  const meta = PROVIDER_CONFIG[provider];

  const [savedKey, setSavedKey] = useState('');
  const [replacing, setReplacing] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const serverHasKey = config?.configured && config?.is_active;
  const inSavedMode = (savedKey || serverHasKey) && !replacing;

  const handleSave = async () => {
    if (!keyInput) return;
    setSaving(true);
    setTestResult(null);
    try {
      await axiosInstance.post('/providers/', { provider, api_key: keyInput, is_active: true });
      setSavedKey(keyInput);
      setKeyInput('');
      setReplacing(false);
    } catch {
      // keep edit mode so user can retry
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    const keyToTest = inSavedMode ? savedKey : keyInput;
    if (!keyToTest) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await onTest(provider, keyToTest);
      setTestResult(res.valid ? 'valid' : 'invalid');
    } catch {
      setTestResult('invalid');
    } finally {
      setTesting(false);
    }
  };

  const handleReplace = () => { setReplacing(true); setKeyInput(''); setTestResult(null); };
  const handleCancelReplace = () => { setReplacing(false); setKeyInput(''); setTestResult(null); };

  const isActive = config?.is_active || savedKey;
  const isValid = savedKey
    ? (testResult === 'valid' ? true : testResult === 'invalid' ? false : config?.is_valid)
    : config?.is_valid;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${isActive ? `${meta.color}40` : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '0.875rem',
      padding: '1.25rem',
      transition: 'border-color 0.2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: '700', color: meta.color, fontSize: '1rem' }}>
              {t(`providers.${provider}.label`)}
            </span>
            {!meta.requiresKey && (
              <span style={{ padding: '0.15rem 0.5rem', borderRadius: '0.375rem', background: 'rgba(74,122,183,0.15)', color: '#4A7AB7', fontSize: '0.7rem', fontWeight: '600' }}>
                {t('providers.default')}
              </span>
            )}
          </div>
          <p style={{ color: '#6C7589', fontSize: '0.8rem', margin: 0, lineHeight: '1.4' }}>
            {t(`providers.${provider}.description`)}
          </p>
        </div>

        {/* Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0, marginLeft: '0.75rem' }}>
          {meta.requiresKey ? (
            isActive && isValid !== false ? (
              <><Wifi style={{ width: '0.875rem', height: '0.875rem', color: '#27AE60' }} />
              <span style={{ color: '#27AE60', fontSize: '0.75rem', fontWeight: '600' }}>{t('providers.connected')}</span></>
            ) : isActive && isValid === false ? (
              <><WifiOff style={{ width: '0.875rem', height: '0.875rem', color: '#E74C3C' }} />
              <span style={{ color: '#E74C3C', fontSize: '0.75rem', fontWeight: '600' }}>{t('providers.invalidKey')}</span></>
            ) : (
              <><WifiOff style={{ width: '0.875rem', height: '0.875rem', color: '#6C7589' }} />
              <span style={{ color: '#6C7589', fontSize: '0.75rem' }}>{t('providers.noKey')}</span></>
            )
          ) : (
            <><Wifi style={{ width: '0.875rem', height: '0.875rem', color: '#27AE60' }} />
            <span style={{ color: '#27AE60', fontSize: '0.75rem', fontWeight: '600' }}>{t('providers.alwaysActive')}</span></>
          )}
        </div>
      </div>

      {meta.requiresKey && (
        <>
          {inSavedMode ? (
            /* SAVED MODE */
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.5rem', padding: '0.5rem 0.875rem',
              }}>
                <Key style={{ width: '0.875rem', height: '0.875rem', color: '#6C7589', flexShrink: 0 }} />
                <span style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '0.85rem', color: '#B8BFCC', flex: 1 }}>
                  {savedKey ? maskKey(savedKey) : t('providers.serverSavedKey')}
                </span>
                {testResult === 'valid' && <CheckCircle2 style={{ width: '0.875rem', height: '0.875rem', color: '#27AE60', flexShrink: 0 }} />}
                {testResult === 'invalid' && <XCircle style={{ width: '0.875rem', height: '0.875rem', color: '#E74C3C', flexShrink: 0 }} />}
              </div>

              {savedKey && (
                <button onClick={handleTest} disabled={testing} style={{
                  padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                  background: 'rgba(74,122,183,0.1)', border: '1px solid rgba(74,122,183,0.3)',
                  color: '#4A7AB7', fontSize: '0.8rem', cursor: testing ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap',
                }}>
                  {testing
                    ? <Loader2 style={{ width: '0.75rem', height: '0.75rem', animation: 'ps-spin 1s linear infinite' }} />
                    : <RefreshCw style={{ width: '0.75rem', height: '0.75rem' }} />
                  }
                  {testing ? t('providers.testing') : t('providers.test')}
                </button>
              )}

              <button onClick={handleReplace} style={{
                padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                background: `${meta.color}12`, border: `1px solid ${meta.color}35`,
                color: meta.color, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                {t('providers.replace')}
              </button>
            </div>
          ) : (
            /* EDIT MODE */
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Key style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '0.875rem', height: '0.875rem', color: '#6C7589' }} />
                  <input
                    type="text"
                    value={keyInput}
                    onChange={e => { setKeyInput(e.target.value); setTestResult(null); }}
                    placeholder={t('providers.keyPlaceholder')}
                    autoComplete="off"
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem',
                      color: '#E8EAF0', padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                      fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'Roboto Mono, monospace',
                    }}
                  />
                </div>

                <button onClick={handleTest} disabled={testing || !keyInput} style={{
                  padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                  background: 'rgba(74,122,183,0.1)', border: '1px solid rgba(74,122,183,0.3)',
                  color: '#4A7AB7', fontSize: '0.8rem',
                  cursor: (testing || !keyInput) ? 'not-allowed' : 'pointer',
                  opacity: !keyInput ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap',
                }}>
                  {testing
                    ? <Loader2 style={{ width: '0.75rem', height: '0.75rem', animation: 'ps-spin 1s linear infinite' }} />
                    : testResult === 'valid'
                    ? <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem', color: '#27AE60' }} />
                    : testResult === 'invalid'
                    ? <XCircle style={{ width: '0.75rem', height: '0.75rem', color: '#E74C3C' }} />
                    : null
                  }
                  {testing ? t('providers.testing') : t('providers.test')}
                </button>
              </div>

              {testResult === 'valid' && (
                <div style={{ color: '#27AE60', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{t('providers.keyValid')}</div>
              )}
              {testResult === 'invalid' && (
                <div style={{ color: '#E74C3C', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{t('providers.keyInvalid')}</div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <a href={meta.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6C7589', fontSize: '0.75rem', textDecoration: 'none' }}>
                    <ExternalLink style={{ width: '0.7rem', height: '0.7rem' }} />
                    {t('providers.getKey')}
                  </a>
                  {replacing && (
                    <button onClick={handleCancelReplace}
                      style={{ background: 'none', border: 'none', color: '#6C7589', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
                      {t('providers.cancel')}
                    </button>
                  )}
                </div>

                <button onClick={handleSave} disabled={saving || !keyInput} style={{
                  padding: '0.4rem 1rem', borderRadius: '0.5rem',
                  background: keyInput ? `${meta.color}18` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${keyInput ? `${meta.color}40` : 'rgba(255,255,255,0.08)'}`,
                  color: keyInput ? meta.color : '#6C7589', fontSize: '0.8rem',
                  cursor: (saving || !keyInput) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                }}>
                  {saving && <Loader2 style={{ width: '0.75rem', height: '0.75rem', animation: 'ps-spin 1s linear infinite' }} />}
                  {saving ? t('providers.saving') : t('providers.save')}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const ProviderSettings = () => {
  const { t } = useTranslation();
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/providers/')
      .then(res => {
        const map = {};
        (res.data || []).forEach(c => { map[c.id || c.provider] = c; });
        setConfigs(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleTest = async (provider, apiKey) => {
    const res = await axiosInstance.post('/providers/test/', { provider, api_key: apiKey });
    return res.data;
  };

  return (
    <div>
      <p style={{ color: '#6C7589', fontSize: '0.8rem', margin: '0 0 1rem' }}>
        {t('providers.subtitle')}
      </p>

      {loading ? (
        <div style={{ color: '#6C7589', fontSize: '0.875rem', padding: '0.5rem 0' }}>{t('providers.loading')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {['yfinance', 'alphavantage', 'finnhub'].map(provider => (
            <ProviderCard key={provider} provider={provider} config={configs[provider]} onTest={handleTest} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes ps-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProviderSettings;
