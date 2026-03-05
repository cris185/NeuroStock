import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Shield, Palette, Globe, Database } from 'lucide-react';
import PremiumCard from '../ui/PremiumCard';
import LanguageSelector from '../Layout/LanguageSelector';
import ProviderSettings from '../providers/ProviderSettings';

/* ─── Toggle ─────────────────────────────────────────────────────── */
const Toggle = ({ active, onChange }) => (
  <button
    onClick={onChange}
    style={{
      width: '48px', height: '26px', borderRadius: '13px',
      background: active ? 'linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 100%)' : 'rgba(255,255,255,0.1)',
      border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s ease', flexShrink: 0,
    }}
  >
    <div style={{
      position: 'absolute', top: '3px', left: active ? '25px' : '3px',
      width: '20px', height: '20px', borderRadius: '50%',
      background: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s ease',
    }} />
  </button>
);

/* ─── Section card ───────────────────────────────────────────────── */
const Section = ({ icon: Icon, iconColor, title, gradient, children }) => (
  <PremiumCard borderGradient={gradient}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      fontSize: '1rem', fontWeight: '600', color: '#FFFFFF',
      marginBottom: '1rem', paddingBottom: '0.75rem',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    }}>
      <Icon style={{ width: '1.125rem', height: '1.125rem', color: iconColor, flexShrink: 0 }} />
      {title}
    </div>
    {children}
  </PremiumCard>
);

/* ─── Toggle row ─────────────────────────────────────────────────── */
const ToggleRow = ({ label, desc, active, onChange, last }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.875rem 0',
    borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)',
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingRight: '1rem' }}>
      <span style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: '500' }}>{label}</span>
      <span style={{ fontSize: '0.8rem', color: '#8A92A5' }}>{desc}</span>
    </div>
    <Toggle active={active} onChange={onChange} />
  </div>
);

/* ─── Main ───────────────────────────────────────────────────────── */
const Settings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    notifications: { emailAlerts: true, priceAlerts: false, weeklyDigest: true },
    appearance: { theme: 'dark', compactMode: false },
    privacy: { shareAnalytics: true, publicProfile: false },
  });

  const handleToggle = (category, key) =>
    setSettings(prev => ({ ...prev, [category]: { ...prev[category], [key]: !prev[category][key] } }));

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2.25rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '0.5rem' }}>
          {t('settings.title')}
        </h1>
        <p style={{ fontSize: '1rem', color: '#B8BFCC' }}>{t('settings.subtitle')}</p>
      </div>

      {/* Row 1: Language + Appearance (2 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }} className="settings-grid">
        <Section icon={Globe} iconColor="#4A7AB7" title={t('settings.language')} gradient="linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 100%)">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: '500' }}>{t('settings.selectLanguage')}</span>
              <span style={{ fontSize: '0.8rem', color: '#8A92A5' }}>{t('settings.languageDesc')}</span>
            </div>
            <LanguageSelector />
          </div>
        </Section>

        <Section icon={Palette} iconColor="#9B59B6" title={t('settings.appearance')} gradient="linear-gradient(90deg, #9B59B6 0%, #8E44AD 100%)">
          <ToggleRow
            label={t('settings.darkMode')}
            desc={t('settings.darkModeDesc')}
            active={settings.appearance.theme === 'dark'}
            onChange={() => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, theme: prev.appearance.theme === 'dark' ? 'light' : 'dark' } }))}
          />
          <ToggleRow
            label={t('settings.compactMode')}
            desc={t('settings.compactModeDesc')}
            active={settings.appearance.compactMode}
            onChange={() => handleToggle('appearance', 'compactMode')}
            last
          />
        </Section>
      </div>

      {/* Row 2: Notifications + Privacy (2 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }} className="settings-grid">
        <Section icon={Bell} iconColor="#4A7AB7" title={t('settings.notifications')} gradient="linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 100%)">
          <ToggleRow label={t('settings.emailAlerts')} desc={t('settings.emailAlertsDesc')} active={settings.notifications.emailAlerts} onChange={() => handleToggle('notifications', 'emailAlerts')} />
          <ToggleRow label={t('settings.priceAlerts')} desc={t('settings.priceAlertsDesc')} active={settings.notifications.priceAlerts} onChange={() => handleToggle('notifications', 'priceAlerts')} />
          <ToggleRow label={t('settings.weeklyDigest')} desc={t('settings.weeklyDigestDesc')} active={settings.notifications.weeklyDigest} onChange={() => handleToggle('notifications', 'weeklyDigest')} last />
        </Section>

        <Section icon={Shield} iconColor="#27AE60" title={t('settings.privacy')} gradient="linear-gradient(90deg, #27AE60 0%, #2ECC71 100%)">
          <ToggleRow label={t('settings.shareAnalytics')} desc={t('settings.shareAnalyticsDesc')} active={settings.privacy.shareAnalytics} onChange={() => handleToggle('privacy', 'shareAnalytics')} />
          <ToggleRow label={t('settings.publicProfile')} desc={t('settings.publicProfileDesc')} active={settings.privacy.publicProfile} onChange={() => handleToggle('privacy', 'publicProfile')} last />
        </Section>
      </div>

      {/* Row 3: Providers (full width) */}
      <Section icon={Database} iconColor="#F39C12" title={t('settings.providers')} gradient="linear-gradient(90deg, #F39C12 0%, #E67E22 100%)">
        <ProviderSettings />
      </Section>

      <style>{`
        @media (max-width: 767px) {
          .settings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Settings;
