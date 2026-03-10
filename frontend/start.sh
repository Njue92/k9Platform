#!/bin/bash
set -e  # Exit immediately if a command fails

echo "🚀 Starting frontend deployment script for Railway..."

# Ensure we're running in Railway's Linux environment
if [[ "$RAILWAY_ENVIRONMENT" == "" ]]; then
  echo "⚠ Warning: Not running in Railway environment. Exiting to avoid local changes."
  exit 1
fi

# Install dependencies
echo "📦 Installing Node.js packages..."
npm install

# Build frontend for production
echo "🏗 Building frontend..."
npm run build

# Serve the built frontend on Railway's $PORT
if [[ -z "$PORT" ]]; then
  echo "⚠ Error: $PORT not set. Railway automatically provides this port."
  exit 1
fi

echo "🌐 Serving frontend on port $PORT..."
npx vite preview --port $PORT --host