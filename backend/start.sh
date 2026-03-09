#!/bin/bash

# Exit immediately if a command fails
set -e

echo "🚀 Starting Django deployment script for Railway..."

# Upgrade pip
pip install --upgrade pip

# Install dependencies
echo "📦 Installing Python packages..."
pip install -r requirements.txt

# Collect static files
echo "🗂 Collecting static files..."
python manage.py collectstatic --noinput

# Apply database migrations
echo "🛠 Applying database migrations..."
python manage.py migrate

# Start Django using Gunicorn (Railway provides $PORT)
echo "🎯 Starting Gunicorn server..."
exec gunicorn k9platform.wsgi:application --bind 0.0.0.0:$PORT