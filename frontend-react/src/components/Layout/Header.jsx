import { useState, useCallback, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Menu } from 'lucide-react';
import { AuthContext } from '../Hooks/AuthProvider';
import { useScrollBehavior } from '../../hooks/useScrollBehavior';
import PremiumButton from '../ui/PremiumButton';
import MobileMenu from './MobileMenu';
import UserMenu from './UserMenu';

/**
 * Premium Header Component with Bloomberg Terminal-inspired design
 * Features: Glassmorphism, scroll detection, mobile menu, user dropdown
 */
const Header = () => {
  // State management
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isScrolled } = useScrollBehavior(20);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handlers
  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    console.log('Logged out successfully');
    navigate('/login');
  }, [navigate, setIsLoggedIn]);

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: isScrolled ? 'rgba(26, 29, 35, 0.95)' : 'rgba(26, 29, 35, 0.80)',
          backdropFilter: isScrolled ? 'blur(20px)' : 'blur(12px)',
          WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'blur(12px)',
          borderBottom: isScrolled ? '1px solid rgba(46, 90, 143, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: isScrolled ? '0 10px 20px rgba(0, 0, 0, 0.5)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <nav style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '5rem',
          }}>
            {/* Logo Section */}
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Logo Icon Container */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.2) 0%, rgba(74, 122, 183, 0.1) 100%)',
                  border: '1px solid rgba(46, 90, 143, 0.3)',
                  transition: 'all 0.3s ease',
                }}
              >
                <TrendingUp
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    color: '#2E5A8F',
                    filter: 'drop-shadow(0 0 6px rgba(46, 90, 143, 0.6))',
                  }}
                />
              </div>

              {/* Logo Text */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    fontFamily: 'Poppins, sans-serif',
                    background: 'linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 50%, #4A7AB7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  NeuroStock
                </span>
                <span style={{
                  fontSize: '0.625rem',
                  color: '#6C7589',
                  marginTop: '-0.25rem',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  Stock Prediction Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
              className="desktop-nav"
            >
              {isLoggedIn ? (
                <>
                  <PremiumButton
                    variant="secondary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Dashboard
                  </PremiumButton>
                  <UserMenu handleLogout={handleLogout} />
                </>
              ) : (
                <>
                  <PremiumButton
                    variant="secondary"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </PremiumButton>
                  <PremiumButton
                    variant="primary"
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </PremiumButton>
                </>
              )}
            </div>

            {/* Mobile Menu Button - Only visible on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                color: '#B8BFCC',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="mobile-menu-btn"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(46, 90, 143, 0.1)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#B8BFCC';
              }}
              aria-label="Open menu"
            >
              <Menu style={{ width: '1.5rem', height: '1.5rem' }} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
      />

      {/* Responsive Styles */}
      <style>{`
        /* Desktop navigation - hidden on mobile */
        .desktop-nav {
          display: flex;
        }

        /* Mobile menu button - hidden on desktop */
        .mobile-menu-btn {
          display: none;
        }

        /* Mobile breakpoint (< 768px) */
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }

          .mobile-menu-btn {
            display: block !important;
          }
        }

        /* Remove all animations from globals that might be affecting text */
        .sp-hero-title * {
          animation: none !important;
        }
      `}</style>
    </>
  );
};

export default Header;
