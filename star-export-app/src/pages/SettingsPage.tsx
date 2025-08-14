import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ShieldIcon, SettingsIcon, DatabaseIcon, LinkIcon } from 'lucide-react';
import { useStore } from '../store';
import { useTheme } from '../contexts/ThemeContext';
import { getSupportedPlatforms } from '../config/platforms';
import { PlatformIcon } from '../components/PlatformIcon';

const SettingsPage: React.FC = () => {
  const { tokens, clearAll, removeToken } = useStore();
  const { colors } = useTheme();
  const platforms = getSupportedPlatforms();

  return (
    <div style={{ width: '100%' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: colors.text.primary,
              margin: 0,
              letterSpacing: '-0.025em'
            }}>
              ⚙️ Settings
            </h1>
            <p style={{
              marginTop: '8px',
              fontSize: '16px',
              color: colors.text.muted,
              margin: '8px 0 0 0'
            }}>
              Manage your platform connections and preferences
            </p>
          </div>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              background: colors.primary,
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.3s',
              boxShadow: colors.shadowSm
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = colors.shadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = colors.shadowSm;
            }}
          >
            <ArrowLeftIcon style={{ height: '16px', width: '16px' }} />
            Back to Home
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Authentication Section */}
          <div style={{
            background: colors.surface,
            borderRadius: '20px',
            padding: '32px',
            boxShadow: colors.shadow,
            border: `1px solid ${colors.border}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '120px',
              height: '120px',
              background: `linear-gradient(135deg, ${colors.primarySolid}20, transparent)`,
              borderRadius: '0 20px 0 120px'
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: colors.primary,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LinkIcon style={{ height: '24px', width: '24px', color: 'white' }} />
                </div>
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: colors.text.primary,
                    margin: 0,
                    letterSpacing: '-0.025em'
                  }}>
                    Platform Authentication
                  </h2>
                  <p style={{
                    fontSize: '14px',
                    color: colors.text.muted,
                    margin: '4px 0 0 0'
                  }}>
                    Connect and manage your social media accounts
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {platforms.map((platform) => (
                  <div
                    key={platform.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px',
                      background: colors.backgroundSolid,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '16px',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = colors.shadowSm;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        filter: tokens[platform.name] ? 'none' : 'grayscale(1) opacity(0.5)'
                      }}>
                        <PlatformIcon 
                          icon={platform.icon} 
                          size={32}
                          color={tokens[platform.name] ? colors.primarySolid : colors.text.muted}
                        />
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: colors.text.primary,
                          margin: 0
                        }}>
                          {platform.displayName}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: tokens[platform.name] ? colors.success : colors.text.muted
                          }} />
                          <p style={{
                            fontSize: '14px',
                            color: tokens[platform.name] ? colors.success : colors.text.muted,
                            margin: 0,
                            fontWeight: '500'
                          }}>
                            {tokens[platform.name] ? 'Connected' : 'Not connected'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      {tokens[platform.name] ? (
                        <button
                          onClick={() => removeToken(platform.name)}
                          style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: colors.error,
                            background: 'transparent',
                            border: `1px solid ${colors.error}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.error;
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = colors.error;
                          }}
                        >
                          Disconnect
                        </button>
                      ) : (
                        <Link
                          to={`/auth/${platform.name}`}
                          style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'white',
                            background: colors.primary,
                            borderRadius: '8px',
                            textDecoration: 'none',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          Connect
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {Object.keys(tokens).length > 0 && (
                <div style={{
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: `1px solid ${colors.border}`
                }}>
                  <button
                    onClick={clearAll}
                    style={{
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: colors.error,
                      background: 'transparent',
                      border: `1px solid ${colors.error}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.error;
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = colors.error;
                    }}
                  >
                    Disconnect All Platforms
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Export Settings */}
          <div style={{
            background: colors.surface,
            borderRadius: '20px',
            padding: '32px',
            boxShadow: colors.shadow,
            border: `1px solid ${colors.border}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '120px',
              height: '120px',
              background: `linear-gradient(135deg, ${colors.accent}20, transparent)`,
              borderRadius: '0 20px 0 120px'
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <SettingsIcon style={{ height: '24px', width: '24px', color: 'white' }} />
                </div>
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: colors.text.primary,
                    margin: 0,
                    letterSpacing: '-0.025em'
                  }}>
                    Export Settings
                  </h2>
                  <p style={{
                    fontSize: '14px',
                    color: colors.text.muted,
                    margin: '4px 0 0 0'
                  }}>
                    Configure your export preferences
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.text.primary,
                    marginBottom: '8px'
                  }}>
                    Default Export Format
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: colors.text.primary,
                    background: colors.backgroundSolid,
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primarySolid;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySolid}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '16px',
                    borderRadius: '12px',
                    background: colors.backgroundSolid,
                    border: `1px solid ${colors.border}`,
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.border;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.backgroundSolid;
                  }}
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      style={{
                        width: '20px',
                        height: '20px',
                        accentColor: colors.primarySolid
                      }}
                    />
                    <span style={{
                      fontSize: '14px',
                      color: colors.text.primary,
                      fontWeight: '500'
                    }}>
                      Include metadata in exports
                    </span>
                  </label>
                  
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '16px',
                    borderRadius: '12px',
                    background: colors.backgroundSolid,
                    border: `1px solid ${colors.border}`,
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.border;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.backgroundSolid;
                  }}
                  >
                    <input
                      type="checkbox"
                      style={{
                        width: '20px',
                        height: '20px',
                        accentColor: colors.primarySolid
                      }}
                    />
                    <span style={{
                      fontSize: '14px',
                      color: colors.text.primary,
                      fontWeight: '500'
                    }}>
                      Auto-download completed exports
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Data */}
          <div style={{
            background: colors.surface,
            borderRadius: '20px',
            padding: '32px',
            boxShadow: colors.shadow,
            border: `1px solid ${colors.border}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '120px',
              height: '120px',
              background: `linear-gradient(135deg, ${colors.success}20, transparent)`,
              borderRadius: '0 20px 0 120px'
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: `linear-gradient(135deg, ${colors.success}, ${colors.success}CC)`,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldIcon style={{ height: '24px', width: '24px', color: 'white' }} />
                </div>
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: colors.text.primary,
                    margin: 0,
                    letterSpacing: '-0.025em'
                  }}>
                    Privacy & Data
                  </h2>
                  <p style={{
                    fontSize: '14px',
                    color: colors.text.muted,
                    margin: '4px 0 0 0'
                  }}>
                    Control how your data is stored and managed
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '16px',
                  borderRadius: '12px',
                  background: colors.backgroundSolid,
                  border: `1px solid ${colors.border}`,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.backgroundSolid;
                }}
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: colors.primarySolid
                    }}
                  />
                  <div>
                    <span style={{
                      fontSize: '14px',
                      color: colors.text.primary,
                      fontWeight: '500',
                      display: 'block'
                    }}>
                      Store authentication tokens locally
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: colors.text.muted,
                      marginTop: '4px',
                      display: 'block'
                    }}>
                      Keep your login sessions active across browser restarts
                    </span>
                  </div>
                </label>
                
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '16px',
                  borderRadius: '12px',
                  background: colors.backgroundSolid,
                  border: `1px solid ${colors.border}`,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.backgroundSolid;
                }}
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: colors.primarySolid
                    }}
                  />
                  <div>
                    <span style={{
                      fontSize: '14px',
                      color: colors.text.primary,
                      fontWeight: '500',
                      display: 'block'
                    }}>
                      Keep export history
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: colors.text.muted,
                      marginTop: '4px',
                      display: 'block'
                    }}>
                      Maintain a record of your past exports for easy access
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;