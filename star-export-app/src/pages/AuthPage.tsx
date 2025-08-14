import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, KeyIcon, InfoIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { getPlatformConfig } from '../config/platforms';
import { useStore } from '../store';
import { useTheme } from '../contexts/ThemeContext';
import { PlatformIcon } from '../components/PlatformIcon';

const AuthPage: React.FC = () => {
  const { platform: platformName } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  const { setToken, addNotification } = useStore();
  
  const platform = platformName ? getPlatformConfig(platformName) : null;
  const [token, setTokenInput] = React.useState('');
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [showToken, setShowToken] = React.useState(false);
  const { colors } = useTheme();

  const handleConnect = async () => {
    if (!platform || !token.trim()) return;

    setIsConnecting(true);
    
    // Simulate authentication process
    setTimeout(() => {
      setToken(platform.name, token.trim());
      addNotification({
        type: 'success',
        message: `Successfully connected to ${platform.displayName}!`,
      });
      setIsConnecting(false);
      navigate('/settings');
    }, 1500);
  };

  if (!platform) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.backgroundSolid,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: colors.surface,
          borderRadius: '20px',
          padding: '32px',
          boxShadow: colors.shadow,
          border: `1px solid ${colors.border}`,
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            ❌
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.text.primary,
            margin: '0 0 16px 0'
          }}>
            Platform not found
          </h1>
          <Link
            to="/settings"
            style={{
              display: 'inline-flex',
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
            Go back to settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.backgroundSolid,
      padding: '32px 16px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Link
            to="/settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              background: colors.surface,
              color: colors.text.secondary,
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.3s',
              boxShadow: colors.shadowSm,
              border: `1px solid ${colors.border}`
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
            Back to Settings
          </Link>
        </div>

        {/* Main Card */}
        <div style={{
          background: colors.surface,
          borderRadius: '20px',
          padding: '40px',
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
            width: '150px',
            height: '150px',
            background: `linear-gradient(135deg, ${colors.primarySolid}20, transparent)`,
            borderRadius: '0 20px 0 150px'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Platform Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <div style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <PlatformIcon 
                  icon={platform.icon} 
                  size={72}
                  color={colors.primarySolid}
                />
              </div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '800',
                color: colors.text.primary,
                margin: '0 0 12px 0',
                letterSpacing: '-0.025em'
              }}>
                Connect to {platform.displayName}
              </h1>
              <p style={{
                fontSize: '16px',
                color: colors.text.muted,
                margin: 0,
                lineHeight: 1.5
              }}>
                Enter your {platform.displayName} access token to continue
              </p>
            </div>

            {/* Token Input Section */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <KeyIcon style={{
                  height: '20px',
                  width: '20px',
                  color: colors.text.muted
                }} />
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.text.primary
                }}>
                  Access Token
                </label>
              </div>
              
              <div style={{ position: 'relative' }}>
                <input
                  type={showToken ? "text" : "password"}
                  value={token}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder={`Enter your ${platform.displayName} token`}
                  style={{
                    width: '100%',
                    padding: '16px 50px 16px 16px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: colors.text.primary,
                    background: colors.backgroundSolid,
                    outline: 'none',
                    transition: 'all 0.3s',
                    fontFamily: 'monospace'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primarySolid;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySolid}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: colors.text.muted,
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.border;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {showToken ? (
                    <EyeOffIcon style={{ height: '18px', width: '18px' }} />
                  ) : (
                    <EyeIcon style={{ height: '18px', width: '18px' }} />
                  )}
                </button>
              </div>
              
              <p style={{
                marginTop: '8px',
                fontSize: '12px',
                color: colors.text.muted,
                margin: '8px 0 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: colors.success,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px'
                }}>
                  🔒
                </div>
                Your token will be stored securely in your browser's local storage
              </p>
            </div>

            {/* Instructions Card */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.primarySolid}08, ${colors.accent}08)`,
              border: `1px solid ${colors.primarySolid}20`,
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '60px',
                height: '60px',
                background: `${colors.primarySolid}10`,
                borderRadius: '50%'
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <InfoIcon style={{
                    height: '20px',
                    width: '20px',
                    color: colors.primarySolid
                  }} />
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.text.primary,
                    margin: 0
                  }}>
                    How to get your token:
                  </h3>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {platform.name === 'github' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>1</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Go to GitHub Settings → Developer settings
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>2</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Click "Personal access tokens" → "Tokens (classic)"
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>3</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Generate new token with 'repo' and 'user' scopes
                        </span>
                      </div>
                    </>
                  )}
                  {platform.name === 'facebook' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>1</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Go to Facebook Developer Portal
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>2</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Create a new app and configure Graph API
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>3</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Generate access token with required permissions
                        </span>
                      </div>
                    </>
                  )}
                  {platform.name === 'twitter' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>1</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Go to Twitter Developer Portal
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>2</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Create a new app or use existing one
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>3</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Generate Bearer token from app settings
                        </span>
                      </div>
                    </>
                  )}
                  {platform.name === 'reddit' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>1</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Go to Reddit App Preferences
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>2</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Create a new application (script type)
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>3</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Use the generated client ID and secret
                        </span>
                      </div>
                    </>
                  )}
                  {platform.name === 'youtube' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>1</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Go to Google Cloud Console
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>2</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Enable YouTube Data API v3
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'white',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>3</div>
                        <span style={{ fontSize: '14px', color: colors.text.secondary }}>
                          Create API credentials (API key)
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Link
                to="/settings"
                style={{
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.text.muted,
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.border;
                  e.currentTarget.style.color = colors.text.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.text.muted;
                }}
              >
                Cancel
              </Link>
              
              <button
                onClick={handleConnect}
                disabled={!token.trim() || isConnecting}
                style={{
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: (!token.trim() || isConnecting) ? colors.text.muted : colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: (!token.trim() || isConnecting) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: colors.shadowSm,
                  opacity: (!token.trim() || isConnecting) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  if (!(!token.trim() || isConnecting)) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = colors.shadow;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!token.trim() || isConnecting)) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = colors.shadowSm;
                  }
                }}
              >
                {isConnecting ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Connecting...
                  </>
                ) : (
                  <>
                    <KeyIcon style={{ height: '20px', width: '20px' }} />
                    Connect Platform
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
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
};

export default AuthPage;