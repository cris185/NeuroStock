/**
 * Skeleton Loader Component with shimmer animation
 * Variants: chart, table, card
 */
const SkeletonLoader = ({ variant = 'card', count = 1 }) => {
  const shimmerStyle = {
    background: 'linear-gradient(90deg, rgba(46, 90, 143, 0.05) 0%, rgba(46, 90, 143, 0.15) 20%, rgba(46, 90, 143, 0.05) 40%, rgba(46, 90, 143, 0.05) 100%)',
    backgroundSize: '1000px 100%',
    animation: 'shimmer 2s linear infinite',
    borderRadius: '0.5rem',
  };

  const variants = {
    card: {
      width: '100%',
      height: '200px',
      ...shimmerStyle,
    },
    chart: {
      width: '100%',
      height: '400px',
      ...shimmerStyle,
    },
    table: {
      width: '100%',
      height: '60px',
      ...shimmerStyle,
      marginBottom: '0.5rem',
    },
  };

  const skeletonStyle = variants[variant] || variants.card;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            ...skeletonStyle,
            marginBottom: index < count - 1 ? '1.5rem' : 0,
          }}
        />
      ))}

      {/* Keyframes for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
      `}</style>
    </>
  );
};

export default SkeletonLoader;
