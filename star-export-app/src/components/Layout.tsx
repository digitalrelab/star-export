import React, { memo, ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  DownloadIcon, 
  HistoryIcon, 
  SettingsIcon, 
  LogOutIcon,
  BellIcon,
  UserIcon,
  MenuIcon,
  SunIcon,
  MoonIcon,
  HelpCircleIcon
} from 'lucide-react';
import { useStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

interface NavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = memo(({ to, icon: Icon, label, isActive }) => {
  const { colors } = useTheme();
  
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isActive ? colors.primary : 'transparent',
        color: isActive ? colors.text.inverse : colors.text.secondary,
        transform: isActive ? 'translateX(4px)' : 'translateX(0)',
        boxShadow: isActive ? colors.shadowSm : 'none',
        marginBottom: '4px',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = colors.border;
          e.currentTarget.style.transform = 'translateX(2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.transform = 'translateX(0)';
        }
      }}
    >
      <Icon style={{ 
        marginRight: '12px', 
        height: '20px', 
        width: '20px',
        color: isActive ? colors.text.inverse : colors.text.muted
      }} />
      {label}
    </Link>
  );
});

NavItem.displayName = 'NavItem';

const NotificationBadge: React.FC = memo(() => {
  const { notifications } = useStore();
  const { colors } = useTheme();
  const unreadCount = notifications.length;

  if (unreadCount === 0) return null;

  return (
    <span style={{
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      backgroundColor: colors.error,
      color: 'white',
      fontSize: '12px',
      borderRadius: '50%',
      height: '20px',
      width: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
});

NotificationBadge.displayName = 'NotificationBadge';

export const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  const location = useLocation();
  const { authState, logout } = useAuth();
  const { notifications, removeNotification } = useStore();
  const { colors, theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Export', href: '/export', icon: DownloadIcon },
    { name: 'History', href: '/history', icon: HistoryIcon },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
    { name: 'Help', href: '/help', icon: HelpCircleIcon },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const handleNotificationClick = (notificationId: string) => {
    removeNotification(notificationId);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: colors.backgroundSolid,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{ 
        width: '280px', 
        background: colors.surface,
        boxShadow: colors.shadow,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '0 24px 24px 0',
        overflow: 'hidden',
        zIndex: 10
      }}>
        {/* Logo */}
        <div style={{ 
          height: '80px', 
          background: colors.primary,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '0 24px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }} />
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '800', 
            color: 'white', 
            margin: 0,
            letterSpacing: '-0.025em',
            position: 'relative',
            zIndex: 1
          }}>
            ⭐ StarExport
          </h1>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '24px 20px' }}>
          <div style={{ 
            marginBottom: '24px'
          }}>
            <p style={{
              fontSize: '12px',
              fontWeight: '600',
              color: colors.text.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 12px 16px'
            }}>
              Main Menu
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navigation.map((item) => (
                <NavItem
                  key={item.name}
                  to={item.href}
                  icon={item.icon}
                  label={item.name}
                  isActive={location.pathname === item.href}
                />
              ))}
            </div>
          </div>
        </nav>

        {/* User section */}
        <div style={{ 
          padding: '20px',
          borderTop: `1px solid ${colors.border}`,
          background: `linear-gradient(135deg, ${colors.border}40, transparent)`
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            background: colors.surfaceElevated,
            padding: '16px',
            borderRadius: '16px',
            boxShadow: colors.shadowSm
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserIcon style={{ height: '20px', width: '20px', color: 'white' }} />
            </div>
            <div style={{ marginLeft: '12px', flex: 1 }}>
              <p style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: colors.text.primary, 
                margin: 0,
                lineHeight: 1.2
              }}>
                User Account
              </p>
              <p style={{ 
                fontSize: '12px', 
                color: colors.text.muted, 
                margin: 0,
                lineHeight: 1.2
              }}>
                {authState.isAuthenticated ? '🟢 Connected' : '🔴 Not connected'}
              </p>
            </div>
            {authState.isAuthenticated && (
              <button
                onClick={handleLogout}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: colors.text.muted, 
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
                title="Logout"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <LogOutIcon style={{ height: '16px', width: '16px' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '-24px' }}>
        {/* Top bar */}
        <div style={{ 
          height: '80px',
          background: colors.surface,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          borderRadius: '24px 0 0 0',
          boxShadow: colors.shadowSm,
          zIndex: 5
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: colors.text.primary,
              margin: 0,
              letterSpacing: '-0.025em'
            }}>
              Welcome back! 👋
            </h2>
            <p style={{
              fontSize: '14px',
              color: colors.text.muted,
              margin: 0,
              marginTop: '2px'
            }}>
              Manage your social media exports
            </p>
          </div>
          
          {/* Right side actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                padding: '12px',
                color: colors.text.muted,
                background: colors.backgroundSolid,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                boxShadow: colors.shadowSm
              }}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = colors.shadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = colors.shadowSm;
              }}
            >
              {theme === 'light' ? 
                <MoonIcon style={{ height: '20px', width: '20px' }} /> : 
                <SunIcon style={{ height: '20px', width: '20px' }} />
              }
            </button>
            
            {/* Notifications */}
            <div ref={notificationsRef} style={{ position: 'relative' }}>
              <button
                onClick={toggleNotifications}
                style={{
                  position: 'relative',
                  padding: '12px',
                  color: colors.text.muted,
                  background: colors.backgroundSolid,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: colors.shadowSm
                }}
                title="Notifications"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = colors.shadow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = colors.shadowSm;
                }}
              >
                <BellIcon style={{ height: '20px', width: '20px' }} />
                <NotificationBadge />
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '320px',
                  maxHeight: '400px',
                  backgroundColor: colors.surface,
                  borderRadius: '16px',
                  boxShadow: colors.shadow,
                  border: `1px solid ${colors.border}`,
                  overflow: 'hidden',
                  zIndex: 1000
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${colors.border}`,
                    backgroundColor: colors.surfaceElevated
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: colors.text.primary,
                        margin: 0
                      }}>
                        Notifications
                      </h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => {
                            notifications.forEach(n => removeNotification(n.id));
                          }}
                          style={{
                            fontSize: '12px',
                            color: colors.text.muted,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.border;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{
                    maxHeight: '320px',
                    overflowY: 'auto',
                    padding: notifications.length === 0 ? '40px 20px' : '0'
                  }}>
                    {notifications.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        color: colors.text.muted,
                        fontSize: '14px'
                      }}>
                        <BellIcon style={{ 
                          height: '24px', 
                          width: '24px', 
                          margin: '0 auto 8px',
                          opacity: 0.5 
                        }} />
                        <p style={{ margin: 0 }}>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          style={{
                            padding: '16px 20px',
                            borderBottom: `1px solid ${colors.border}`,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleNotificationClick(notification.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.border;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 
                              notification.type === 'error' ? colors.error :
                              notification.type === 'success' ? '#22c55e' :
                              notification.type === 'warning' ? '#f59e0b' :
                              colors.primary,
                            marginTop: '6px',
                            flexShrink: 0
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: '14px',
                              color: colors.text.primary,
                              margin: '0 0 4px 0',
                              lineHeight: 1.4
                            }}>
                              {notification.message}
                            </p>
                            <p style={{
                              fontSize: '12px',
                              color: colors.text.muted,
                              margin: 0
                            }}>
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: colors.text.muted,
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              fontSize: '14px',
                              flexShrink: 0
                            }}
                            title="Dismiss"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.border;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main style={{ 
          flex: 1, 
          overflow: 'auto',
          padding: '32px',
          background: colors.backgroundSolid,
          borderRadius: '24px 0 0 0',
          marginTop: '-24px',
          paddingTop: '48px'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%'
          }}>
            {children}
          </div>
        </main>
      </div>

      {/* Loading overlay for auth operations */}
      {authState.isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(75, 85, 99, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '2px solid #2563eb',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '12px'
              }} />
              <p style={{ color: '#111827', margin: 0 }}>Authenticating...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error toast for auth errors */}
      {authState.error && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex' }}>
              <div style={{ marginRight: '12px' }}>
                <div style={{ height: '20px', width: '20px', color: '#f87171' }}>×</div>
              </div>
              <div>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#991b1b', 
                  margin: '0 0 4px 0' 
                }}>
                  Authentication Error
                </h3>
                <div style={{ fontSize: '14px', color: '#b91c1c', margin: 0 }}>
                  {authState.error}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;