# Star Export Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [Cloud Deployments](#cloud-deployments)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoring Setup](#monitoring-setup)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- PostgreSQL 14+ (or use Docker)
- Redis 6+ (or use Docker)
- 4GB RAM minimum
- 20GB disk space

### Required Accounts
- Google Cloud Console (for YouTube API)
- Facebook Developer Account
- Domain name (for production)
- SSL certificate (Let's Encrypt recommended)

## Local Development

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd star-export

# Setup environment
make setup

# Start development stack
make dev

# Run migrations
make db-migrate-dev

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# pgAdmin: http://localhost:8080
# Redis Commander: http://localhost:8081
```

### Development Configuration

#### docker-compose.dev.yml
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./star-export-app
      dockerfile: Dockerfile.dev
    volumes:
      - ./star-export-app:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://localhost:5000/api

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile.dev
    volumes:
      - ./server:/app
      - /app/node_modules
    ports:
      - "5000:5000"
      - "9229:9229" # Debug port
    environment:
      - NODE_ENV=development
```

## Production Deployment

### 1. Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 2. SSL Certificate Setup

```bash
# Obtain certificate
sudo certbot certonly --nginx -d starexport.com -d www.starexport.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 3. Nginx Configuration

```nginx
# /etc/nginx/sites-available/starexport
server {
    listen 80;
    server_name starexport.com www.starexport.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name starexport.com www.starexport.com;

    ssl_certificate /etc/letsencrypt/live/starexport.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/starexport.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 4. Production Environment Setup

```bash
# Create production directory
mkdir -p /opt/star-export
cd /opt/star-export

# Clone repository
git clone <repository-url> .

# Create production .env files
cp .env.example .env.production
cp star-export-app/.env.example star-export-app/.env.production
cp server/.env.example server/.env.production

# Edit environment files
nano .env.production
```

#### Production Environment Variables

```env
# .env.production
NODE_ENV=production

# Database
POSTGRES_USER=starexport_prod
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=starexport_production

# Redis
REDIS_PASSWORD=<strong-redis-password>

# Backup
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE="0 2 * * *"
```

```env
# server/.env.production
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://starexport_prod:<password>@postgres:5432/starexport_production

# Redis
REDIS_URL=redis://:<password>@redis:6379

# Security
JWT_SECRET=<generate-strong-secret>
ENCRYPTION_KEY=<generate-32-char-key>

# OAuth (Production)
GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-secret>

# Storage
EXPORT_STORAGE_PATH=/data/exports
MAX_EXPORT_SIZE_MB=10000
```

### 5. Deploy with Docker Compose

```bash
# Build and start production stack
docker-compose -f docker-compose.yml up -d --build

# Run database migrations
docker-compose exec backend npm run prisma:migrate:deploy

# Check logs
docker-compose logs -f

# Verify health
curl https://starexport.com/api/health
```

### 6. Production docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./star-export-app
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3001:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    restart: always
    ports:
      - "5001:5000"
    env_file:
      - ./server/.env.production
    volumes:
      - export_data:/data/exports
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    restart: always
    env_file:
      - .env.production
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $POSTGRES_USER"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
  export_data:
```

## Cloud Deployments

### AWS Deployment

#### 1. Using AWS ECS

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ecr-uri>

docker build -t star-export-frontend ./star-export-app
docker tag star-export-frontend:latest <ecr-uri>/star-export-frontend:latest
docker push <ecr-uri>/star-export-frontend:latest

docker build -t star-export-backend ./server
docker tag star-export-backend:latest <ecr-uri>/star-export-backend:latest
docker push <ecr-uri>/star-export-backend:latest
```

#### 2. ECS Task Definition

```json
{
  "family": "star-export",
  "taskRoleArn": "arn:aws:iam::123456789:role/ecsTaskRole",
  "executionRoleArn": "arn:aws:iam::123456789:role/ecsExecutionRole",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<ecr-uri>/star-export-backend:latest",
      "memory": 1024,
      "cpu": 512,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:database-url"
        }
      ]
    }
  ]
}
```

### Google Cloud Platform

#### 1. Using Cloud Run

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/star-export-backend ./server
gcloud builds submit --tag gcr.io/PROJECT-ID/star-export-frontend ./star-export-app

# Deploy backend
gcloud run deploy star-export-backend \
  --image gcr.io/PROJECT-ID/star-export-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars NODE_ENV=production \
  --set-secrets DATABASE_URL=database-url:latest

# Deploy frontend
gcloud run deploy star-export-frontend \
  --image gcr.io/PROJECT-ID/star-export-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Kubernetes Deployment

#### 1. Kubernetes Manifests

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: star-export-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: star-export-backend
  template:
    metadata:
      labels:
        app: star-export-backend
    spec:
      containers:
      - name: backend
        image: star-export/backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: star-export-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd server && npm ci
          cd ../star-export-app && npm ci
          
      - name: Run tests
        run: |
          cd server && npm test
          cd ../star-export-app && npm test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t star-export-backend ./server
          docker build -t star-export-frontend ./star-export-app
          
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag star-export-backend:latest ${{ secrets.DOCKER_REGISTRY }}/star-export-backend:latest
          docker tag star-export-frontend:latest ${{ secrets.DOCKER_REGISTRY }}/star-export-frontend:latest
          docker push ${{ secrets.DOCKER_REGISTRY }}/star-export-backend:latest
          docker push ${{ secrets.DOCKER_REGISTRY }}/star-export-frontend:latest
          
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/star-export
            docker-compose pull
            docker-compose up -d
            docker-compose exec backend npm run prisma:migrate:deploy
```

## Monitoring Setup

### 1. Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'star-export-backend'
    static_configs:
      - targets: ['backend:5000']
    metrics_path: '/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
      
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### 2. Grafana Dashboards

```json
{
  "dashboard": {
    "title": "Star Export Monitoring",
    "panels": [
      {
        "title": "API Request Rate",
        "targets": [{
          "expr": "rate(http_requests_total[5m])"
        }]
      },
      {
        "title": "Export Job Success Rate",
        "targets": [{
          "expr": "rate(export_jobs_total{status='completed'}[1h]) / rate(export_jobs_total[1h])"
        }]
      },
      {
        "title": "Database Connections",
        "targets": [{
          "expr": "pg_stat_database_numbackends"
        }]
      }
    ]
  }
}
```

### 3. Alerts Configuration

```yaml
# alerts.yml
groups:
  - name: star-export
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          
      - alert: ExportQueueBacklog
        expr: bull_queue_waiting_count > 100
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Export queue backlog growing"
          
      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
```

## Backup and Recovery

### 1. Automated Backups

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"

# Database backup
docker-compose exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Redis backup
docker-compose exec -T redis redis-cli --rdb $BACKUP_DIR/redis_$DATE.rdb

# Export files backup
tar -czf $BACKUP_DIR/exports_$DATE.tar.gz /data/exports

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://star-export-backups/
aws s3 cp $BACKUP_DIR/redis_$DATE.rdb s3://star-export-backups/
aws s3 cp $BACKUP_DIR/exports_$DATE.tar.gz s3://star-export-backups/

# Clean old backups
find $BACKUP_DIR -mtime +30 -delete
```

### 2. Recovery Procedures

```bash
# Restore database
gunzip < backup.sql.gz | docker-compose exec -T postgres psql -U $POSTGRES_USER $POSTGRES_DB

# Restore Redis
docker-compose exec -T redis redis-cli --rdb /backup/redis_backup.rdb

# Restore export files
tar -xzf exports_backup.tar.gz -C /data/exports
```

## Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Check resource usage
docker stats

# Verify environment variables
docker-compose config
```

#### 2. Database Connection Issues
```bash
# Test connection
docker-compose exec backend npm run prisma:studio

# Check PostgreSQL logs
docker-compose logs postgres

# Verify credentials
docker-compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
```

#### 3. Export Jobs Stuck
```bash
# Check Redis
docker-compose exec redis redis-cli
> KEYS bull:exports:*
> HGETALL bull:exports:1

# Clear stuck jobs
docker-compose exec backend npm run queue:clean
```

#### 4. High Memory Usage
```bash
# Check memory usage
docker stats

# Limit container memory
docker-compose up -d --scale worker=2

# Clear old exports
find /data/exports -mtime +30 -delete
```

### Performance Tuning

#### 1. PostgreSQL Optimization
```sql
-- Adjust connection pool
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Restart PostgreSQL
SELECT pg_reload_conf();
```

#### 2. Redis Optimization
```bash
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

#### 3. Node.js Optimization
```javascript
// PM2 ecosystem.config.js
module.exports = {
  apps: [{
    name: 'star-export-backend',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=2048'
    }
  }]
};
```