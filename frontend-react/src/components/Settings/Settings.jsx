import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Moon,
  Sun,
  ChevronRight,
  Check
} from 'lucide-react';
import PremiumCard from '../ui/PremiumCard';
import LanguageSelector from '../Layout/LanguageSelector';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      priceAlerts: false,
      weeklyDigest: true,
    },
    appearance: {
      theme: 'dark',
      compactMode: false,
    },
    privacy: {
      shareAnalytics: true,
      publicProfile: false,
    },
  });

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1rem',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const titleStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '0.5rem',
  };

  const subtitleStyle = {
    fontSize: '1rem',
    color: '#B8BFCC',
  };

  const sectionStyle = {
    marginBottom: '1.5rem',
  };

  const sectionTitleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const settingItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  };

  const settingLabelStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  };

  const settingNameStyle = {
    fontSize: '0.9375rem',
    color: '#FFFFFF',
    fontWeight: '500',
  };

  const settingDescStyle = {
    fontSize: '0.8125rem',
    color: '#8A92A5',
  };

  const toggleStyle = (active) => ({
    width: '48px',
    height: '26px',
    borderRadius: '13px',
    background: active 
      ? 'linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 100%)' 
      : 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
  });

  const toggleKnobStyle = (active) => ({
    position: 'absolute',
    top: '3px',
    left: active ? '25px' : '3px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#FFFFFF',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    transition: 'left 0.2s ease',
  });

  const Toggle = ({ active, onChange }) => (
    <button style={toggleStyle(active)} onClick={onChange}>
      <div style={toggleKnobStyle(active)} />
    </button>
  );

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting],
      }
    }));
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>{t('settings.title')}</h1>
        <p style={subtitleStyle}>{t('settings.subtitle')}</p>
      </div>

      {/* Language Section */}
      <div style={sectionStyle}>
        <PremiumCard borderGradient="linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 100%)">
          <div style={sectionTitleStyle}>
            <Globe style={{ width: '1.25rem', height: '1.25rem', color: '#4A7AB7' }} />
            {t('settings.language')}
          </div>
          
          <div style={settingItemStyle}>
            <div style={settingLabelStyle}>
              <span style={settingNameStyle}>{t('settings.selectLanguage')}</span>
              <span style={settingDescStyle}>{t('settings.languageDesc')}</span>
            </div>
            <LanguageSelector />
          </div>
        </PremiumCard>
      </div>

      {/* Notifications Section */}
      <div style={sectionStyle}>
        <PremiumCard borderGradient="linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 100%)">
          <div style={sectionTitleStyle}>
            <Bell style={{ width: '1.25rem', height: '1.25rem', color: '#4A7AB7' }} />
            {t('settings.notifications')}
          </div>
          
          <div style={settingItemStyle}>
            <div style={settingLabelStyle}>
              <span style={settingNameStyle}>{t('settings.emailAlerts')}</span>
              <span style={settingDescStyle}>{t('settings.emailAlertsDesc')}</span>
            </div>
            <Toggle 
              active={settings.notifications.emailAlerts}
              onChange={() => handleToggle('notifications', 'emailAlerts')}
            />
          </div>

          <div style={settingItemStyle}>
            <div style={settingLabelStyle}>
              <span style={settingNameStyle}>{t('settings.priceAlerts')}</span>
              <span style={settingDescStyle}>{t('settings.priceAlertsDesc')}</span>
            </div>
            <Toggle 
              active={settings.notifications.priceAlerts}
              onChange={() => handleToggle('notifications', 'priceAlerts')}
            />
          </div>

          <div style={{ ...settingItemStyle, borderBottom: 'none' }}>
            <div style={settingLabelStyle}>
              <span style={settingNameStyle}>{t('settings.weeklyDigest')}</span>
              <span style={settingDescStyle}>{t('settings.weeklyDigestDesc')}</span>
            </div>
            <Toggle 
              active={settings.notifications.weeklyDigest}
              onChange={() => handleToggle('notifications', 'weeklyDigest')}
            />
          </div>
        </PremiumCard>
      </div>

      {/* Appearance Section */}
      <div style={sectionStyle}>
        <PremiumCard borderGradient="linear-gradient(90deg, #9B59B6 0%, #8E44AD 100%)">
          <div style={sectionTitleStyle}>
            <Palette style={{ width: '1.25rem', height: '1.25rem', color: '#9B59B6' }} />
            {t('settings.appearance')}
          </div>
          
          <div style={settingItemStyle}>
            <div style={settingLabelStyle}>
              <span style={settingNameStyle}>{t('settings.darkMode')}</span>
              <span style={settingDescStyle}>{t('settings.darkModeDesc')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Moon style={{ width: '1rem', height: '1rem', color: '#4A7AB7' }} />
              <Toggle 
                active={settings.appearance.theme === 'dark'}
                onChange={() => setSettings(prev => ({
                  ...prev,
                  appearance: {
                    ...prev.appearance,
                    theme: prev.appearance.theme === 'dark' ? 'light' : 'dark'
                  }
                }))}
              />
            </div>
          </div>

          <div style={{ ...settingItemStyle, borderBottom: 'none' }}>
            <div style={settingLabelStyle}>
              <span style={settingNameStyle}>{t('settings.compactMode')}</span>
              <span style={settingDescStyle}>{t('settings.compactModeDesc')}</span>
            </div>
            <Toggle 
              active={settings.appearance.compactMode}
              onChange={() => handleToggle('appearance', 'compactMode')}
            />
          </div>
        </PremiumCard>
      </div>

      {/* Privacy Section */}
      <div style={sectionStyle}>
        <PremiumCard borderGradient="linear-gradient(90deg, #27AE60 0%, #2ECC71 100%)">
          <div style={sectionTitleStyle}>
            <Shield style={{ width: '1.25rem', height: '1.25rem', color: '#27AE60' }} />
            {t('settings.privacy')}
          </div>
          
          <div style={settingItemStyle}>
            <div style={settingLabelStyle}>
              <span style={settingNameStyle}>{t('settings.shareAnalytics')}</span>
              <span style={settingDescStyle}>{t('settings.shareAnalyticsDesc')}</span>
            </div>
            <Toggle 
              active={settings.privacy.shareAnalytics}
              onChange={() => handleToggle('privacy', 'shareAnalytics')}
            />
          </div>

          <div style={{ ...settingItemStyle, borderBottom: 'none' }}>
            <div style={settingLabelStyle}>
              <span style={settingNameStyle}>{t('settings.publicProfile')}</span>
              <span style={settingDescStyle}>{t('settings.publicProfileDesc')}</span>
            </div>
            <Toggle 
              active={settings.privacy.publicProfile}
              onChange={() => handleToggle('privacy', 'publicProfile')}
            />
          </div>
        </PremiumCard>
      </div>
    </div>
  );
};

export default Settings;
