#!/bin/sh
set -e

# Run Payload migrations automatically
echo "🗄️  Running database migrations..."
npx payload migrate

# Start the Next.js production server
echo "✅ Migrations complete. Starting server..."
exec npm run start
