#!/bin/bash
set -e  # Exit immediately if a command fails

echo "🚀 Starting Django backend deployment script for Railway..."

# Ensure we're running in Railway's Linux environment
if [[ "$RAILWAY_ENVIRONMENT" == "" ]]; then
  echo "⚠ Warning: Not running in Railway environment. Exiting to avoid local changes."
  exit 1
fi

# Upgrade pip and install dependencies
echo "📦 Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt

# Collect static files
echo "🗂 Collecting static files..."
python manage.py collectstatic --noinput

# Apply database migrations
echo "🛠 Applying database migrations..."
python manage.py migrate

# Start Gunicorn using Railway-provided $PORT
if [[ -z "$PORT" ]]; then
  echo "⚠ Error: $PORT not set. Railway automatically provides this port."
  exit 1
fi

echo "🎯 Starting Gunicorn server on port $PORT..."
exec gunicorn k9platform.wsgi:application --bind 0.0.0.0:$PORT