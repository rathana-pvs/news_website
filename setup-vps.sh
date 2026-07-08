#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Asian Dot Automated VPS Setup...${NC}"

# 1. Install Docker if not present
if ! [ -x "$(command -v docker)" ]; then
    echo "📦 Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo -e "${GREEN}✓ Docker is already installed.${NC}"
fi

# 2. Check for .env file
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file is missing!${NC}"
    echo "Please copy your production .env file to the VPS root folder first."
    echo "Run this locally in a separate terminal tab:"
    echo -e "${GREEN}scp .env root@YOUR_VPS_IP:$(pwd)/.env${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .env file found.${NC}"

# 3. Check for SSL Certificates
echo "🔒 Checking SSL Certificates..."
PROJECT_NAME=$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:]_-')
VOLUME_NAME=$(docker volume ls -q | grep -E "^(${PROJECT_NAME}_)?certbot_certs$" | head -n 1)

if [ -n "$VOLUME_NAME" ] && docker run --rm -v "$VOLUME_NAME":/etc/letsencrypt alpine ls /etc/letsencrypt/live/asiandot.com/fullchain.pem >/dev/null 2>&1; then
    echo -e "${GREEN}✓ SSL Certificates already exist. Skipping certificate generation.${NC}"
else
    echo "⚠️ SSL Certificates not found. Initiating Let's Encrypt SSL Bootstrap..."

    # Fallback email for SSL registration
    EMAIL="admin@asiandot.com"

    echo "🛑 Ensuring port 80 is free (stopping Nginx)..."
    docker compose -f docker-compose.prod.yml down nginx || true

    echo "🔑 Requesting Let's Encrypt Certificate in Standalone Mode..."
    docker compose -f docker-compose.prod.yml run --rm -p 80:80 --entrypoint "certbot" certbot certonly \
      --standalone \
      -d asiandot.com \
      -d www.asiandot.com \
      --email "$EMAIL" \
      --agree-tos \
      --no-eff-email
fi

# 4. Start all services in production mode
echo "⚡ Starting all services..."
docker compose -f docker-compose.prod.yml up -d db app nginx

# 5. Run health check
echo "🔍 Waiting for the services to be healthy..."
max_attempts=12
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -s -f -H "Host: asiandot.com" http://localhost > /dev/null; then
        echo -e "${GREEN}✓ Application is up and running!${NC}"
        break
    fi
    echo "⏳ Waiting for app container to start (attempt $attempt/$max_attempts)..."
    sleep 5
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo -e "${RED}❌ Health check failed. Please check the logs with:${NC}"
    echo "   docker compose -f docker-compose.prod.yml logs app"
    exit 1
fi

echo -e "${GREEN}✅ Setup complete! Asian Dot is now running at https://asiandot.com${NC}"
