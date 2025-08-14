import React, { useState, memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  HelpCircle, 
  BookOpen, 
  Settings, 
  Download, 
  AlertTriangle, 
  MessageCircle,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Search,
  PlayCircle,
  Shield,
  Clock,
  Zap,
  FileText,
  Users
} from 'lucide-react';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

interface FAQ {
  id: string;
  question: string;
  answer: React.ReactNode;
  category: string;
}

const faqs: FAQ[] = [
  {
    id: 'security',
    category: 'General',
    question: 'Is my data secure?',
    answer: 'Yes. We use OAuth authentication, don\'t store your passwords, and only access data you explicitly grant permission for. Your data is processed securely and not shared with third parties.'
  },
  {
    id: 'export-time',
    category: 'General', 
    question: 'How long do exports take?',
    answer: (
      <div>
        Export time varies based on data amount and options:
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Small exports (&lt; 100 items): 1-2 minutes</li>
          <li>Medium exports (100-1000 items): 5-15 minutes</li>
          <li>Large exports with media: 30+ minutes</li>
        </ul>
      </div>
    )
  },
  {
    id: 'cancel-export',
    category: 'General',
    question: 'Can I cancel an export in progress?',
    answer: 'Yes, you can close the browser tab or refresh the page. The export will stop, though you won\'t receive the partial data.'
  },
  {
    id: 'costs',
    category: 'General',
    question: 'Are there any costs?',
    answer: 'The basic Star Export service is free. Platform API usage is included within normal limits.'
  },
  {
    id: 'youtube-limit',
    category: 'Platform',
    question: 'Why can\'t I see all my YouTube videos?',
    answer: 'YouTube API has limitations. We can access up to 1,000 of your most recent videos. Older videos might not be included.'
  },
  {
    id: 'facebook-approval',
    category: 'Platform',
    question: 'Facebook says I need app approval?',
    answer: 'Some Facebook permissions require app review for production use. Contact support for assistance with business or high-volume accounts.'
  },
  {
    id: 'instagram-limited',
    category: 'Platform',
    question: 'Instagram export seems limited?',
    answer: 'Instagram has strict API limitations. Personal accounts have different access than business accounts. Consider converting to a business account for more features.'
  },
  {
    id: 'format-choice',
    category: 'Technical',
    question: 'What data format should I choose?',
    answer: 'JSON: For developers, complete data preservation, technical analysis. CSV: For spreadsheet users, data analysis in Excel/Sheets, simpler format.'
  },
  {
    id: 'automation',
    category: 'Technical',
    question: 'Can I automate exports?',
    answer: 'Currently, exports are manual only. Automated/scheduled exports are planned for future versions.'
  },
  {
    id: 'date-ranges',
    category: 'Technical',
    question: 'Can I export specific date ranges?',
    answer: 'Most platforms export all available data. Date filtering is planned for future updates.'
  }
];

const HelpPage: React.FC = () => {
  const { colors } = useTheme();
  
  // Provide fallbacks for properties that might not exist in theme
  const safeColors = {
    ...colors,
    backgroundSolid: (colors as any).backgroundSolid || safeColors.surface,
    shadowSm: (colors as any).shadowSm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    shadow: (colors as any).shadow || '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    primarySolid: (colors as any).primarySolid || safeColors.primary,
    surfaceElevated: (colors as any).surfaceElevated || safeColors.surface
  };
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: PlayCircle,
      content: (
        <div>
          <h3 style={{ color: safeColors.text.primary, marginBottom: '16px' }}>Welcome to Star Export!</h3>
          <p style={{ color: safeColors.text.secondary, marginBottom: '20px', lineHeight: 1.6 }}>
            Star Export allows you to backup and download your data from multiple social media platforms. 
            Here's how to get started:
          </p>
          
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: safeColors.text.primary, marginBottom: '12px' }}>Quick Start Guide</h4>
            <ol style={{ color: safeColors.text.secondary, paddingLeft: '20px', lineHeight: 1.8 }}>
              <li><strong>Connect Platforms:</strong> Click "Connect" on any platform card in the dashboard</li>
              <li><strong>Authenticate:</strong> Complete the OAuth flow for your chosen platform</li>
              <li><strong>Select Format:</strong> Choose between JSON or CSV export format</li>
              <li><strong>Export Data:</strong> Click "Export Data" to start the process</li>
              <li><strong>Download:</strong> Wait for processing and download your data</li>
            </ol>
          </div>

          <div style={{ 
            background: `${safeColors.primary}10`, 
            border: `1px solid ${safeColors.primary}30`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Shield style={{ color: safeColors.primary, width: '20px', height: '20px', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h5 style={{ color: safeColors.text.primary, margin: '0 0 8px 0' }}>Your Data is Secure</h5>
                <p style={{ color: safeColors.text.secondary, margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                  We use OAuth authentication and never store your passwords. Your data is processed securely 
                  and not shared with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'platforms',
      title: 'Platform Setup',
      icon: Settings,
      content: (
        <div>
          <h3 style={{ color: safeColors.text.primary, marginBottom: '20px' }}>Supported Platforms</h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {[
              {
                name: 'YouTube',
                icon: '📺',
                description: 'Videos, channel info, playlists, subscriptions',
                setup: 'Google OAuth authentication required'
              },
              {
                name: 'Facebook',
                icon: '📘',
                description: 'Posts, photos, pages, friends, liked pages',
                setup: 'Facebook OAuth with required permissions'
              },
              {
                name: 'Instagram',
                icon: '📷',
                description: 'Media, stories, tagged content, insights',
                setup: 'Uses Facebook authentication system'
              },
              {
                name: 'GitHub',
                icon: '🐙',
                description: 'Repositories, issues, pull requests',
                setup: 'Personal Access Token required'
              },
              {
                name: 'Twitter/X',
                icon: '🐦',
                description: 'Tweets, media, engagement metrics',
                setup: 'Twitter OAuth authentication'
              },
              {
                name: 'Reddit',
                icon: '🤖',
                description: 'Posts, comments, subreddits',
                setup: 'Reddit OAuth authentication'
              }
            ].map((platform) => (
              <div key={platform.name} style={{
                background: safeColors.surface,
                border: `1px solid ${safeColors.border}`,
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ fontSize: '24px' }}>{platform.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: safeColors.text.primary, margin: '0 0 8px 0' }}>{platform.name}</h4>
                    <p style={{ color: safeColors.text.secondary, margin: '0 0 8px 0', fontSize: '14px' }}>
                      {platform.description}
                    </p>
                    <p style={{ color: safeColors.text.muted, margin: 0, fontSize: '13px' }}>
                      {platform.setup}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'export-options',
      title: 'Export Options',
      icon: Download,
      content: (
        <div>
          <h3 style={{ color: safeColors.text.primary, marginBottom: '20px' }}>Export Formats & Options</h3>
          
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ color: safeColors.text.primary, marginBottom: '16px' }}>File Formats</h4>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{
                background: safeColors.surface,
                border: `1px solid ${safeColors.border}`,
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <FileText style={{ color: safeColors.primary, width: '20px', height: '20px' }} />
                  <h5 style={{ color: safeColors.text.primary, margin: 0 }}>JSON Format</h5>
                </div>
                <p style={{ color: safeColors.text.secondary, margin: '0 0 12px 0', fontSize: '14px' }}>
                  Complete data structure preservation with all metadata and nested objects.
                </p>
                <div style={{ color: safeColors.text.muted, fontSize: '13px' }}>
                  <strong>Best for:</strong> Technical users, data analysis, complete data preservation
                </div>
              </div>

              <div style={{
                background: safeColors.surface,
                border: `1px solid ${safeColors.border}`,
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <FileText style={{ color: safeColors.secondary, width: '20px', height: '20px' }} />
                  <h5 style={{ color: safeColors.text.primary, margin: 0 }}>CSV Format</h5>
                </div>
                <p style={{ color: safeColors.text.secondary, margin: '0 0 12px 0', fontSize: '14px' }}>
                  Spreadsheet-compatible format that's easy to import into Excel or Google Sheets.
                </p>
                <div style={{ color: safeColors.text.muted, fontSize: '13px' }}>
                  <strong>Best for:</strong> Spreadsheet users, data analysis, smaller file sizes
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ color: safeColors.text.primary, marginBottom: '16px' }}>Media Downloads</h4>
            <div style={{
              background: safeColors.surface,
              border: `1px solid ${safeColors.border}`,
              borderRadius: '12px',
              padding: '20px'
            }}>
              <p style={{ color: safeColors.text.secondary, marginBottom: '16px', fontSize: '14px', lineHeight: 1.6 }}>
                For supported platforms, you can optionally download media files (images and videos) 
                alongside your data export. This creates a ZIP archive containing both the data file 
                and a media folder.
              </p>
              <div style={{ 
                background: `${safeColors.warning}10`,
                border: `1px solid ${safeColors.warning}30`,
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock style={{ color: safeColors.warning, width: '16px', height: '16px' }} />
                  <span style={{ color: safeColors.text.primary, fontSize: '13px', fontWeight: '600' }}>
                    Media exports take longer and create larger files
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ color: safeColors.text.primary, marginBottom: '16px' }}>Export Limits</h4>
            <div style={{ overflow: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                background: safeColors.surface,
                borderRadius: '12px',
                overflow: 'hidden',
                border: `1px solid ${safeColors.border}`
              }}>
                <thead>
                  <tr style={{ background: safeColors.background }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: safeColors.text.primary, fontSize: '14px', fontWeight: '600' }}>Platform</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: safeColors.text.primary, fontSize: '14px', fontWeight: '600' }}>Posts/Items</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: safeColors.text.primary, fontSize: '14px', fontWeight: '600' }}>Rate Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { platform: 'YouTube', posts: '1,000 videos', limit: '10k/day' },
                    { platform: 'Facebook', posts: '1,000 posts', limit: '200/hour' },
                    { platform: 'Instagram', posts: '1,000 media', limit: '200/hour' },
                    { platform: 'GitHub', posts: 'All repos', limit: '5k/hour' },
                    { platform: 'Twitter', posts: '3,200 tweets', limit: '300/15min' },
                    { platform: 'Reddit', posts: '1,000 posts', limit: '100/min' }
                  ].map((row, index) => (
                    <tr key={row.platform} style={{ 
                      borderTop: index > 0 ? `1px solid ${safeColors.border}` : 'none'
                    }}>
                      <td style={{ padding: '12px 16px', color: safeColors.text.secondary, fontSize: '14px' }}>{row.platform}</td>
                      <td style={{ padding: '12px 16px', color: safeColors.text.secondary, fontSize: '14px' }}>{row.posts}</td>
                      <td style={{ padding: '12px 16px', color: safeColors.text.secondary, fontSize: '14px' }}>{row.limit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: AlertTriangle,
      content: (
        <div>
          <h3 style={{ color: safeColors.text.primary, marginBottom: '20px' }}>Common Issues & Solutions</h3>
          
          <div style={{ display: 'grid', gap: '24px' }}>
            {[
              {
                title: 'Connection Issues',
                problems: [
                  {
                    issue: "Can't connect to platform",
                    solutions: [
                      'Check internet connection',
                      'Disable ad blockers temporarily', 
                      'Try different browser',
                      'Clear browser cache and cookies'
                    ]
                  },
                  {
                    issue: 'OAuth redirect errors',
                    solutions: [
                      'Try authentication process again',
                      'Ensure popup blockers are disabled',
                      'Check browser URL for errors'
                    ]
                  }
                ]
              },
              {
                title: 'Export Issues',
                problems: [
                  {
                    issue: 'Export fails or stops',
                    solutions: [
                      'Check platform connection status',
                      'Verify you have data to export',
                      'Try smaller export limits',
                      'Retry after waiting period'
                    ]
                  },
                  {
                    issue: 'Media download fails',
                    solutions: [
                      'Disable media download option',
                      'Check available storage space',
                      'Verify platform media permissions'
                    ]
                  }
                ]
              }
            ].map((category) => (
              <div key={category.title} style={{
                background: safeColors.surface,
                border: `1px solid ${safeColors.border}`,
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h4 style={{ color: safeColors.text.primary, marginBottom: '16px' }}>{category.title}</h4>
                {category.problems.map((problem, index) => (
                  <div key={index} style={{ marginBottom: index < category.problems.length - 1 ? '20px' : '0' }}>
                    <h5 style={{ color: safeColors.text.primary, marginBottom: '8px', fontSize: '14px' }}>
                      {problem.issue}
                    </h5>
                    <ul style={{ 
                      color: safeColors.text.secondary, 
                      paddingLeft: '20px', 
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: 1.6
                    }}>
                      {problem.solutions.map((solution, sIndex) => (
                        <li key={sIndex}>{solution}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: MessageCircle,
      content: (
        <div>
          <h3 style={{ color: safeColors.text.primary, marginBottom: '8px' }}>Frequently Asked Questions</h3>
          <p style={{ color: safeColors.text.secondary, marginBottom: '24px' }}>
            Find answers to common questions about Star Export.
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: safeColors.text.muted,
                width: '16px',
                height: '16px'
              }} />
              <input
                type="text"
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: `1px solid ${safeColors.border}`,
                  borderRadius: '8px',
                  background: safeColors.surface,
                  color: safeColors.text.primary,
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {faqs.filter(faq => 
              searchQuery === '' || 
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              String(faq.answer).toLowerCase().includes(searchQuery.toLowerCase())
            ).map((faq) => (
              <div key={faq.id} style={{
                background: safeColors.surface,
                border: `1px solid ${safeColors.border}`,
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <span style={{ color: safeColors.text.primary, fontWeight: '500', fontSize: '14px' }}>
                    {faq.question}
                  </span>
                  {expandedFAQ === faq.id ? (
                    <ChevronDown style={{ color: safeColors.text.muted, width: '16px', height: '16px', flexShrink: 0 }} />
                  ) : (
                    <ChevronRight style={{ color: safeColors.text.muted, width: '16px', height: '16px', flexShrink: 0 }} />
                  )}
                </button>
                {expandedFAQ === faq.id && (
                  <div style={{
                    padding: '0 20px 20px 20px',
                    borderTop: `1px solid ${safeColors.border}`,
                    background: safeColors.background
                  }}>
                    <div style={{ color: safeColors.text.secondary, fontSize: '14px', lineHeight: 1.6 }}>
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      title: 'Contact Support',
      icon: Users,
      content: (
        <div>
          <h3 style={{ color: safeColors.text.primary, marginBottom: '16px' }}>Need More Help?</h3>
          <p style={{ color: safeColors.text.secondary, marginBottom: '24px', lineHeight: 1.6 }}>
            If you can't find the answer you're looking for in our documentation, 
            we're here to help! Here are the best ways to get support:
          </p>

          <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
            <div style={{
              background: safeColors.surface,
              border: `1px solid ${safeColors.border}`,
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{ color: safeColors.text.primary, marginBottom: '12px' }}>Before Contacting Support</h4>
              <ul style={{ color: safeColors.text.secondary, paddingLeft: '20px', lineHeight: 1.6, fontSize: '14px' }}>
                <li>Check this help documentation thoroughly</li>
                <li>Review the FAQ section above</li>
                <li>Try basic troubleshooting steps</li>
                <li>Check platform status pages for known issues</li>
              </ul>
            </div>

            <div style={{
              background: safeColors.surface,
              border: `1px solid ${safeColors.border}`,
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{ color: safeColors.text.primary, marginBottom: '12px' }}>What to Include</h4>
              <p style={{ color: safeColors.text.secondary, marginBottom: '12px', fontSize: '14px' }}>
                When contacting support, please provide:
              </p>
              <ul style={{ color: safeColors.text.secondary, paddingLeft: '20px', lineHeight: 1.6, fontSize: '14px' }}>
                <li><strong>Problem Description:</strong> Clear description of the issue</li>
                <li><strong>Platform:</strong> Which platform you're having trouble with</li>
                <li><strong>Browser:</strong> Browser type and version</li>
                <li><strong>Steps Taken:</strong> What you tried before contacting us</li>
                <li><strong>Error Messages:</strong> Exact text of any error messages</li>
              </ul>
            </div>
          </div>

          <div style={{
            background: `${safeColors.primary}10`,
            border: `1px solid ${safeColors.primary}30`,
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h4 style={{ color: safeColors.text.primary, marginBottom: '8px' }}>Response Times</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div>
                <div style={{ color: safeColors.error, fontWeight: '600', fontSize: '16px' }}>24-48 hours</div>
                <div style={{ color: safeColors.text.muted, fontSize: '13px' }}>Critical Issues</div>
              </div>
              <div>
                <div style={{ color: safeColors.primary, fontWeight: '600', fontSize: '16px' }}>2-5 days</div>
                <div style={{ color: safeColors.text.muted, fontSize: '13px' }}>General Questions</div>
              </div>
              <div>
                <div style={{ color: safeColors.secondary, fontWeight: '600', fontSize: '16px' }}>1 week</div>
                <div style={{ color: safeColors.text.muted, fontSize: '13px' }}>Feature Requests</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '32px',
        minHeight: 'calc(100vh - 120px)'
      }}>
        {/* Sidebar Navigation */}
        <div style={{
          background: safeColors.surface,
          borderRadius: '16px',
          border: `1px solid ${safeColors.border}`,
          padding: '24px',
          height: 'fit-content',
          position: 'sticky',
          top: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <HelpCircle style={{ color: safeColors.primary, width: '24px', height: '24px' }} />
            <h2 style={{ 
              color: safeColors.text.primary, 
              margin: 0, 
              fontSize: '20px',
              fontWeight: '700'
            }}>
              Help & Support
            </h2>
          </div>
          
          <nav>
            {helpSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    marginBottom: '4px',
                    background: isActive ? safeColors.primary : 'transparent',
                    color: isActive ? 'white' : safeColors.text.secondary,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
                  {section.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div style={{
          background: safeColors.surface,
          borderRadius: '16px',
          border: `1px solid ${safeColors.border}`,
          padding: '32px'
        }}>
          {helpSections.find(section => section.id === activeSection)?.content}
        </div>
      </div>
  );
};

export default memo(HelpPage);