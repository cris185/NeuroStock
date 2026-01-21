import { useState } from 'react';

/**
 * Premium Card Component with glassmorphism and sophisticated interactions
 * Features: backdrop-blur, gradient borders, hover lift animation
 */
const PremiumCard = ({
  children,
  hoverable = true,
  borderGradient = null,
  style = {},
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = {
    position: 'relative',
    background: 'rgba(37, 41, 50, 0.5)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(46, 90, 143, 0.2)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
  };

  const hoverStyle = hoverable ? {
    transform: 'translateY(-4px)',
    borderColor: 'rgba(46, 90, 143, 0.4)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(46, 90, 143, 0.1)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  } : {};

  const handleMouseEnter = () => {
    if (hoverable) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverable) setIsHovered(false);
  };

  return (
    <div
      style={{
        ...baseStyle,
        ...(isHovered ? hoverStyle : {}),
        ...style,
      }}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Optional gradient border */}
      {borderGradient && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: borderGradient,
            borderRadius: '0.75rem 0.75rem 0 0',
          }}
        />
      )}

      {children}
    </div>
  );
};

export default PremiumCard;
