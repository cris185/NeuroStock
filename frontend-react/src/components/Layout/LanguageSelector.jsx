import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  }
];

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.5rem',
          background: 'rgba(46, 90, 143, 0.1)',
          border: '1px solid rgba(46, 90, 143, 0.3)',
          color: '#B8BFCC',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '0.875rem',
          fontFamily: 'Inter, sans-serif',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(46, 90, 143, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(46, 90, 143, 0.5)';
          e.currentTarget.style.color = '#FFFFFF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(46, 90, 143, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(46, 90, 143, 0.3)';
          e.currentTarget.style.color = '#B8BFCC';
        }}
        aria-label={t('languageSelector.language')}
      >
        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{currentLanguage.flag}</span>
        <ChevronDown 
          style={{ 
            width: '1rem', 
            height: '1rem',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            minWidth: '140px',
            backgroundColor: 'rgba(26, 29, 35, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(46, 90, 143, 0.3)',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            zIndex: 100,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.75rem 1rem',
                background: lang.code === i18n.language ? 'rgba(46, 90, 143, 0.2)' : 'transparent',
                border: 'none',
                color: lang.code === i18n.language ? '#4A7AB7' : '#B8BFCC',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontSize: '0.875rem',
                fontFamily: 'Inter, sans-serif',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (lang.code !== i18n.language) {
                  e.currentTarget.style.backgroundColor = 'rgba(46, 90, 143, 0.1)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (lang.code !== i18n.language) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#B8BFCC';
                }
              }}
            >
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;
