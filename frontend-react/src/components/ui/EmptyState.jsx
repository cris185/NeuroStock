import { TrendingUp } from 'lucide-react';

/**
 * Empty State Component
 * Displays when no prediction data is available
 */
const EmptyState = ({ onTickerSelect }) => {
  const popularTickers = ['AAPL', 'TSLA', 'GOOGL', 'MSFT'];

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
  };

  const iconContainerStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(46, 90, 143, 0.1) 0%, rgba(46, 90, 143, 0.05) 100%)',
    border: '2px solid rgba(46, 90, 143, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  };

  const headingStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '0.5rem',
    fontFamily: 'Poppins, sans-serif',
  };

  const subtitleStyle = {
    fontSize: '1rem',
    color: '#B8BFCC',
    marginBottom: '2rem',
  };

  const chipContainerStyle = {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const chipStyle = {
    padding: '0.5rem 1rem',
    background: 'rgba(46, 90, 143, 0.1)',
    border: '1px solid rgba(46, 90, 143, 0.2)',
    borderRadius: '0.5rem',
    color: '#4A7AB7',
    fontFamily: 'Roboto Mono, monospace',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const handleChipClick = (ticker) => {
    if (onTickerSelect) {
      onTickerSelect(ticker);
    }
  };

  const handleChipMouseEnter = (e) => {
    e.currentTarget.style.background = 'rgba(46, 90, 143, 0.2)';
    e.currentTarget.style.borderColor = '#4A7AB7';
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(46, 90, 143, 0.2)';
  };

  const handleChipMouseLeave = (e) => {
    e.currentTarget.style.background = 'rgba(46, 90, 143, 0.1)';
    e.currentTarget.style.borderColor = 'rgba(46, 90, 143, 0.2)';
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={containerStyle}>
      <div style={iconContainerStyle}>
        <TrendingUp
          style={{
            width: '2.5rem',
            height: '2.5rem',
            color: '#2E5A8F',
          }}
        />
      </div>

      <h3 style={headingStyle}>No hay predicciones aún</h3>
      <p style={subtitleStyle}>Busca un ticker para comenzar el análisis</p>

      <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#8A92A5', fontWeight: '500' }}>
          Prueba con:
        </span>
      </div>

      <div style={chipContainerStyle}>
        {popularTickers.map((ticker) => (
          <button
            key={ticker}
            type="button"
            style={chipStyle}
            onClick={() => handleChipClick(ticker)}
            onMouseEnter={handleChipMouseEnter}
            onMouseLeave={handleChipMouseLeave}
          >
            {ticker}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
