import React from 'react';

const SimpleHelpPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Help & Support</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>Getting Started</h2>
        <p>Welcome to Star Export! Here's how to get started:</p>
        <ol>
          <li>Connect to your platforms using OAuth authentication</li>
          <li>Select the data format you want (JSON or CSV)</li>
          <li>Click "Export Data" to start the export process</li>
          <li>Download your data when the export completes</li>
        </ol>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>Supported Platforms</h2>
        <ul>
          <li><strong>YouTube:</strong> Videos, channel info, playlists, subscriptions</li>
          <li><strong>Facebook:</strong> Posts, photos, pages, friends, liked pages</li>
          <li><strong>Instagram:</strong> Media, stories, tagged content, insights</li>
          <li><strong>GitHub:</strong> Repositories, issues, pull requests</li>
          <li><strong>Twitter/X:</strong> Tweets, media, engagement metrics</li>
          <li><strong>Reddit:</strong> Posts, comments, subreddits</li>
        </ul>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>Frequently Asked Questions</h2>
        
        <h3>Is my data secure?</h3>
        <p>Yes. We use OAuth authentication, don't store your passwords, and only access data you explicitly grant permission for.</p>
        
        <h3>How long do exports take?</h3>
        <p>Export time varies:</p>
        <ul>
          <li>Small exports (&lt; 100 items): 1-2 minutes</li>
          <li>Medium exports (100-1000 items): 5-15 minutes</li>
          <li>Large exports with media: 30+ minutes</li>
        </ul>
        
        <h3>Can I cancel an export?</h3>
        <p>Yes, you can close the browser tab or refresh the page to stop an export.</p>
        
        <h3>What format should I choose?</h3>
        <p><strong>JSON:</strong> For developers and complete data preservation<br/>
        <strong>CSV:</strong> For spreadsheet users and simpler data analysis</p>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>Troubleshooting</h2>
        
        <h3>Connection Issues</h3>
        <ul>
          <li>Check your internet connection</li>
          <li>Disable ad blockers temporarily</li>
          <li>Try a different browser</li>
          <li>Clear browser cache and cookies</li>
        </ul>
        
        <h3>Export Issues</h3>
        <ul>
          <li>Check platform connection status</li>
          <li>Verify you have data to export</li>
          <li>Try smaller export limits</li>
          <li>Wait and retry after rate limiting</li>
        </ul>
      </section>

      <section>
        <h2>Need More Help?</h2>
        <p>If you can't find what you're looking for:</p>
        <ul>
          <li>Check our documentation</li>
          <li>Contact support with detailed information about your issue</li>
          <li>Include your browser type, platform, and error messages</li>
        </ul>
      </section>
    </div>
  );
};

export default SimpleHelpPage;