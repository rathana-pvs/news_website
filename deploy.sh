#!/bin/bash
# deploy.sh — Asian Dot Hybrid VPS PM2 Deployment Script
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Asian Dot (Hybrid VPS PM2)...${NC}"

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main || { echo -e "${RED}❌ Error: git pull failed.${NC}"; exit 1; }

# 2. Build production Next.js assets with memory limit
echo "🔨 Building production Next.js app..."
NODE_OPTIONS="--max-old-space-size=1536" npm run build

# 3. Reload PM2 process
echo "♻️  Reloading PM2 process..."
pm2 reload asiandot

# 4. Health Check
echo "🔥 Checking application health..."
max_attempts=12
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -s -f -H "Host: asiandot.com" http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✓ Application updated successfully!${NC}"
        break
    fi
    echo "⏳ Waiting for PM2 app to respond (attempt $attempt/$max_attempts)..."
    sleep 3
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo -e "${RED}❌ Deployment health check failed. View logs using: pm2 logs asiandot${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PM2 Deployment complete!${NC}"
