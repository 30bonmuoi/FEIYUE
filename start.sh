#!/bin/bash

# FeiYue System Startup Script

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql 2>/dev/null && ! pgrep -x "postgres" > /dev/null; then
    echo "Starting PostgreSQL..."
    sudo service postgresql start || echo "Warning: Could not start PostgreSQL automatically"
    sleep 2
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Load environment variables safely
set -a
source .env
set +a

# Start the server
echo "Starting FeiYue System..."
node server.js
