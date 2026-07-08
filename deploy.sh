#!/bin/bash
# deploy.sh — Run this on your VPS to deploy/update Asian Dot
# Usage: bash deploy.sh
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Asian Dot...${NC}"

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main || { echo -e "${RED}❌ Error: git pull failed. Resolve conflicts or verify SSH key access.${NC}"; exit 1; }

# 2. Build the new image
echo "🔨 Building Docker image..."
docker compose -f docker-compose.prod.yml build app

# 3. Restart app container with zero-downtime (DB stays up)
echo "♻️  Restarting app container..."
docker compose -f docker-compose.prod.yml up -d --no-deps app

# 4. Remove dangling images to save disk space
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

# 5. Run health check
echo "🔥 Warming cache and checking health..."
max_attempts=12
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -s -f -H "Host: asiandot.com" http://localhost > /dev/null; then
        echo -e "${GREEN}✓ Application updated successfully!${NC}"
        break
    fi
    echo "⏳ Waiting for app container to start (attempt $attempt/$max_attempts)..."
    sleep 5
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo -e "${RED}❌ Deployment health check failed. View logs using:${NC}"
    echo "   docker compose -f docker-compose.prod.yml logs -f app"
    exit 1
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
