/**
 * Premium Metric Card Component
 * Displays individual metrics with visual hierarchy and color-coded status
 */
const MetricCard = ({ icon: Icon, name, value, description, interpretation, status = 'info' }) => {
  const statusColors = {
    success: {
      iconBg: 'linear-gradient(135deg, rgba(39, 174, 96, 0.15) 0%, rgba(11, 83, 69, 0.1) 100%)',
      iconColor: '#27AE60',
      border: 'rgba(39, 174, 96, 0.3)',
      badgeBg: 'rgba(39, 174, 96, 0.15)',
      badgeColor: '#27AE60',
      badgeBorder: 'rgba(39, 174, 96, 0.3)',
    },
    warning: {
      iconBg: 'linear-gradient(135deg, rgba(243, 156, 18, 0.15) 0%, rgba(241, 196, 15, 0.1) 100%)',
      iconColor: '#F39C12',
      border: 'rgba(243, 156, 18, 0.3)',
      badgeBg: 'rgba(241, 196, 15, 0.15)',
      badgeColor: '#F39C12',
      badgeBorder: 'rgba(241, 196, 15, 0.3)',
    },
    info: {
      iconBg: 'linear-gradient(135deg, rgba(52, 152, 219, 0.15) 0%, rgba(41, 128, 185, 0.1) 100%)',
      iconColor: '#3498DB',
      border: 'rgba(52, 152, 219, 0.3)',
      badgeBg: 'rgba(52, 152, 219, 0.15)',
      badgeColor: '#3498DB',
      badgeBorder: 'rgba(52, 152, 219, 0.3)',
    },
  };

  const colors = statusColors[status];

  const cardStyle = {
    position: 'relative',
    background: 'rgba(37, 41, 50, 0.4)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    padding: '1.5rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
  };

  const iconContainerStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: colors.iconBg,
    border: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  };

  const nameStyle = {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#8A92A5',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  };

  const valueStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: colors.iconColor,
    fontFamily: 'Roboto Mono, monospace',
    lineHeight: '1',
    marginBottom: '0.75rem',
  };

  const descriptionStyle = {
    fontSize: '0.875rem',
    color: '#B8BFCC',
    marginBottom: '1rem',
    lineHeight: '1.5',
  };

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.375rem 0.75rem',
    borderRadius: '9999px',
    background: colors.badgeBg,
    border: `1px solid ${colors.badgeBorder}`,
    fontSize: '0.75rem',
    fontWeight: '600',
    color: colors.badgeColor,
  };

  return (
    <div style={cardStyle}>
      {/* Icon */}
      <div style={iconContainerStyle}>
        <Icon style={{ width: '1.5rem', height: '1.5rem', color: colors.iconColor }} />
      </div>

      {/* Metric name */}
      <div style={nameStyle}>{name}</div>

      {/* Value */}
      <div style={valueStyle}>{value}</div>

      {/* Description */}
      <div style={descriptionStyle}>{description}</div>

      {/* Interpretation badge */}
      <div style={badgeStyle}>{interpretation}</div>

      {/* Decorative gradient line at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${colors.iconColor}00 0%, ${colors.iconColor} 50%, ${colors.iconColor}00 100%)`,
        }}
      />
    </div>
  );
};

export default MetricCard;
