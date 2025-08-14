import React, { memo, useState, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon, DownloadIcon, LinkIcon, AlertCircleIcon } from 'lucide-react';
import { PlatformConfig } from '../config/platforms';
import { useAuth } from '../hooks/useAuth';
import { useExport } from '../hooks/useExport';
import { useStore } from '../store';
import { useTheme } from '../contexts/ThemeContext';
import { PlatformIcon } from './PlatformIcon';

interface PlatformCardProps {
  platform: PlatformConfig;
  className?: string;
}

interface ConnectionStatusProps {
  isConnected: boolean;
  platform: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = memo(({ isConnected, platform }) => {
  const { colors } = useTheme();
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {isConnected ? (
        <>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: colors.success
          }} />
          <span style={{
            fontSize: '14px',
            color: colors.success,
            fontWeight: '600'
          }}>
            Connected
          </span>
        </>
      ) : (
        <>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: colors.text.muted
          }} />
          <span style={{
            fontSize: '14px',
            color: colors.text.muted,
            fontWeight: '500'
          }}>
            Not connected
          </span>
        </>
      )}
    </div>
  );
});

ConnectionStatus.displayName = 'ConnectionStatus';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant: 'primary' | 'secondary' | 'danger';
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = memo(({
  onClick,
  disabled = false,
  loading = false,
  variant,
  icon: Icon,
  children
}) => {
  const { colors } = useTheme();
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: disabled ? colors.text.muted : colors.primary,
          color: 'white',
          border: 'none'
        };
      case 'secondary':
        return {
          background: colors.backgroundSolid,
          color: colors.text.secondary,
          border: `1px solid ${colors.border}`
        };
      case 'danger':
        return {
          background: colors.error,
          color: 'white',
          border: 'none'
        };
      default:
        return {};
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '12px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        boxShadow: colors.shadowSm,
        ...getVariantStyles()
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = colors.shadow;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = colors.shadowSm;
        }
      }}
    >
      {loading ? (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid currentColor',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginRight: '8px'
        }} />
      ) : Icon ? (
        <Icon style={{ height: '16px', width: '16px', marginRight: '8px' }} />
      ) : null}
      {children}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

export const PlatformCard: React.FC<PlatformCardProps> = memo(({ platform, className = '' }) => {
  const { isPlatformAuthenticated, authenticate, disconnect, getOAuthUrl } = useAuth();
  const { startExport } = useExport();
  const { exportFormat, setSelectedPlatform } = useStore();
  const { colors } = useTheme();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isConnected = isPlatformAuthenticated(platform.name);
  const supportsFormat = platform.exportFormats.includes(exportFormat);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      if (platform.authType === 'oauth') {
        // Redirect to OAuth provider
        const oauthUrl = getOAuthUrl(platform);
        window.location.href = oauthUrl;
      } else if (platform.authType === 'token') {
        // For token-based auth, we'd typically show a modal or form
        // For now, simulate token input
        const token = window.prompt(`Enter your ${platform.displayName} access token:`);
        if (token) {
          await authenticate(platform.name, { token });
        }
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [platform, getOAuthUrl, authenticate]);

  const handleDisconnect = useCallback(async () => {
    setIsDisconnecting(true);
    try {
      await disconnect(platform.name);
    } catch (error) {
      console.error('Disconnection failed:', error);
    } finally {
      setIsDisconnecting(false);
    }
  }, [platform.name, disconnect]);

  const handleExport = useCallback(async () => {
    if (!isConnected) {
      await handleConnect();
      return;
    }

    setIsExporting(true);
    try {
      await startExport({
        platform: platform.name,
        format: exportFormat,
        options: {
          includeMetadata: true,
          maxRecords: 10000
        }
      });
      
      // Set this platform as selected for progress tracking
      setSelectedPlatform(platform);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [isConnected, platform, exportFormat, startExport, setSelectedPlatform, handleConnect]);

  const formatDisplayName = (format: string) => {
    return format.toUpperCase();
  };

  return (
    <div style={{
      background: colors.surface,
      borderRadius: '20px',
      padding: '32px',
      boxShadow: colors.shadow,
      border: `1px solid ${colors.border}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = colors.shadowLg;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = colors.shadow;
    }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '120px',
        height: '120px',
        background: `linear-gradient(135deg, ${isConnected ? colors.success : colors.text.muted}20, transparent)`,
        borderRadius: '0 20px 0 120px'
      }} />

      {/* Platform header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            filter: isConnected ? 'none' : 'grayscale(1) opacity(0.5)'
          }}>
            <PlatformIcon 
              icon={platform.icon} 
              size={48}
              color={isConnected ? colors.primarySolid : colors.text.muted}
            />
          </div>
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: colors.text.primary,
              margin: 0,
              marginBottom: '8px',
              letterSpacing: '-0.025em'
            }}>
              {platform.displayName}
            </h3>
            <ConnectionStatus isConnected={isConnected} platform={platform.name} />
          </div>
        </div>
      </div>

      {/* Platform details */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.text.muted,
            margin: '0 0 8px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Supported Formats
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {platform.exportFormats.map((format) => (
              <span
                key={format}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: format === exportFormat ? colors.primary : colors.backgroundSolid,
                  color: format === exportFormat ? 'white' : colors.text.secondary,
                  border: format === exportFormat ? 'none' : `1px solid ${colors.border}`
                }}
              >
                {formatDisplayName(format)}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.text.muted,
            margin: '0 0 4px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Rate Limit
          </p>
          <p style={{
            fontSize: '14px',
            color: colors.text.secondary,
            margin: 0
          }}>
            {platform.rateLimit.requests} requests per {Math.floor(platform.rateLimit.window / 1000 / 60)} minutes
          </p>
        </div>
      </div>

      {/* Format compatibility warning */}
      {!supportsFormat && (
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '16px',
          background: `${colors.warning}10`,
          border: `1px solid ${colors.warning}30`,
          borderRadius: '12px'
        }}>
          <AlertCircleIcon style={{ 
            height: '20px', 
            width: '20px', 
            color: colors.warning,
            flexShrink: 0,
            marginTop: '2px'
          }} />
          <div>
            <p style={{
              fontSize: '14px',
              color: colors.text.primary,
              margin: 0,
              fontWeight: '600'
            }}>
              Format not supported
            </p>
            <p style={{
              fontSize: '13px',
              color: colors.text.secondary,
              margin: '4px 0 0 0',
              lineHeight: 1.4
            }}>
              This platform doesn't support {formatDisplayName(exportFormat)} format. 
              Available: {platform.exportFormats.map(formatDisplayName).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '12px',
        marginBottom: isConnected ? '24px' : '0'
      }}>
        {isConnected ? (
          <>
            <ActionButton
              onClick={handleExport}
              disabled={!supportsFormat}
              loading={isExporting}
              variant="primary"
              icon={DownloadIcon}
            >
              {isExporting ? 'Exporting...' : 'Export Data'}
            </ActionButton>
            
            <ActionButton
              onClick={handleDisconnect}
              loading={isDisconnecting}
              variant="secondary"
            >
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </ActionButton>
          </>
        ) : (
          <ActionButton
            onClick={handleConnect}
            loading={isConnecting}
            variant="primary"
            icon={LinkIcon}
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </ActionButton>
        )}
      </div>

      {/* Additional info for connected platforms */}
      {isConnected && (
        <div style={{
          paddingTop: '24px',
          borderTop: `1px solid ${colors.border}`,
          background: `${colors.success}08`,
          margin: '0 -32px -32px -32px',
          padding: '24px 32px',
          borderRadius: '0 0 20px 20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <p style={{
              fontSize: '14px',
              color: colors.text.secondary,
              margin: 0
            }}>
              Ready to export in {formatDisplayName(exportFormat)} format
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: colors.success,
                borderRadius: '50%'
              }} />
              <span style={{
                fontSize: '14px',
                color: colors.success,
                fontWeight: '600'
              }}>
                Active
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PlatformCard.displayName = 'PlatformCard';

export default PlatformCard;