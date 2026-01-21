import { forwardRef } from 'react';

/**
 * Premium Button Component with sophisticated interactions
 * Variants: primary (gradient shimmer), secondary (glassmorphic), danger (glow)
 */
const PremiumButton = forwardRef(
  (
    {
      variant = 'primary',
      children,
      icon: Icon,
      className = '',
      loading = false,
      style = {},
      ...props
    },
    ref
  ) => {
    const baseStyle = {
      position: 'relative',
      padding: '0.625rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      fontSize: '0.875rem',
      transition: 'all 0.3s ease',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.5 : 1,
      border: 'none',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    };

    const variantStyles = {
      primary: {
        background: 'linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(46, 90, 143, 0.5)',
        boxShadow: '0 0 0 rgba(30, 58, 95, 0)',
      },
      secondary: {
        background: 'transparent',
        color: '#2E5A8F',
        border: '2px solid rgba(46, 90, 143, 0.5)',
        backdropFilter: 'blur(4px)',
      },
      danger: {
        background: 'transparent',
        color: '#E74C3C',
        border: '1px solid rgba(231, 76, 60, 0.5)',
      },
    };

    const handleMouseEnter = (e) => {
      if (loading) return;

      if (variant === 'primary') {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(30, 58, 95, 0.5)';
      } else if (variant === 'secondary') {
        e.currentTarget.style.background = 'linear-gradient(90deg, rgba(30, 58, 95, 0.2) 0%, rgba(46, 90, 143, 0.2) 100%)';
        e.currentTarget.style.color = '#FFFFFF';
        e.currentTarget.style.borderColor = '#2E5A8F';
        e.currentTarget.style.transform = 'translateY(-2px)';
      } else if (variant === 'danger') {
        e.currentTarget.style.background = '#E74C3C';
        e.currentTarget.style.color = '#FFFFFF';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(231, 76, 60, 0.3)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }
    };

    const handleMouseLeave = (e) => {
      if (loading) return;

      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow || 'none';

      if (variant === 'secondary') {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#2E5A8F';
        e.currentTarget.style.borderColor = 'rgba(46, 90, 143, 0.5)';
      } else if (variant === 'danger') {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#E74C3C';
      }
    };

    const handleMouseDown = (e) => {
      if (loading) return;
      e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
    };

    const handleMouseUp = (e) => {
      if (loading) return;
      e.currentTarget.style.transform = 'translateY(-2px) scale(1)';
    };

    return (
      <button
        ref={ref}
        style={{
          ...baseStyle,
          ...variantStyles[variant],
          ...style,
        }}
        className={className}
        disabled={loading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...props}
      >
        {/* Shimmer effect for primary variant */}
        {variant === 'primary' && !loading && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              transform: 'translateX(-100%)',
              animation: 'shimmer 3s infinite',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Button content */}
        <span style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}>
          {loading ? (
            <>
              <svg
                style={{
                  width: '1rem',
                  height: '1rem',
                  animation: 'spin 1s linear infinite',
                }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  style={{ opacity: 0.25 }}
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  style={{ opacity: 0.75 }}
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading...</span>
            </>
          ) : (
            <>
              {Icon && <Icon style={{ width: '1rem', height: '1rem' }} />}
              {children}
            </>
          )}
        </span>

        {/* Add keyframes for animations */}
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </button>
    );
  }
);

PremiumButton.displayName = 'PremiumButton';

export default PremiumButton;
