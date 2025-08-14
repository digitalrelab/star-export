# Facebook and Instagram Integration Documentation

## Overview

This document details the implementation of Facebook and Instagram platform support in the Star Export application. The integration allows users to authenticate with Facebook/Instagram and export their data including posts, media, engagement metrics, and profile information.

## Architecture

### Platform Configuration

Both platforms are configured in `/star-export-app/src/config/platforms.ts`:

```typescript
facebook: {
  name: 'facebook',
  displayName: 'Facebook',
  icon: '📘',
  baseUrl: 'https://graph.facebook.com/v18.0',
  authType: 'oauth',
  exportFormats: ['json', 'csv'],
  rateLimit: {
    requests: 200,
    window: 3600000, // 1 hour
  },
  contentTypes: {
    supportsMedia: true,
    videoFormats: ['mp4', 'mov'],
    imageFormats: ['jpg', 'jpeg', 'png', 'gif'],
    maxFileSize: 1024
  },
},
instagram: {
  name: 'instagram',
  displayName: 'Instagram',
  icon: '📷',
  baseUrl: 'https://graph.instagram.com/v18.0',
  authType: 'oauth',
  exportFormats: ['json', 'csv'],
  rateLimit: {
    requests: 200,
    window: 3600000, // 1 hour
  },
  contentTypes: {
    supportsMedia: true,
    videoFormats: ['mp4', 'mov'],
    imageFormats: ['jpg', 'jpeg', 'png'],
    maxFileSize: 1024
  },
}
```

## Backend Implementation

### 1. Facebook Service (`/server/src/services/facebookService.ts`)

The Facebook service provides comprehensive data access through the Graph API:

#### Features:
- **User Information**: Profile data, basic info
- **Posts**: User posts with engagement metrics (likes, comments, shares)
- **Pages**: User-managed pages and page posts
- **Social Data**: Friends list, liked pages
- **Media**: Photo uploads with metadata

#### Key Methods:
```typescript
async getUserInfo()                    // Get user profile information
async getUserPosts(limit: number)      // Fetch user posts with engagement
async getUserPages()                   // Get user-managed pages
async getPagePosts(pageId: string)     // Fetch posts from specific page
async getLikedPages(limit: number)     // Get pages user has liked
async getFriends()                     // Get friends list
async getPhotos(limit: number)         // Get uploaded photos
```

#### Data Structure Example:
```typescript
interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  type: string;
  likes?: { summary: { total_count: number } };
  comments?: { summary: { total_count: number } };
  shares?: { count: number };
  attachments?: { data: any[] };
}
```

### 2. Instagram Service (`/server/src/services/instagramService.ts`)

The Instagram service accesses data through the Instagram Graph API:

#### Features:
- **User Profile**: Account information, follower counts
- **Media**: Posts, videos, carousel albums with engagement
- **Stories**: Story content and metadata
- **Analytics**: Account insights and performance metrics
- **Interactions**: Comments, tagged media

#### Key Methods:
```typescript
async getUserInfo()                      // Get Instagram profile info
async getUserMedia(limit: number)        // Fetch user media posts
async getStories()                       // Get user stories
async getTaggedMedia(limit: number)      // Get media user is tagged in
async getAccountInsights(period: string) // Get account analytics
async getMediaComments(mediaId: string)  // Get comments on media
async getHashtagSearch(hashtag: string)  // Search hashtags
```

#### Data Structure Example:
```typescript
interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  thumbnail_url?: string;
  children?: { data: InstagramMedia[] };
}
```

### 3. Authentication Integration

#### Passport Configuration (`/server/src/auth/passport.ts`)

Facebook OAuth strategy with comprehensive scopes:

```typescript
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID!,
  clientSecret: process.env.FACEBOOK_APP_SECRET!,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'email', 'picture'],
  scope: [
    'email',
    'public_profile',
    'pages_show_list',           // Access to user's pages
    'pages_read_engagement',     // Read page engagement data
    'user_posts',               // Access to user posts
    'user_photos',              // Access to user photos
    'user_likes',               // Access to liked pages
    'instagram_basic',          // Basic Instagram access
    'instagram_content_publish' // Instagram content access
  ]
}));
```

#### Authentication Routes (`/server/src/auth/routes.ts`)

```typescript
// Facebook authentication
router.get('/facebook', passport.authenticate('facebook', { scope: [...] }));
router.get('/facebook/callback', passport.authenticate('facebook'), (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/dashboard?auth=success`);
});

// Instagram authentication (uses Facebook OAuth)
router.get('/instagram', passport.authenticate('facebook', { 
  scope: ['instagram_basic', 'instagram_content_publish'] 
}));
router.get('/instagram/callback', passport.authenticate('facebook'), (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/dashboard?auth=success&platform=instagram`);
});
```

### 4. Export Service Integration (`/server/src/services/exportService.ts`)

Both platforms are integrated into the export service with comprehensive data collection:

#### Facebook Export Process:
1. **User Information** (10% progress)
2. **User Posts** (25% progress) - Up to 1000 posts with engagement
3. **Pages** (40% progress) - User-managed pages
4. **Liked Pages** (60% progress) - Up to 500 liked pages
5. **Friends** (75% progress) - Friends list
6. **Photos** (85% progress) - Up to 500 photos
7. **File Generation** (95% progress)
8. **Completion** (100% progress)

#### Instagram Export Process:
1. **User Information** (10% progress)
2. **Media Posts** (25% progress) - Up to 1000 media items
3. **Stories** (45% progress) - Active stories
4. **Tagged Media** (65% progress) - Up to 500 tagged posts
5. **Account Insights** (80% progress) - Analytics data
6. **File Generation** (95% progress)
7. **Completion** (100% progress)

#### Export Data Format:
```typescript
// Facebook Export
{
  user: FacebookUserInfo,
  posts: FacebookPost[],
  pages: FacebookPage[],
  likedPages: FacebookPage[],
  friends: FacebookFriend[],
  photos: FacebookPhoto[],
  exportedAt: string
}

// Instagram Export
{
  user: InstagramUser,
  media: InstagramMedia[],
  stories: InstagramStory[],
  taggedMedia: InstagramMedia[],
  insights: InstagramInsights,
  exportedAt: string
}
```

## Setup Requirements

### 1. Facebook Developer App Configuration

1. **Create Facebook App**:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create new app with "Consumer" type
   - Add Facebook Login product

2. **Configure OAuth Settings**:
   - Valid OAuth Redirect URIs: `https://yourdomain.com/auth/facebook/callback`
   - Add required permissions in App Review

3. **Instagram Integration**:
   - Add Instagram Basic Display product
   - Configure Instagram OAuth redirect URI

### 2. Environment Variables

Add to `/server/.env`:

```env
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### 3. Required Dependencies

Install Facebook OAuth dependencies:

```bash
cd server
npm install passport-facebook @types/passport-facebook
```

### 4. User Service Updates

The user service now supports multiple authentication providers:

```typescript
interface User {
  id: string;
  googleId?: string;      // YouTube authentication
  facebookId?: string;    // Facebook/Instagram authentication
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
  platform?: string;     // Tracks auth platform
  createdAt: Date;
  updatedAt: Date;
}
```

## API Permissions and Scopes

### Facebook Permissions Required:
- `email` - User's email address
- `public_profile` - Basic profile information
- `pages_show_list` - List of pages user manages
- `pages_read_engagement` - Page engagement metrics
- `user_posts` - User's posts
- `user_photos` - User's photos
- `user_likes` - Pages user has liked

### Instagram Permissions Required:
- `instagram_basic` - Basic Instagram profile and media
- `instagram_content_publish` - Access to Instagram content

## Rate Limiting

Both platforms implement rate limiting:
- **Facebook**: 200 requests per hour
- **Instagram**: 200 requests per hour

The services include automatic pagination and respect API rate limits with proper error handling.

## Error Handling

Comprehensive error handling includes:
- API rate limit errors
- Authentication failures
- Network timeouts
- Invalid permissions
- Data access restrictions

## Security Considerations

1. **Token Security**: Access tokens are stored securely and rotated appropriately
2. **Scope Minimization**: Only necessary permissions are requested
3. **Data Privacy**: User data is exported securely with proper user consent
4. **HTTPS Required**: All OAuth flows require HTTPS in production
5. **Token Expiration**: Proper handling of expired tokens with refresh mechanisms

## Testing

To test the integration:

1. **Start the development server**:
   ```bash
   cd server && npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd star-export-app && npm run dev
   ```

3. **Test authentication flow**:
   - Navigate to the dashboard
   - Click "Connect" on Facebook or Instagram platform cards
   - Complete OAuth flow
   - Verify platform shows as connected

4. **Test export functionality**:
   - Select export format (JSON/CSV)
   - Click "Export Data" for connected platform
   - Monitor export progress
   - Download completed export file

## Troubleshooting

### Common Issues:

1. **OAuth Redirect Mismatch**:
   - Ensure callback URLs match exactly in Facebook App settings
   - Check for trailing slashes and protocol (https://)

2. **Permission Denied Errors**:
   - Verify all required permissions are approved in Facebook App Review
   - Check user has granted necessary permissions during OAuth

3. **Rate Limit Errors**:
   - Implement exponential backoff
   - Reduce concurrent requests
   - Monitor API usage in Facebook Developer Console

4. **Token Expiration**:
   - Implement token refresh logic
   - Handle expired token errors gracefully
   - Prompt user to re-authenticate when needed

## Future Enhancements

Potential improvements:
1. **Real-time Data Sync**: WebSocket integration for live updates
2. **Incremental Exports**: Export only new data since last export
3. **Advanced Analytics**: More detailed insights and metrics
4. **Content Filtering**: Allow users to filter export data by date, type, etc.
5. **Batch Processing**: Background job processing for large exports
6. **Data Validation**: Enhanced data integrity checks
7. **Multi-format Support**: Additional export formats (XML, PDF, etc.)

## Support

For issues with the Facebook/Instagram integration:
1. Check Facebook Developer Console for API errors
2. Verify environment variables are set correctly
3. Review application logs for authentication errors
4. Test OAuth flow in Facebook's Graph API Explorer
5. Ensure all required permissions are granted and approved