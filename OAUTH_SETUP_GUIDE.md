# OAuth Setup Guide

This guide will help you configure real OAuth credentials for the Star Export application.

## Prerequisites

1. **Google Account** - for YouTube API access
2. **Facebook Developer Account** - for Facebook/Instagram API access
3. **Domain/Hosting** - for production redirect URIs (optional for development)

## 1. Google OAuth Setup (YouTube API)

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### Step 2: Enable YouTube Data API v3
1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for "YouTube Data API v3"
3. Click on it and click **Enable**

### Step 3: Create OAuth 2.0 Credentials
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** for user type
   - Fill in app name, user support email, and developer contact
   - Add scopes: `../auth/youtube.readonly`, `../auth/userinfo.email`, `../auth/userinfo.profile`
4. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: "Star Export App"
   - Authorized redirect URIs:
     - Development: `http://localhost:3001/auth/youtube/callback`
     - Production: `https://yourdomain.com/auth/youtube/callback`

### Step 4: Copy Credentials
1. Copy the **Client ID** and **Client Secret**
2. Update your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_actual_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
   ```

## 2. Facebook OAuth Setup (Facebook/Instagram API)

### Step 1: Create a Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Choose **Consumer** as app type
4. Fill in app details and create

### Step 2: Add Facebook Login Product
1. In your app dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **Web** platform

### Step 3: Configure Facebook Login
1. Go to **Facebook Login > Settings**
2. Add Valid OAuth Redirect URIs:
   - Development: `http://localhost:3001/auth/facebook/callback`
   - Production: `https://yourdomain.com/auth/facebook/callback`

### Step 4: Configure App Permissions
1. Go to **App Review > Permissions and Features**
2. Request the following permissions:
   - `email` (default)
   - `public_profile` (default)
   - `pages_show_list` (for Facebook pages)
   - `pages_read_engagement` (for page insights)
   - `user_posts` (for user posts)
   - `user_photos` (for user photos)
   - `instagram_basic` (for Instagram basic access)
   - `instagram_content_publish` (for Instagram content)

### Step 5: Get App Credentials
1. Go to **Settings > Basic**
2. Copy the **App ID** and **App Secret**
3. Update your `.env` file:
   ```
   FACEBOOK_APP_ID=your_actual_facebook_app_id_here
   FACEBOOK_APP_SECRET=your_actual_facebook_app_secret_here
   ```

## 3. Generate Session Secret

Generate a secure session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update your `.env` file:
```
SESSION_SECRET=your_generated_32_character_secret_here
```

## 4. Environment Configuration

Your final `.env` file should look like:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google OAuth (YouTube API)
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_secret_here

# Facebook OAuth (Facebook/Instagram API)
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=your_actual_facebook_secret_here

# Session Secret
SESSION_SECRET=your_32_character_random_string_here
```

## 5. Testing OAuth Flow

### For Development:
1. Start your server: `npm run dev`
2. Start your frontend: `npm run dev` (in the frontend directory)
3. Navigate to `http://localhost:5173`
4. Try connecting to YouTube or Facebook platforms

### For Production:
1. Update redirect URIs in both Google and Facebook consoles
2. Update `FRONTEND_URL` in your production environment
3. Deploy your application

## 6. Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - Ensure redirect URIs match exactly in OAuth console and your app
   - Check for trailing slashes and HTTP vs HTTPS

2. **"invalid_client" error**
   - Verify client ID and secret are correct
   - Check that API is enabled (for Google)

3. **Permission denied errors**
   - Ensure all required permissions are requested and approved
   - For Facebook, some permissions require app review

4. **CORS issues**
   - Ensure your frontend URL is properly configured
   - Check that your server is running on the correct port

### Debug Mode:
Add this to your `.env` for more detailed OAuth logs:
```
DEBUG=passport:*
```

## 7. Security Notes

- **Never commit real credentials to version control**
- Use environment variables for all sensitive data
- Rotate secrets regularly
- Use HTTPS in production
- Implement proper error handling and logging
- Consider implementing rate limiting for OAuth endpoints

## 8. Additional Platform Setup

To add more platforms (Twitter, Reddit, GitHub), you'll need to:

1. Register apps with respective platforms
2. Add OAuth strategies to `server/src/auth/passport.ts`
3. Update environment configuration
4. Add redirect URI handlers

This setup guide provides the foundation for a fully functional OAuth system that can securely handle user authentication across multiple social media platforms.