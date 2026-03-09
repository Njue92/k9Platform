#!/bin/bash

# Exit immediately if a command fails
set -e

echo "🚀 Starting frontend deployment script for Railway..."

# Install dependencies
echo "📦 Installing npm packages..."
npm install

# Build the frontend
echo "🏗 Building frontend..."
npm run build

# Start the frontend preview server (Railway provides $PORT)
echo "🎯 Starting frontend server..."
# Vite / React apps usually use 'preview' for static build serving
npx vite preview --port $PORT --host