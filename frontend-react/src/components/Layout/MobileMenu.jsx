import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { X, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Mobile Menu Component with glassmorphic design
 * Uses Headless UI Dialog for accessibility
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Menu open state
 * @param {Function} props.onClose - Close handler
 * @param {boolean} props.isLoggedIn - Authentication state
 * @param {Function} props.handleLogout - Logout handler
 */
const MobileMenu = ({ isOpen, onClose, isLoggedIn, handleLogout }) => {
  const menuItems = isLoggedIn
    ? [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        {
          to: '#',
          icon: LogOut,
          label: 'Logout',
          onClick: handleLogout,
          variant: 'danger',
        },
      ]
    : [
        { to: '/login', icon: LogIn, label: 'Login' },
        { to: '/register', icon: UserPlus, label: 'Register', variant: 'primary' },
      ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        {/* Panel */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-sm">
                  <div className="flex h-full flex-col bg-gray-darker/95 backdrop-blur-xl border-l border-primary/20 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
                      <Dialog.Title className="text-lg font-semibold text-white font-display">
                        Menu
                      </Dialog.Title>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-gray-lighter hover:bg-primary/10 hover:text-white transition-all duration-200"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close menu</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto px-6 py-6">
                      <div className="flex flex-col gap-2">
                        {menuItems.map((item, index) => (
                          <Transition.Child
                            key={item.label}
                            as={Fragment}
                            enter="transition ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4"
                            enterTo="opacity-100 translate-y-0"
                            style={{
                              transitionDelay: `${index * 50}ms`,
                            }}
                          >
                            {item.onClick ? (
                              <button
                                onClick={() => {
                                  item.onClick();
                                  onClose();
                                }}
                                className={cn(
                                  'flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200',
                                  item.variant === 'danger'
                                    ? 'text-error hover:bg-error/10 hover:text-error border border-error/30'
                                    : item.variant === 'primary'
                                    ? 'bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-glow'
                                    : 'text-text-secondary hover:bg-primary/10 hover:text-white'
                                )}
                              >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                              </button>
                            ) : (
                              <Link
                                to={item.to}
                                onClick={onClose}
                                className={cn(
                                  'flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200',
                                  item.variant === 'primary'
                                    ? 'bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-glow'
                                    : 'text-text-secondary hover:bg-primary/10 hover:text-white'
                                )}
                              >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                              </Link>
                            )}
                          </Transition.Child>
                        ))}
                      </div>
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-white/10 px-6 py-4">
                      <p className="text-xs text-text-muted text-center">
                        NeuroStock Portal &copy; {new Date().getFullYear()}
                      </p>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MobileMenu;
