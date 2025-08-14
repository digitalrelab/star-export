# Star Export Server

Backend server for the Star Export application that handles YouTube data exports.

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Google OAuth credentials:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_SECRET=your_random_session_secret
   ```

3. **Get Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable YouTube Data API v3
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000/auth/youtube/callback` to authorized redirect URIs

## Development

Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `GET /auth/youtube` - Start YouTube OAuth flow
- `GET /auth/youtube/callback` - OAuth callback
- `POST /auth/logout` - Logout user
- `GET /auth/status` - Get auth status

### Export
- `POST /api/export` - Start export job
- `GET /api/status/:jobId` - Get export progress
- `DELETE /api/export/:jobId` - Cancel export
- `GET /api/history` - Get export history
- `GET /api/status/platform/:platform` - Get platform status

### Health
- `GET /health` - Health check

## Features

- YouTube OAuth2 authentication
- Export YouTube videos, playlists, and subscriptions
- Real-time export progress tracking
- JSON format exports
- In-memory data storage (production would use database)

## Next Steps

1. Add database integration (PostgreSQL + Prisma)
2. Add file storage for exports (AWS S3, local filesystem)
3. Add background job processing (Bull + Redis)
4. Add rate limiting and caching
5. Add more export formats (CSV, XML)
6. Add more platforms (Facebook, Instagram, etc.)