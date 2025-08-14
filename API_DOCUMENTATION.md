# Star Export API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.starexport.com/api
```

## Authentication

Star Export uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <jwt-token>
```

## Rate Limiting

| Endpoint Type | Rate Limit | Window |
|--------------|------------|---------|
| Authentication | 5 requests | 1 second |
| Export | 10 requests | 1 second |
| General API | 100 requests | 1 minute |

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token",
    "refreshToken": "new-refresh-token"
  }
}
```

#### OAuth Login (Google)
```http
GET /api/auth/google
```
Redirects to Google OAuth consent screen.

**Callback:**
```http
GET /api/auth/google/callback?code=auth-code
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-14T10:00:00Z",
    "platforms": ["youtube", "facebook"]
  }
}
```

### Export Management

#### Start Export
```http
POST /api/export/start
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "platform": "youtube",
  "format": "json",
  "options": {
    "includeMedia": true,
    "dateRange": {
      "start": "2023-01-01",
      "end": "2023-12-31"
    },
    "maxRecords": 1000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "export123",
    "status": "queued",
    "platform": "youtube",
    "format": "json",
    "createdAt": "2024-01-14T10:00:00Z"
  }
}
```

#### Get Export Status
```http
GET /api/export/:jobId
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "export123",
    "status": "processing",
    "platform": "youtube",
    "format": "json",
    "progress": 45,
    "totalItems": 150,
    "processedItems": 67,
    "startedAt": "2024-01-14T10:00:00Z",
    "estimatedCompletion": "2024-01-14T10:15:00Z"
  }
}
```

#### List All Exports
```http
GET /api/export?page=1&limit=10&status=completed
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `status` (optional): Filter by status (queued, processing, completed, failed)
- `platform` (optional): Filter by platform

**Response:**
```json
{
  "success": true,
  "data": {
    "exports": [
      {
        "id": "export123",
        "platform": "youtube",
        "format": "json",
        "status": "completed",
        "progress": 100,
        "totalItems": 150,
        "createdAt": "2024-01-14T10:00:00Z",
        "completedAt": "2024-01-14T10:15:00Z",
        "downloadUrl": "/api/export/export123/download"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### Cancel Export
```http
POST /api/export/:jobId/cancel
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Export cancelled successfully"
}
```

#### Download Export
```http
GET /api/export/:jobId/download
Authorization: Bearer <jwt-token>
```

**Response:**
- Content-Type: `application/zip`
- Content-Disposition: `attachment; filename="youtube-export-2024-01-14.zip"`
- Binary file data

#### Get Export Statistics
```http
GET /api/export/stats/summary
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalExports": 45,
    "completedExports": 40,
    "failedExports": 3,
    "averageDuration": 300,
    "totalDataExported": "15.6GB",
    "exportsByPlatform": {
      "youtube": 20,
      "facebook": 15,
      "twitter": 10
    }
  }
}
```

### Platform Management

#### List Supported Platforms
```http
GET /api/platforms
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "youtube",
      "displayName": "YouTube",
      "authType": "oauth",
      "exportFormats": ["json", "csv"],
      "features": {
        "videos": true,
        "playlists": true,
        "comments": true,
        "analytics": false
      }
    },
    {
      "name": "facebook",
      "displayName": "Facebook",
      "authType": "oauth",
      "exportFormats": ["json", "csv", "html"],
      "features": {
        "posts": true,
        "photos": true,
        "messages": true,
        "friends": true
      }
    }
  ]
}
```

#### Connect Platform
```http
POST /api/platforms/:platform/connect
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "accessToken": "platform-access-token",
  "refreshToken": "platform-refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Platform connected successfully"
}
```

#### Disconnect Platform
```http
POST /api/platforms/:platform/disconnect
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Platform disconnected successfully"
}
```

#### Get Platform Status
```http
GET /api/platforms/:platform/status
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "lastSync": "2024-01-14T09:00:00Z",
    "tokenExpiry": "2024-02-14T10:00:00Z",
    "permissions": ["read_posts", "read_media"],
    "quotaUsage": {
      "used": 5000,
      "limit": 10000,
      "resetsAt": "2024-01-15T00:00:00Z"
    }
  }
}
```

### Health & Status

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": 86400,
    "services": {
      "database": "connected",
      "redis": "connected",
      "storage": "available"
    }
  }
}
```

## WebSocket Events

Connect to WebSocket for real-time updates:

```javascript
const socket = io('ws://localhost:5000', {
  auth: {
    token: 'jwt-token'
  }
});
```

### Events

#### Export Progress
```javascript
socket.on('export:progress', (data) => {
  console.log(data);
  // {
  //   jobId: 'export123',
  //   platform: 'youtube',
  //   progress: 45,
  //   processedItems: 67,
  //   totalItems: 150
  // }
});
```

#### Export Complete
```javascript
socket.on('export:complete', (data) => {
  console.log(data);
  // {
  //   jobId: 'export123',
  //   platform: 'youtube',
  //   downloadUrl: '/api/export/export123/download'
  // }
});
```

#### Export Failed
```javascript
socket.on('export:failed', (data) => {
  console.log(data);
  // {
  //   jobId: 'export123',
  //   platform: 'youtube',
  //   error: 'Rate limit exceeded'
  // }
});
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `PLATFORM_NOT_CONNECTED` | Platform not connected |
| `EXPORT_NOT_FOUND` | Export job not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INVALID_FORMAT` | Invalid export format |
| `QUOTA_EXCEEDED` | Platform quota exceeded |
| `EXPORT_FAILED` | Export process failed |

## Platform-Specific Notes

### YouTube
- Requires Google OAuth2 authentication
- Rate limit: 10,000 units per day
- Supports video downloads with yt-dlp fallback
- Maximum 50 items per API request

### Facebook
- Requires Facebook OAuth2 authentication
- Rate limit: 200 calls per hour
- May require browser automation for some data
- GDPR export available as fallback

### Twitter/X
- Rate limit: 500,000 tweets per month
- Limited to recent 3,200 tweets via API
- Archive download available for full history

### TikTok
- Uses browser automation
- Requires session cookies
- Rate limiting through request delays
- Mobile emulation for better compatibility

## Examples

### Complete Export Flow

```javascript
// 1. Authenticate
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com', 
    password: 'password' 
  })
});
const { token } = await loginResponse.json();

// 2. Start export
const exportResponse = await fetch('/api/export/start', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    platform: 'youtube',
    format: 'json',
    options: { includeMedia: true }
  })
});
const { jobId } = await exportResponse.json();

// 3. Monitor progress via WebSocket
socket.on('export:progress', (data) => {
  if (data.jobId === jobId) {
    console.log(`Progress: ${data.progress}%`);
  }
});

// 4. Download when complete
socket.on('export:complete', async (data) => {
  if (data.jobId === jobId) {
    window.location.href = `/api/export/${jobId}/download`;
  }
});
```