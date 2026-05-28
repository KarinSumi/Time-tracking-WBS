#!/bin/bash
# scripts/redeploy.sh
# Disconnect from parent process
exec > /tmp/redeploy.log 2>&1
echo "Starting redeploy at $(date)"

# Wait for the API to return the response
sleep 2

# Navigate to project root
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "Pulling latest from git..."
git pull origin main

echo "Installing backend dependencies..."
npm install

echo "Building backend..."
npm run build:backend

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Building frontend..."
npm run build
cd ..

echo "Running database migrations..."
npx prisma db push

echo "Removing maintenance flag..."
rm -f .maintenance

echo "Restarting application via PM2..."
# Assuming pm2 is managing the process named 'enterprise-time-logger' or 'all'
pm2 restart all || echo "PM2 restart failed, you may need to restart manually."

echo "Redeploy complete at $(date)"
