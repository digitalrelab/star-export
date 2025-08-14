#!/bin/bash

# Start both frontend and backend in development mode

echo "🚀 Starting Star Export Development Environment"

# Check if we're in the right directory
if [ ! -d "star-export-app" ] || [ ! -d "server" ]; then
    echo "❌ Please run this script from the star-export root directory"
    exit 1
fi

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup INT TERM

echo "📦 Installing dependencies..."

# Install frontend dependencies
cd star-export-app
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Install backend dependencies
cd ../server
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "🔧 Please update server/.env with your Google OAuth credentials"
    echo "   Get them from: https://console.cloud.google.com/"
fi

cd ..

echo "🎬 Starting development servers..."

# Start backend server
cd server
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server
cd ../star-export-app
npm run dev &
FRONTEND_PID=$!

echo "✅ Development servers started!"
echo "🖥️  Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3000"
echo "❤️  Health:   http://localhost:3000/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait