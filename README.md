# 🌟 Starchive - Personal Data Liberation Platform

**Export all your social media content with one click.**

Starchive empowers you to reclaim your digital memories from major social platforms using official APIs, GDPR data rights, and advanced export techniques.

## ✨ Features

### One-Click Export
- Export from all connected platforms simultaneously
- Real-time progress tracking
- Background processing with job queue

### Platform Support
- **YouTube** - Videos, playlists, comments, metadata
- **Facebook** - Posts, photos, videos, messages
- **Instagram** - Posts, stories, reels, comments
- **TikTok** - Videos, profile data, liked content
- **Twitter/X** - Tweets, media, likes, bookmarks
- **Snapchat** - Memories, stories

### Export Options
- **Direct Download** - Organized ZIP files
- **Cloud Storage** - Google Drive, Dropbox, OneDrive
- **Custom Endpoint** - Send to your API
- **Multiple Formats** - JSON, CSV, HTML

### Security & Privacy
- OAuth2 authentication
- Encrypted token storage
- GDPR/CCPA compliant
- Self-hosting option

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/star-export.git
cd star-export

# Setup environment
make setup
# Edit .env files with your credentials

# Start development environment
make dev

# Run database migrations
make db-migrate-dev

# Access the app
# Frontend: http://localhost:3000
# API: http://localhost:5000
```

### Manual Setup

#### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- yt-dlp (for video downloads)

#### Frontend Setup
```bash
cd star-export-app
npm install
npm run dev
```

#### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure environment variables
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## 🔧 Configuration

### Required API Keys

1. **Google OAuth** (for YouTube)
   - Create project at [Google Cloud Console](https://console.cloud.google.com)
   - Enable YouTube Data API v3
   - Create OAuth 2.0 credentials

2. **Facebook App** (for Facebook/Instagram)
   - Create app at [Facebook Developers](https://developers.facebook.com)
   - Add Facebook Login product
   - Configure OAuth redirect URIs

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/starexport

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=32-character-key

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

## 📚 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│   Express API   │────▶│   PostgreSQL    │
│   (Vite)        │     │   (TypeScript)  │     │   Database      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                         
                               ▼                         
                        ┌─────────────────┐     ┌─────────────────┐
                        │   Bull Queue    │────▶│     Redis       │
                        │   (Jobs)        │     │     Cache       │
                        └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │    Export       │
                        │   Services      │
                        │  - yt-dlp       │
                        │  - APIs         │
                        │  - Playwright   │
                        └─────────────────┘
```

## 🛠️ Development

### Project Structure
```
star-export/
├── star-export-app/       # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── store/         # Zustand state
│   └── ...
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utilities
│   └── ...
├── docker-compose.yml     # Docker setup
└── Makefile              # Common commands
```

### Key Technologies
- **Frontend**: React, TypeScript, Vite, TailwindCSS, Zustand
- **Backend**: Node.js, Express, TypeScript, Prisma, Bull
- **Database**: PostgreSQL, Redis
- **Export**: yt-dlp, Playwright, Platform APIs
- **Infrastructure**: Docker, Nginx

### Available Commands

```bash
# Development
make dev              # Start development environment
make logs             # View application logs
make shell-backend    # Access backend shell
make test             # Run test suite

# Database
make db-migrate-dev   # Run migrations
make db-studio        # Open Prisma Studio
make backup-db        # Backup database

# Production
make prod             # Start production environment
make build            # Build for production
make deploy           # Deploy to production
```

## 🔒 Security

- All tokens encrypted with AES-256-GCM
- JWT authentication with refresh tokens
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS and security headers configured
- Regular dependency updates

## 📖 API Documentation

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/google
POST /api/auth/refresh
```

### Export Management
```http
POST /api/export/start
GET  /api/export/:id
GET  /api/export
POST /api/export/:id/cancel
GET  /api/export/:id/download
```

### Platform Integration
```http
GET  /api/platforms
POST /api/platforms/:platform/connect
POST /api/platforms/:platform/disconnect
GET  /api/platforms/:platform/status
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for video downloads
- [Playwright](https://playwright.dev/) for browser automation
- Platform APIs for official data access

## ⚠️ Disclaimer

This tool is designed for exporting your own personal data. Always respect platform terms of service and only export content you have rights to access. The developers are not responsible for misuse of this tool.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/star-export/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/star-export/discussions)
- **Security**: security@starexport.com

---

Made with ❤️ for digital sovereignty