#!/bin/bash
# Quick start script for SocraticWingman Backend

echo "🚀 Starting SocraticWingman Backend (MongoDB Edition)"
echo "================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running (optional check)
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand({ping: 1})" --quiet > /dev/null 2>&1; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Please start MongoDB first:"
        echo "   - macOS: brew services start mongodb/brew/mongodb-community"
        echo "   - Ubuntu: sudo systemctl start mongod"
        echo "   - Windows: net start MongoDB"
    fi
else
    echo "⚠️  MongoDB CLI not found. Make sure MongoDB is installed and running."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🌐 Starting server on port 5000..."
echo "📡 API will be available at: http://localhost:5000"
echo "📚 Test endpoints:"
echo "   - Health: GET http://localhost:5000/"
echo "   - Register: POST http://localhost:5000/auth/register"
echo "   - Login: POST http://localhost:5000/auth/login"
echo ""

# Start the server
npm run dev
