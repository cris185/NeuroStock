import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, LayoutDashboard, User, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * User Menu Dropdown Component
 * Uses Radix UI for accessible dropdown with glassmorphic design
 */
const UserMenu = ({ handleLogout }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            background: 'rgba(37, 41, 50, 0.5)',
            border: '1px solid rgba(46, 90, 143, 0.2)',
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(46, 90, 143, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(46, 90, 143, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(37, 41, 50, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(46, 90, 143, 0.2)';
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2rem',
            height: '2rem',
            borderRadius: '9999px',
            background: 'linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 100%)',
          }}>
            <User style={{ width: '1rem', height: '1rem', color: '#FFFFFF' }} />
          </div>
          <ChevronDown style={{ width: '1rem', height: '1rem', color: '#B8BFCC' }} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          style={{
            minWidth: '240px',
            background: 'rgba(37, 41, 50, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(46, 90, 143, 0.2)',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
          }}
          sideOffset={8}
          align="end"
        >
          {/* User info section */}
          <div style={{
            padding: '0.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '0.5rem',
          }}>
            <p style={{
              fontWeight: '600',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              margin: 0,
            }}>User</p>
            <p style={{
              fontSize: '0.75rem',
              color: '#8A92A5',
              margin: 0,
            }}>user@neurostock.com</p>
          </div>

          {/* Dashboard */}
          <DropdownMenu.Item asChild>
            <Link
              to="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                color: '#B8BFCC',
                fontSize: '0.875rem',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(46, 90, 143, 0.2)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#B8BFCC';
              }}
            >
              <LayoutDashboard style={{ width: '1rem', height: '1rem' }} />
              <span>Dashboard</span>
            </Link>
          </DropdownMenu.Item>

          {/* Profile */}
          <DropdownMenu.Item asChild>
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                color: '#B8BFCC',
                fontSize: '0.875rem',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(46, 90, 143, 0.2)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#B8BFCC';
              }}
            >
              <User style={{ width: '1rem', height: '1rem' }} />
              <span>Profile</span>
            </Link>
          </DropdownMenu.Item>

          {/* Settings */}
          <DropdownMenu.Item asChild>
            <Link
              to="/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                color: '#B8BFCC',
                fontSize: '0.875rem',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(46, 90, 143, 0.2)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#B8BFCC';
              }}
            >
              <Settings style={{ width: '1rem', height: '1rem' }} />
              <span>Settings</span>
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator style={{
            height: '1px',
            background: 'rgba(255, 255, 255, 0.1)',
            margin: '0.5rem 0',
          }} />

          {/* Logout */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#B8BFCC',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(231, 76, 60, 0.2)';
                e.currentTarget.style.color = '#E74C3C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#B8BFCC';
              }}
            >
              <LogOut style={{ width: '1rem', height: '1rem' }} />
              <span>Logout</span>
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default UserMenu;
