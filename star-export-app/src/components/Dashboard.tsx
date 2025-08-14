import React, { memo, useMemo, useCallback, useState } from 'react';
import { DownloadIcon, SettingsIcon, PlayIcon, RefreshCwIcon } from 'lucide-react';
import { useStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import { useExport } from '../hooks/useExport';
import { useTheme } from '../contexts/ThemeContext';
import { getSupportedPlatforms } from '../config/platforms';
import { API_CONFIG } from '../config/api';
import PlatformCard from './PlatformCard';
import ExportProgress from './ExportProgress';

interface QuickExportButtonProps {
  onExport: () => void;
  disabled: boolean;
  loading: boolean;
  connectedCount: number;
}

const QuickExportButton: React.FC<QuickExportButtonProps> = memo(({
  onExport,
  disabled,
  loading,
  connectedCount
}) => (
  <button
    onClick={onExport}
    disabled={disabled || loading}
    className={`
      w-full md:w-auto px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200
      flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl
      ${disabled 
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
      }
    `}
  >
    {loading ? (
      <>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
        <span>Exporting...</span>
      </>
    ) : (
      <>
        <DownloadIcon className="h-6 w-6" />
        <span>Export All ({connectedCount})</span>
      </>
    )}
  </button>
));

QuickExportButton.displayName = 'QuickExportButton';

interface FormatSelectorProps {
  selectedFormat: string;
  onFormatChange: (format: string) => void;
  availableFormats: string[];
}

const FormatSelector: React.FC<FormatSelectorProps> = memo(({
  selectedFormat,
  onFormatChange,
  availableFormats
}) => (
  <div className="flex items-center space-x-3">
    <label className="text-sm font-medium text-gray-700">Export format:</label>
    <select
      value={selectedFormat}
      onChange={(e) => onFormatChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {availableFormats.map((format) => (
        <option key={format} value={format}>
          {format.toUpperCase()}
        </option>
      ))}
    </select>
  </div>
));

FormatSelector.displayName = 'FormatSelector';

interface DashboardStatsProps {
  connectedPlatforms: number;
  totalPlatforms: number;
  recentExports: number;
  isExporting: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = memo(({
  connectedPlatforms,
  totalPlatforms,
  recentExports,
  isExporting
}) => {
  const { colors } = useTheme();
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    }}>
      {/* Connected Platforms Card */}
      <div style={{
        background: colors.surface,
        borderRadius: '20px',
        padding: '32px',
        boxShadow: colors.shadow,
        border: `1px solid ${colors.border}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `linear-gradient(135deg, ${colors.success}20, transparent)`,
          borderRadius: '0 20px 0 100px'
        }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: `linear-gradient(135deg, ${colors.success}, ${colors.success}CC)`,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                background: 'white',
                borderRadius: '50%'
              }} />
            </div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.text.muted,
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Connected Platforms
            </h3>
            <p style={{
              fontSize: '32px',
              fontWeight: '800',
              color: colors.text.primary,
              margin: 0,
              lineHeight: 1
            }}>
              {connectedPlatforms}
              <span style={{
                fontSize: '18px',
                color: colors.text.muted,
                fontWeight: '500'
              }}>
                /{totalPlatforms}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Recent Exports Card */}
      <div style={{
        background: colors.surface,
        borderRadius: '20px',
        padding: '32px',
        boxShadow: colors.shadow,
        border: `1px solid ${colors.border}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `linear-gradient(135deg, ${colors.accent}20, transparent)`,
          borderRadius: '0 20px 0 100px'
        }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <DownloadIcon style={{ 
                width: '20px', 
                height: '20px', 
                color: 'white'
              }} />
            </div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.text.muted,
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Recent Exports
            </h3>
            <p style={{
              fontSize: '32px',
              fontWeight: '800',
              color: colors.text.primary,
              margin: 0,
              lineHeight: 1
            }}>
              {recentExports}
            </p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div style={{
        background: colors.surface,
        borderRadius: '20px',
        padding: '32px',
        boxShadow: colors.shadow,
        border: `1px solid ${colors.border}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `linear-gradient(135deg, ${isExporting ? colors.warning : colors.primarySolid}20, transparent)`,
          borderRadius: '0 20px 0 100px'
        }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: `linear-gradient(135deg, ${isExporting ? colors.warning : colors.primarySolid}, ${isExporting ? colors.warning : colors.primarySolid}CC)`,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              {isExporting ? (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <PlayIcon style={{ 
                  width: '20px', 
                  height: '20px', 
                  color: 'white'
                }} />
              )}
            </div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.text.muted,
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Status
            </h3>
            <p style={{
              fontSize: '24px',
              fontWeight: '700',
              color: colors.text.primary,
              margin: 0,
              lineHeight: 1
            }}>
              {isExporting ? '⚡ Exporting...' : '✅ Ready'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';

export const Dashboard: React.FC = memo(() => {
  const { 
    exportFormat, 
    setExportFormat, 
    isExporting, 
    jobs 
  } = useStore();
  const { isPlatformAuthenticated } = useAuth();
  const { startExport, currentJob } = useExport();
  const { colors } = useTheme();
  
  const [isQuickExporting, setIsQuickExporting] = useState(false);

  const platforms = getSupportedPlatforms();

  const connectedPlatforms = useMemo(() => {
    return platforms.filter(platform => isPlatformAuthenticated(platform.name));
  }, [platforms, isPlatformAuthenticated]);

  const availableFormats = useMemo(() => {
    return API_CONFIG.export.formats;
  }, []);

  const recentExports = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return jobs.filter(job => job.createdAt >= thirtyDaysAgo && job.status === 'completed').length;
  }, [jobs]);

  const canQuickExport = useMemo(() => {
    return connectedPlatforms.length > 0 && !isExporting;
  }, [connectedPlatforms.length, isExporting]);

  const handleQuickExport = useCallback(async () => {
    if (!canQuickExport) return;

    setIsQuickExporting(true);
    try {
      // Export from all connected platforms
      const exportPromises = connectedPlatforms.map(platform =>
        startExport({
          platform: platform.name,
          format: exportFormat,
          options: {
            includeMetadata: true,
            maxRecords: 10000
          }
        })
      );

      await Promise.all(exportPromises);
    } catch (error) {
      console.error('Quick export failed:', error);
    } finally {
      setIsQuickExporting(false);
    }
  }, [canQuickExport, connectedPlatforms, exportFormat, startExport]);

  const handleFormatChange = useCallback((format: string) => {
    setExportFormat(format as any);
  }, [setExportFormat]);

  return (
    <div style={{ width: '100%' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: colors.text.primary,
              margin: 0,
              letterSpacing: '-0.025em'
            }}>
              Dashboard
            </h1>
            <p style={{
              marginTop: '8px',
              fontSize: '16px',
              color: colors.text.muted,
              margin: '8px 0 0 0'
            }}>
              Export your data from connected social media platforms
            </p>
          </div>
          <button 
            style={{
              padding: '12px',
              color: colors.text.muted,
              background: colors.surface,
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: colors.shadowSm,
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(90deg)';
              e.currentTarget.style.boxShadow = colors.shadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg)';
              e.currentTarget.style.boxShadow = colors.shadowSm;
            }}
          >
            <RefreshCwIcon style={{ height: '20px', width: '20px' }} />
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats
        connectedPlatforms={connectedPlatforms.length}
        totalPlatforms={platforms.length}
        recentExports={recentExports}
        isExporting={isExporting}
      />

      {/* Quick Export Section */}
      <div style={{
        background: colors.surface,
        borderRadius: '20px',
        padding: '32px',
        boxShadow: colors.shadow,
        border: `1px solid ${colors.border}`,
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: `linear-gradient(135deg, ${colors.primarySolid}10, ${colors.accent}10)`,
          borderRadius: '20px 20px 0 0'
        }} />
        
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.text.primary,
                margin: '0 0 8px 0',
                letterSpacing: '-0.025em'
              }}>
                ⚡ Quick Export
              </h2>
              <p style={{
                fontSize: '16px',
                color: colors.text.muted,
                margin: '0 0 24px 0',
                lineHeight: 1.5
              }}>
                Export data from all connected platforms in one click
              </p>
              <FormatSelector
                selectedFormat={exportFormat}
                onFormatChange={handleFormatChange}
                availableFormats={availableFormats}
              />
            </div>
            <div style={{ flexShrink: 0 }}>
              <QuickExportButton
                onExport={handleQuickExport}
                disabled={!canQuickExport}
                loading={isQuickExporting}
                connectedCount={connectedPlatforms.length}
              />
            </div>
          </div>

          {/* Current Export Progress */}
          {currentJob && (
            <div style={{
              paddingTop: '24px',
              borderTop: `1px solid ${colors.border}`
            }}>
              <ExportProgress job={currentJob} showFullDetails={false} />
            </div>
          )}
        </div>
      </div>

      {/* Platform Grid */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.text.primary,
            margin: 0,
            letterSpacing: '-0.025em'
          }}>
            🔗 Platforms
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: colors.backgroundSolid,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`
          }}>
            <SettingsIcon style={{ 
              height: '16px', 
              width: '16px', 
              color: colors.text.muted 
            }} />
            <span style={{
              fontSize: '14px',
              color: colors.text.muted,
              fontWeight: '600'
            }}>
              {connectedPlatforms.length} of {platforms.length} connected
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {platforms.map((platform) => (
            <PlatformCard
              key={platform.name}
              platform={platform}
            />
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.primarySolid}08, ${colors.accent}08)`,
        border: `1px solid ${colors.primarySolid}20`,
        borderRadius: '20px',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: `${colors.primarySolid}10`,
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '100px',
          height: '100px',
          background: `${colors.accent}10`,
          borderRadius: '50%'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: colors.text.primary,
            margin: '0 0 16px 0',
            letterSpacing: '-0.025em'
          }}>
            🚀 Getting Started
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {[
              '1. Connect to your social media platforms by clicking "Connect" on each platform card',
              '2. Choose your preferred export format using the dropdown menu',
              '3. Use "Export All" for a quick export from all connected platforms, or export individually',
              '4. Monitor progress in real-time and download your data when ready'
            ].map((step, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'white'
                }}>
                  {index + 1}
                </div>
                <p style={{
                  fontSize: '14px',
                  color: colors.text.secondary,
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  {step.substring(2)} {/* Remove the number from the beginning */}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;