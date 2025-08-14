# Technical Implementation Plan

## Project Structure
```
star-export/
├── client/                 # Vite + React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API clients
│   │   ├── store/         # Zustand state
│   │   ├── utils/         # Helper functions
│   │   └── App.tsx        # Main app
│   ├── public/
│   └── vite.config.ts
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── api/           # REST endpoints
│   │   ├── auth/          # OAuth strategies
│   │   ├── jobs/          # Background workers
│   │   ├── services/      # Platform integrations
│   │   └── app.ts         # Express app
│   └── package.json
├── shared/                 # Shared types/utils
└── docker-compose.yml      # Local dev setup
```

## Phase 1: Foundation (Week 1)

### 1.1 Project Setup
```bash
# Initialize monorepo
npm init -y
npm install -D lerna nx

# Create Vite React app
npm create vite@latest client -- --template react-ts
cd client && npm install

# Setup backend
mkdir server && cd server
npm init -y
npm install express cors helmet
npm install -D typescript @types/node @types/express
```

### 1.2 Core Dependencies

**Frontend:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.5",
    "react-hook-form": "^7.48.2",
    "tailwindcss": "^3.4.0",
    "@headlessui/react": "^1.7.17",
    "lucide-react": "^0.309.0"
  }
}
```

**Backend:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-facebook": "^3.0.0",
    "bull": "^4.12.0",
    "ioredis": "^5.3.2",
    "prisma": "^5.8.0",
    "@prisma/client": "^5.8.0",
    "socket.io": "^4.6.0",
    "yt-dlp-exec": "^0.4.0",
    "playwright": "^1.40.0"
  }
}
```

### 1.3 Database Schema
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
  type         String   // youtube, facebook, etc
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
  status      String   // queued, processing, completed, failed
  progress    Int      @default(0)
  totalItems  Int?
  metadata    Json?
  startedAt   DateTime?
  completedAt DateTime?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
}
```

## Phase 2: Authentication (Week 2)

### 2.1 OAuth2 Setup
```typescript
// server/src/auth/strategies/google.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly']
}, async (accessToken, refreshToken, profile, done) => {
  // Store tokens encrypted
  const user = await saveUserAndTokens(profile, accessToken, refreshToken);
  return done(null, user);
}));
```

### 2.2 Frontend Auth Flow
```typescript
// client/src/hooks/useAuth.ts
export const useAuth = () => {
  const { user, setUser } = useStore();
  
  const connectPlatform = async (platform: string) => {
    window.location.href = `/api/auth/${platform}`;
  };
  
  const disconnect = async (platform: string) => {
    await api.delete(`/api/auth/${platform}`);
    // Update local state
  };
  
  return { user, connectPlatform, disconnect };
};
```

## Phase 3: Export Engine (Week 3)

### 3.1 Job Queue System
```typescript
// server/src/jobs/exportQueue.ts
import Bull from 'bull';
import { exportYouTube } from '../services/youtube';
import { exportFacebook } from '../services/facebook';

export const exportQueue = new Bull('exports', {
  redis: process.env.REDIS_URL
});

exportQueue.process(async (job) => {
  const { userId, platform, exportId } = job.data;
  
  // Update status
  await updateExportStatus(exportId, 'processing');
  
  // Platform-specific export
  switch (platform) {
    case 'youtube':
      await exportYouTube(userId, exportId, job);
      break;
    case 'facebook':
      await exportFacebook(userId, exportId, job);
      break;
    // ... other platforms
  }
});
```

### 3.2 YouTube Export Service
```typescript
// server/src/services/youtube.ts
import { google } from 'googleapis';
import ytDlpExec from 'yt-dlp-exec';

export async function exportYouTube(userId: string, exportId: string, job: Job) {
  const tokens = await getDecryptedTokens(userId, 'youtube');
  const youtube = google.youtube('v3');
  
  // Get user's videos
  const videos = await youtube.search.list({
    auth: tokens,
    part: ['snippet'],
    forMine: true,
    type: 'video',
    maxResults: 50
  });
  
  // Download each video
  for (const video of videos.data.items) {
    await ytDlpExec(`https://youtube.com/watch?v=${video.id.videoId}`, {
      output: `exports/${exportId}/%(title)s.%(ext)s`,
      writeInfoJson: true,
      format: 'best'
    });
    
    // Update progress
    job.progress(completed / total * 100);
  }
}
```

### 3.3 WebSocket Progress Updates
```typescript
// server/src/websocket.ts
import { Server } from 'socket.io';

export function setupWebSocket(server: HttpServer) {
  const io = new Server(server, { cors: { origin: '*' } });
  
  exportQueue.on('progress', (job, progress) => {
    io.to(job.data.userId).emit('export:progress', {
      exportId: job.data.exportId,
      platform: job.data.platform,
      progress
    });
  });
}
```

## Phase 4: Frontend UI (Week 4)

### 4.1 Main Dashboard Component
```tsx
// client/src/components/Dashboard.tsx
export function Dashboard() {
  const { platforms, exports } = useStore();
  const { connectPlatform, startExport } = useExports();
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Data Export Dashboard</h1>
      
      {/* One-Click Export */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <button
          onClick={() => startExport('all')}
          className="w-full bg-blue-600 text-white py-4 rounded-lg text-xl font-semibold"
        >
          Export All My Data
        </button>
      </div>
      
      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLATFORMS.map(platform => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            connected={platforms.includes(platform.id)}
            onConnect={() => connectPlatform(platform.id)}
            onExport={() => startExport(platform.id)}
          />
        ))}
      </div>
      
      {/* Export Progress */}
      <ExportProgress exports={exports} />
    </div>
  );
}
```

### 4.2 Platform Card Component
```tsx
// client/src/components/PlatformCard.tsx
export function PlatformCard({ platform, connected, onConnect, onExport }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <img src={platform.icon} className="w-12 h-12 mr-4" />
        <h3 className="text-xl font-semibold">{platform.name}</h3>
      </div>
      
      {connected ? (
        <button
          onClick={onExport}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Export Data
        </button>
      ) : (
        <button
          onClick={onConnect}
          className="w-full bg-gray-800 text-white py-2 rounded"
        >
          Connect Account
        </button>
      )}
    </div>
  );
}
```

## Phase 5: Advanced Features (Week 5)

### 5.1 yt-dlp Integration
```typescript
// server/src/services/ytdlp.ts
export class YtDlpService {
  async downloadVideo(url: string, outputPath: string, cookies?: string) {
    const options = {
      output: outputPath,
      writeInfoJson: true,
      writeDescription: true,
      writeThumbnail: true,
      format: 'best',
      ...(cookies && { cookies })
    };
    
    return ytDlpExec(url, options);
  }
  
  async extractInfo(url: string) {
    return ytDlpExec(url, {
      dumpJson: true,
      noDownload: true
    });
  }
}
```

### 5.2 Browser Automation for TikTok
```typescript
// server/src/services/tiktok.ts
import { chromium } from 'playwright';

export class TikTokExporter {
  async export(sessionCookie: string, userId: string) {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    
    // Add session cookie
    await context.addCookies([{
      name: 'sessionid',
      value: sessionCookie,
      domain: '.tiktok.com',
      path: '/'
    }]);
    
    const page = await context.newPage();
    await page.goto(`https://www.tiktok.com/@${userId}`);
    
    // Extract video URLs
    const videos = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href*="/video/"]'))
        .map(a => a.href);
    });
    
    // Download with yt-dlp
    for (const videoUrl of videos) {
      await this.ytdlp.downloadVideo(videoUrl, outputPath);
    }
  }
}
```

## Deployment Strategy

### Docker Compose for Development
```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: starexport
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
  
  app:
    build: .
    ports:
      - "3000:3000"
      - "5173:5173"
    environment:
      DATABASE_URL: postgresql://postgres:secret@postgres:5432/starexport
      REDIS_URL: redis://redis:6379
    depends_on:
      - redis
      - postgres
```

### Production Deployment
1. **Frontend**: Vercel/Netlify for React app
2. **Backend**: Railway/Render with workers
3. **Queue**: Redis Cloud
4. **Database**: Neon/Supabase PostgreSQL
5. **Storage**: User's choice (local/cloud)

## Security Checklist
- [ ] OAuth tokens encrypted at rest
- [ ] HTTPS only in production
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all forms
- [ ] CORS properly configured
- [ ] No secrets in frontend code
- [ ] Regular dependency updates
- [ ] Audit logging for exports

## Performance Optimizations
1. **Parallel Exports**: Process multiple platforms simultaneously
2. **Chunked Downloads**: Stream large files to avoid memory issues
3. **Progress Caching**: Store progress in Redis for resume capability
4. **CDN for Assets**: Serve static files from edge locations
5. **Database Indexes**: Optimize queries for user exports

## Next Steps
1. Set up development environment
2. Implement basic auth flow
3. Create YouTube exporter as proof of concept
4. Add remaining platforms iteratively
5. Polish UI and error handling
6. Beta test with small user group
7. Launch!