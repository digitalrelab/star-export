import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, DownloadIcon, InfoIcon, CheckCircleIcon, AlertTriangleIcon, SettingsIcon, PlayIcon, DatabaseIcon } from 'lucide-react';
import { getPlatformConfig, getSupportedPlatforms } from '../config/platforms';
import { useStore } from '../store';
import { useExport } from '../hooks/useExport';
import { useTheme } from '../contexts/ThemeContext';
import { PlatformIcon } from '../components/PlatformIcon';

const ExportPage: React.FC = () => {
  const { platform: platformName } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  const [includeMedia, setIncludeMedia] = useState(false);
  const {
    selectedPlatform,
    exportFormat,
    setSelectedPlatform,
    setExportFormat,
  } = useStore();

  const { startExport, isExporting } = useExport();
  const platform = platformName ? getPlatformConfig(platformName) : null;
  const supportedPlatforms = getSupportedPlatforms();
  const { colors } = useTheme();

  React.useEffect(() => {
    if (platform) {
      setSelectedPlatform(platform);
    }
  }, [platform, setSelectedPlatform]);

  const handleExport = async () => {
    if (!selectedPlatform || !platform) return;

    const exportRequest = {
      platform: platform.name,
      format: exportFormat,
      includeMedia
    };

    await startExport(exportRequest);
  };

  const handlePlatformSelect = (platformName: string) => {
    navigate(`/export/${platformName}`);
  };

  // If no platform is specified, show platform selection page
  if (!platformName) {
    return (
      <div style={{ width: '100%' }}>
        {/* Header */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: colors.text.primary,
              margin: 0,
              letterSpacing: '-0.025em'
            }}>
              🚀 Export Platform
            </h1>
            <p style={{
              marginTop: '8px',
              fontSize: '16px',
              color: colors.text.muted,
              margin: '8px 0 0 0'
            }}>
              Choose a platform to export your starred content from
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
            Back to Dashboard
          </Link>
        </div>

        {/* Platform Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {supportedPlatforms.map((platform) => (
            <div
              key={platform.name}
              onClick={() => handlePlatformSelect(platform.name)}
              style={{
                background: colors.surface,
                borderRadius: '20px',
                padding: '32px',
                boxShadow: colors.shadow,
                border: `1px solid ${colors.border}`,
                cursor: 'pointer',
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
                background: `linear-gradient(135deg, ${colors.primarySolid}20, transparent)`,
                borderRadius: '0 20px 0 120px'
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <PlatformIcon 
                      icon={platform.icon} 
                      size={56}
                      color={colors.primarySolid}
                    />
                  </div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: colors.text.primary,
                    margin: '0 0 12px 0',
                    letterSpacing: '-0.025em'
                  }}>
                    {platform.displayName}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: colors.text.muted,
                    margin: '0 0 20px 0',
                    lineHeight: 1.5
                  }}>
                    Export your starred content from {platform.displayName}
                  </p>
                </div>

                {/* Platform Details */}
                <div style={{
                  background: colors.backgroundSolid,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <DatabaseIcon style={{
                      height: '16px',
                      width: '16px',
                      color: colors.text.muted
                    }} />
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: colors.text.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Supported Formats
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap'
                  }}>
                    {platform.exportFormats.map((format) => (
                      <span
                        key={format}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: colors.primary,
                          color: 'white'
                        }}
                      >
                        {format.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlatformSelect(platform.name);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <PlayIcon style={{ height: '16px', width: '16px' }} />
                  Start Export
                </button>
              </div>
            </div>
          ))}
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
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
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
                height: '24px',
                width: '24px',
                color: colors.primarySolid
              }} />
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: colors.text.primary,
                margin: 0,
                letterSpacing: '-0.025em'
              }}>
                How Export Works
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              {[
                'Select the platform you want to export data from',
                'Choose your preferred export format (JSON or CSV)',
                'Configure export options like including media files',
                'Download your data when the export completes'
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
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If platform is specified but not found, show error
  if (!platform) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <div style={{
          background: colors.surface,
          borderRadius: '20px',
          padding: '40px',
          boxShadow: colors.shadow,
          border: `1px solid ${colors.border}`,
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px'
          }}>
            ❌
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.text.primary,
            margin: '0 0 16px 0'
          }}>
            Platform "{platformName}" not found
          </h1>
          <p style={{
            fontSize: '16px',
            color: colors.text.muted,
            margin: '0 0 32px 0',
            lineHeight: 1.5
          }}>
            The platform you're looking for doesn't exist or isn't supported yet.
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/export"
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
              <PlayIcon style={{ height: '16px', width: '16px' }} />
              Choose Platform
            </Link>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                color: colors.text.muted,
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'all 0.3s'
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
              <ArrowLeftIcon style={{ height: '16px', width: '16px' }} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <Link
          to="/export"
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
          Choose Different Platform
        </Link>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Platform Header Card */}
        <div style={{
          background: colors.surface,
          borderRadius: '20px',
          padding: '40px',
          boxShadow: colors.shadow,
          border: `1px solid ${colors.border}`,
          marginBottom: '32px',
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

          <div style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center'
          }}>
            <div style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <PlatformIcon 
                icon={platform.icon} 
                size={80}
                color={colors.primarySolid}
              />
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: colors.text.primary,
              margin: '0 0 12px 0',
              letterSpacing: '-0.025em'
            }}>
              Export {platform.displayName} Data
            </h1>
            <p style={{
              fontSize: '16px',
              color: colors.text.muted,
              margin: 0,
              lineHeight: 1.5
            }}>
              Configure your export settings and download your starred content
            </p>
          </div>
        </div>

        {/* Export Configuration */}
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px'
            }}>
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
                  Export Configuration
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: colors.text.muted,
                  margin: '4px 0 0 0'
                }}>
                  Choose your export format and options
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              {/* Format Selection */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <DatabaseIcon style={{
                    height: '18px',
                    width: '18px',
                    color: colors.text.muted
                  }} />
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.text.primary
                  }}>
                    Export Format
                  </label>
                </div>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  style={{
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
                  {platform.exportFormats.map((format) => (
                    <option key={format} value={format}>
                      {format.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '8px'
                }}>
                  {platform.exportFormats.map((format) => (
                    <div
                      key={format}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: format === exportFormat ? colors.primary : colors.backgroundSolid,
                        color: format === exportFormat ? 'white' : colors.text.muted,
                        border: format === exportFormat ? 'none' : `1px solid ${colors.border}`
                      }}
                    >
                      {format.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Media Options */}
              {platform.contentTypes?.supportsMedia && (
                <div style={{
                  background: colors.backgroundSolid,
                  borderRadius: '16px',
                  padding: '20px',
                  border: `1px solid ${colors.border}`
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: '12px'
                  }}>
                    <input
                      type="checkbox"
                      checked={includeMedia}
                      onChange={(e) => setIncludeMedia(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: colors.primarySolid
                      }}
                    />
                    <div>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: colors.text.primary,
                        display: 'block'
                      }}>
                        Include media files (images and videos)
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: colors.text.muted,
                        marginTop: '2px',
                        display: 'block'
                      }}>
                        Download media files along with metadata
                      </span>
                    </div>
                  </label>

                  {includeMedia && (
                    <div style={{
                      marginTop: '16px',
                      padding: '16px',
                      background: `${colors.warning}10`,
                      border: `1px solid ${colors.warning}30`,
                      borderRadius: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}>
                        <AlertTriangleIcon style={{
                          height: '20px',
                          width: '20px',
                          color: colors.warning,
                          flexShrink: 0,
                          marginTop: '2px'
                        }} />
                        <div>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: colors.text.primary,
                            margin: '0 0 8px 0'
                          }}>
                            Media Export Information
                          </h4>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}>
                            <p style={{
                              fontSize: '13px',
                              color: colors.text.secondary,
                              margin: 0,
                              lineHeight: 1.4
                            }}>
                              This will download images and videos along with metadata. The export file will be larger and may take more time to complete.
                            </p>
                            {platform.contentTypes.imageFormats && (
                              <p style={{
                                fontSize: '12px',
                                color: colors.text.muted,
                                margin: 0
                              }}>
                                📸 Images: {platform.contentTypes.imageFormats.join(', ')}
                              </p>
                            )}
                            {platform.contentTypes.videoFormats && (
                              <p style={{
                                fontSize: '12px',
                                color: colors.text.muted,
                                margin: 0
                              }}>
                                🎥 Videos: {platform.contentTypes.videoFormats.join(', ')}
                              </p>
                            )}
                            {platform.contentTypes.maxFileSize && (
                              <p style={{
                                fontSize: '12px',
                                color: colors.text.muted,
                                margin: 0
                              }}>
                                📏 Max file size: {platform.contentTypes.maxFileSize}MB
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
            to="/"
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
            <ArrowLeftIcon style={{ height: '16px', width: '16px' }} />
            Back to Home
          </Link>

          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              background: isExporting ? colors.text.muted : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: colors.shadowSm,
              opacity: isExporting ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              if (!isExporting) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = colors.shadow;
              }
            }}
            onMouseLeave={(e) => {
              if (!isExporting) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = colors.shadowSm;
              }
            }}
          >
            {isExporting ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Exporting...
              </>
            ) : (
              <>
                <DownloadIcon style={{ height: '20px', width: '20px' }} />
                Start Export
              </>
            )}
          </button>
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

export default ExportPage;