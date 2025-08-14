# Star Export - Help Documentation

## Table of Contents

1. [Getting Started](#getting-started)
2. [Platform Setup](#platform-setup)
3. [Using the Application](#using-the-application)
4. [Export Options](#export-options)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#frequently-asked-questions)
7. [Technical Support](#technical-support)

## Getting Started

### What is Star Export?

Star Export is a comprehensive data export tool that allows you to backup and download your data from multiple social media platforms and services. Currently supported platforms include:

- **YouTube** - Videos, channel info, playlists, subscriptions
- **GitHub** - Repositories, issues, pull requests, user data
- **Twitter/X** - Tweets, media, followers, engagement data
- **Reddit** - Posts, comments, subscriptions, user data
- **Facebook** - Posts, photos, pages, friends, liked pages
- **Instagram** - Media, stories, tagged content, insights

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for platform authentication
- Sufficient storage space for downloaded exports

### Quick Start

1. **Access the Application**: Navigate to the Star Export dashboard
2. **Connect Platforms**: Click "Connect" on any platform card
3. **Authenticate**: Complete the OAuth flow for your chosen platform
4. **Export Data**: Select format and click "Export Data"
5. **Download**: Wait for processing and download your data

## Platform Setup

### YouTube Setup

1. **Connect**: Click "Connect" on the YouTube platform card
2. **Authorization**: You'll be redirected to Google for authentication
3. **Permissions**: Grant access to YouTube data (read-only)
4. **Data Available**: Channel info, videos, playlists, subscriptions, statistics

**Required Permissions:**
- YouTube Data API v3 access
- Read access to channel data
- Video and playlist information

### GitHub Setup

1. **Connect**: Click "Connect" on the GitHub platform card
2. **Token Input**: Enter your GitHub Personal Access Token
3. **Data Available**: Repositories, issues, pull requests, user profile

**How to get a GitHub Token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with appropriate scopes
3. Copy the token and paste it when connecting

### Twitter/X Setup

1. **Connect**: Click "Connect" on the Twitter platform card
2. **OAuth**: Complete Twitter OAuth authentication
3. **Data Available**: Tweets, media, engagement metrics, profile data

### Reddit Setup

1. **Connect**: Click "Connect" on the Reddit platform card
2. **OAuth**: Complete Reddit OAuth authentication
3. **Data Available**: Posts, comments, subreddits, user data

### Facebook Setup

**Prerequisites:**
- Facebook account
- Administrator approval for Facebook app (if in production)

1. **Connect**: Click "Connect" on the Facebook platform card
2. **OAuth**: Complete Facebook OAuth authentication
3. **Permissions**: Grant requested permissions for data access
4. **Data Available**: Posts, photos, pages, friends, liked pages

**Required Permissions:**
- `email` - Contact information
- `public_profile` - Basic profile data
- `user_posts` - Access to posts
- `user_photos` - Access to photos
- `user_likes` - Liked pages
- `pages_show_list` - Managed pages

### Instagram Setup

**Note:** Instagram uses Facebook's authentication system.

1. **Connect**: Click "Connect" on the Instagram platform card
2. **Facebook OAuth**: Complete Facebook authentication
3. **Instagram Access**: Grant Instagram-specific permissions
4. **Data Available**: Media posts, stories, tagged content, insights

**Required Permissions:**
- `instagram_basic` - Basic Instagram access
- `instagram_content_publish` - Content access

## Using the Application

### Dashboard Overview

The main dashboard displays platform cards showing:
- **Platform Status**: Connected/Not Connected indicator
- **Export Formats**: Available formats (JSON, CSV)
- **Rate Limits**: API request limits per platform
- **Media Support**: Whether platform supports media downloads

### Connecting Platforms

1. **Platform Card**: Find the platform you want to connect
2. **Connect Button**: Click "Connect" to start authentication
3. **External Authentication**: Complete OAuth on the platform's website
4. **Return to Dashboard**: You'll be redirected back after successful authentication
5. **Connected Status**: Platform card will show "Connected" status

### Export Process

1. **Select Format**: Choose between JSON or CSV export
2. **Media Download**: Enable "Include Media" if you want to download images/videos
3. **Start Export**: Click "Export Data" on a connected platform
4. **Monitor Progress**: Watch the real-time progress updates
5. **Download**: Click download when export completes

### Export Formats

#### JSON Format
- Complete data structure preservation
- Includes all metadata and nested objects
- Best for technical users and data analysis
- Larger file sizes

#### CSV Format
- Spreadsheet-compatible format
- Flattened data structure
- Easy to import into Excel, Google Sheets
- Smaller file sizes but some data loss

#### Media Downloads
- Optional feature for supported platforms
- Downloads images and videos alongside data
- Creates ZIP archive with both data file and media folder
- Significantly larger file sizes

## Export Options

### Standard Export
- Metadata only (text, numbers, dates)
- Fast processing
- Small file sizes
- Available in JSON or CSV

### Media Export
- Includes media files (images, videos)
- Longer processing time
- Large file sizes
- Creates ZIP archive
- Available for platforms that support media

### Export Limits

Different platforms have different limits:

| Platform  | Posts/Items | Media Files | Rate Limit |
|-----------|-------------|-------------|------------|
| YouTube   | 1,000 videos| Thumbnails  | 10k/day    |
| Facebook  | 1,000 posts | 500 photos  | 200/hour   |
| Instagram | 1,000 media | All media   | 200/hour   |
| GitHub    | All repos   | N/A         | 5k/hour    |
| Twitter   | 3,200 tweets| Images      | 300/15min  |
| Reddit    | 1,000 posts | Links only  | 100/min    |

## Troubleshooting

### Connection Issues

**Problem**: Can't connect to platform
**Solutions:**
1. Check internet connection
2. Disable ad blockers temporarily
3. Try different browser
4. Clear browser cache and cookies
5. Ensure platform account is in good standing

**Problem**: OAuth redirect errors
**Solutions:**
1. Check URL in browser address bar
2. Try authentication process again
3. Ensure popup blockers are disabled
4. Contact support if issue persists

### Export Issues

**Problem**: Export fails or stops
**Solutions:**
1. Check platform connection status
2. Verify you have data to export
3. Try smaller export (reduce limits)
4. Check internet stability
5. Retry export after waiting period

**Problem**: Media download fails
**Solutions:**
1. Disable media download option
2. Check available storage space
3. Try exporting smaller date range
4. Verify platform media permissions

### Performance Issues

**Problem**: Slow export processing
**Causes:**
- Large amount of data
- Media downloads enabled
- Platform rate limiting
- Internet connection speed

**Solutions:**
1. Be patient - large exports take time
2. Disable media downloads for faster processing
3. Export during off-peak hours
4. Try smaller date ranges

### File Issues

**Problem**: Can't open downloaded file
**Solutions:**
1. Verify file downloaded completely
2. Use appropriate software (JSON viewer, Excel for CSV)
3. Check file isn't corrupted
4. Try downloading again

**Problem**: ZIP file errors
**Solutions:**
1. Use proper extraction software
2. Check available disk space
3. Verify download completed
4. Try alternative extraction tools

## Frequently Asked Questions

### General Questions

**Q: Is my data secure?**
A: Yes. We use OAuth authentication, don't store your passwords, and only access data you explicitly grant permission for. Your data is processed securely and not shared with third parties.

**Q: How long do exports take?**
A: Export time varies based on data amount and media options:
- Small exports (< 100 items): 1-2 minutes
- Medium exports (100-1000 items): 5-15 minutes
- Large exports with media: 30+ minutes

**Q: Can I cancel an export in progress?**
A: Yes, you can close the browser tab or refresh the page. The export will stop, though you won't receive the partial data.

**Q: Are there any costs?**
A: The basic Star Export service is free. Platform API usage is included within normal limits.

### Platform-Specific Questions

**Q: Why can't I see all my YouTube videos?**
A: YouTube API has limitations. We can access up to 1,000 of your most recent videos. Older videos might not be included.

**Q: Facebook says I need app approval?**
A: Some Facebook permissions require app review for production use. Contact support for assistance with business or high-volume accounts.

**Q: Instagram export seems limited?**
A: Instagram has strict API limitations. Personal accounts have different access than business accounts. Consider converting to a business account for more features.

**Q: GitHub export is missing private repos?**
A: Ensure your Personal Access Token has appropriate scopes for private repository access.

### Technical Questions

**Q: What data format should I choose?**
A: 
- **JSON**: For developers, complete data preservation, technical analysis
- **CSV**: For spreadsheet users, data analysis in Excel/Sheets, simpler format

**Q: Can I automate exports?**
A: Currently, exports are manual only. Automated/scheduled exports are planned for future versions.

**Q: Can I export specific date ranges?**
A: Most platforms export all available data. Date filtering is planned for future updates.

## Technical Support

### Before Contacting Support

1. **Check this help documentation**
2. **Review the FAQ section**
3. **Try basic troubleshooting steps**
4. **Check platform status pages for known issues**

### What to Include in Support Requests

When contacting support, please provide:

1. **Problem Description**: Clear description of the issue
2. **Platform**: Which platform you're having trouble with
3. **Browser Information**: Browser type and version
4. **Steps Taken**: What you tried before contacting us
5. **Error Messages**: Exact text of any error messages
6. **Screenshots**: Visual representation of the problem (if applicable)

### Response Times

- **Critical Issues**: 24-48 hours
- **General Questions**: 2-5 business days
- **Feature Requests**: Acknowledged within 1 week

### Self-Help Resources

1. **Knowledge Base**: Check our online knowledge base for common solutions
2. **Community Forum**: Connect with other users for tips and solutions
3. **Video Tutorials**: Step-by-step video guides for common tasks
4. **Platform Documentation**: Official API documentation for technical details

### Platform-Specific Support

#### YouTube Issues
- Check Google API status
- Verify YouTube account standing
- Review Google OAuth policies

#### Facebook/Instagram Issues
- Check Facebook Developer status
- Review Facebook API documentation
- Verify app permissions and approval status

#### GitHub Issues
- Verify Personal Access Token permissions
- Check GitHub API rate limits
- Review repository access permissions

#### Twitter Issues
- Check Twitter Developer portal
- Verify app permissions
- Review Twitter API v2 documentation

### Emergency Support

For urgent issues affecting data security or privacy:
- Email: emergency@starexport.com
- Include "URGENT" in subject line
- Provide detailed issue description

### Feedback and Suggestions

We value your feedback! Help us improve Star Export:

1. **Feature Requests**: Submit ideas for new features
2. **Bug Reports**: Report issues you encounter
3. **User Experience**: Share your experience and suggestions
4. **Platform Requests**: Suggest new platforms to support

### Additional Resources

- **Project GitHub**: Source code and technical documentation
- **API Documentation**: Technical reference for developers
- **Blog**: Updates, tutorials, and best practices
- **Social Media**: Follow for updates and tips

---

## Need More Help?

If you can't find the answer you're looking for:

1. **Search Documentation**: Use Ctrl+F to search this document
2. **Check Recent Updates**: Review the changelog for recent changes
3. **Contact Support**: Reach out with specific questions
4. **Community Resources**: Connect with other users

Remember: We're here to help you successfully export and backup your important social media data. Don't hesitate to reach out if you need assistance!