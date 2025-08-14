# Star Export Development Guide

## 🚀 Project Overview

Star Export (Starchive) is a comprehensive web application that enables users to export their personal data from major social media platforms. Built with React, TypeScript, and Node.js, it provides a seamless one-click export experience while respecting platform terms of service and leveraging legal data portability rights.

## 📁 Project Structure

```
star-export/
├── star-export-app/          # Frontend (Vite + React + TypeScript)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── config/          # Platform & API configurations
│   │   ├── contexts/        # React contexts (Theme)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── router/          # React Router setup
│   │   ├── services/        # API service layer
│   │   ├── store/           # Zustand state management
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── server/                  # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/          # Server configurations
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic & exporters
│   │   └── utils/           # Server utilities
│   ├── prisma/              # Database schema
│   └── package.json
├── nginx/                   # Reverse proxy configuration
├── docker-compose.yml       # Docker orchestration
├── docker-compose.dev.yml   # Development Docker setup
└── Makefile                # Common commands

```

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS v4 with PostCSS
- **State Management**: Zustand for simple, powerful state
- **Routing**: React Router v7 with lazy loading
- **HTTP Client**: Axios with interceptors
- **Data Fetching**: TanStack Query (React Query v5)
- **WebSocket**: Socket.IO client for real-time updates
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Bull with Redis for background jobs
- **Authentication**: Passport.js with JWT
- **WebSocket**: Socket.IO for real-time communication
- **Security**: Helmet, CORS, rate limiting
- **Export Tools**: 
  - yt-dlp for video downloads
  - Playwright for browser automation
  - Platform APIs for official data access

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Development**: Hot reload for both frontend and backend
- **Testing**: Jest for unit tests, Playwright for E2E

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)
- yt-dlp (for video downloads)

### Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd star-export

# Setup environment
make setup

# Configure your .env files
# Edit .env, star-export-app/.env, and server/.env

# Start development environment
make dev

# Run database migrations
make db-migrate-dev

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# pgAdmin: http://localhost:8080
# Redis Commander: http://localhost:8081
```

### Manual Setup

#### Frontend Setup
```bash
cd star-export-app
npm install
cp .env.example .env
# Configure environment variables
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

### Environment Variables

#### Root `.env`
```env
# Docker Compose Configuration
POSTGRES_USER=starexport
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=starexport
REDIS_PASSWORD=your-redis-password
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=your-pgadmin-password
```

#### Frontend `.env` (star-export-app/.env)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000

# Environment
VITE_NODE_ENV=development
```

#### Backend `.env` (server/.env)
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://starexport:password@localhost:5432/starexport

# Redis
REDIS_URL=redis://:password@localhost:6379

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=32-character-encryption-key

# OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Export Configuration
EXPORT_STORAGE_PATH=./exports
MAX_EXPORT_SIZE_MB=5000
EXPORT_RETENTION_DAYS=30
```

## 🏗️ Architecture Details

### Frontend Architecture

#### State Management (Zustand)
```typescript
// Store structure
interface Store {
  // Auth State
  authState: AuthState;
  tokens: Record<string, string>;
  
  // Export State
  jobs: ExportJob[];
  isExporting: boolean;
  currentJobId: string | null;
  
  // UI State
  selectedPlatform: PlatformConfig | null;
  exportFormat: ExportFormat;
  notifications: Notification[];
  
  // Actions
  setToken: (platform: string, token: string) => void;
  removeToken: (platform: string) => void;
  addJob: (job: ExportJob) => void;
  updateJob: (jobId: string, updates: Partial<ExportJob>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
}
```

#### Component Hierarchy
```
App
├── QueryClientProvider
├── ThemeProvider
└── Router
    └── Layout
        ├── Sidebar
        │   ├── Navigation
        │   └── UserInfo
        ├── TopBar
        │   ├── ThemeToggle
        │   └── Notifications
        └── Pages
            ├── Dashboard
            │   ├── DashboardStats
            │   ├── QuickExport
            │   └── PlatformGrid
            ├── ExportPage
            ├── HistoryPage
            ├── SettingsPage
            └── AuthPage
```

#### Key Hooks
- `useAuth`: Authentication management
- `useExport`: Export job management
- `useTheme`: Theme switching (light/dark)

### Backend Architecture

#### API Routes
```
/api/auth
  POST   /register         - User registration
  POST   /login           - User login
  GET    /google          - Google OAuth
  GET    /google/callback - OAuth callback
  POST   /refresh         - Refresh JWT token
  GET    /me             - Current user info

/api/export
  POST   /start          - Start new export
  GET    /:id            - Get export status
  GET    /              - List all exports
  POST   /:id/cancel    - Cancel export
  GET    /:id/download  - Download export
  GET    /stats/summary - Export statistics

/api/platforms
  GET    /              - List supported platforms
  POST   /:platform/connect    - Connect platform
  POST   /:platform/disconnect - Disconnect platform
  GET    /:platform/status     - Platform status

/api/health
  GET    /              - Health check
```

#### Export Engine

The export engine uses a job queue system with Bull and Redis:

```typescript
// Job Queue Structure
interface ExportJob {
  id: string;
  userId: string;
  platform: string;
  format: ExportFormat;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalItems?: number;
  processedItems?: number;
  resultUrl?: string;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}
```

#### Export Services

1. **YouTube Export Service**
   - Uses YouTube Data API v3
   - Falls back to yt-dlp for video downloads
   - Supports playlists, liked videos, subscriptions

2. **Facebook Export Service**
   - Uses Playwright for browser automation
   - Handles authentication via cookies
   - Exports posts, photos, friend lists

3. **TikTok Export Service**
   - Browser automation with anti-detection
   - Mobile emulation for better compatibility
   - Exports videos, profile data, liked content

### Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  
  platforms Platform[]
  exports   Export[]
}

model Platform {
  id           String   @id @default(cuid())
  type         String
  accessToken  String   @db.Text // encrypted
  refreshToken String?  @db.Text // encrypted
  expiresAt    DateTime?
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, type])
}

model Export {
  id          String   @id @default(cuid())
  platform    String
  format      String
  status      String
  progress    Int      @default(0)
  totalItems  Int?
  metadata    Json?
  startedAt   DateTime?
  completedAt DateTime?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
}
```

## 🔐 Security Implementation

### Token Encryption
- All OAuth tokens encrypted with AES-256-GCM
- Secure key derivation using crypto.scrypt
- Authentication tags for integrity verification

### API Security
- JWT authentication with refresh tokens
- Rate limiting per endpoint
- CORS configuration
- Input validation and sanitization
- XSS protection via HTML sanitization

### Best Practices
- Environment variables for secrets
- HTTPS only in production
- Secure cookie handling
- API key hashing for webhooks
- Regular dependency updates

## 🧪 Testing

### Unit Tests
```bash
# Frontend tests
cd star-export-app
npm test

# Backend tests
cd server
npm test
```

### E2E Tests
```bash
# Run Playwright tests
npm run test:e2e
```

## 🚢 Deployment

### Production Build
```bash
# Build everything
make build

# Or individually:
# Frontend
cd star-export-app
npm run build

# Backend
cd server
npm run build
```

### Docker Production
```bash
# Start production stack
make prod

# View logs
make logs

# Check health
make health
```

### Deployment Checklist
- [ ] Set production environment variables
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure domain and DNS
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Test all export functions
- [ ] Verify rate limiting
- [ ] Check security headers

## 📊 Monitoring

### Health Checks
- Frontend: `GET /health`
- Backend: `GET /api/health`
- Database: Connection pool monitoring
- Redis: Queue health checks

### Metrics to Track
- Export success/failure rates
- Average export duration
- Platform connection status
- API response times
- Error rates by endpoint

## 🐛 Troubleshooting

### Common Issues

1. **Docker containers not starting**
   ```bash
   # Check logs
   docker-compose logs -f [service-name]
   
   # Rebuild containers
   make rebuild
   ```

2. **Database connection errors**
   ```bash
   # Check PostgreSQL is running
   docker-compose ps postgres
   
   # Verify connection string
   # Ensure DATABASE_URL is correct
   ```

3. **Export failures**
   - Check platform tokens are valid
   - Verify rate limits aren't exceeded
   - Check disk space for exports
   - Review job queue logs

4. **Frontend build issues**
   ```bash
   # Clear cache
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🤝 Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes following code style
3. Write/update tests
4. Run linters: `npm run lint`
5. Commit with descriptive message
6. Push and create pull request

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful variable names
- Add JSDoc comments for complex functions

## 📚 Additional Resources

### Platform Documentation
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)
- [Reddit API](https://www.reddit.com/dev/api)

### Libraries Documentation
- [React](https://react.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Prisma](https://www.prisma.io/docs)
- [Bull Queue](https://github.com/OptimalBits/bull)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [Playwright](https://playwright.dev/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.