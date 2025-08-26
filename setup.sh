#!/bin/bash

# SocraticWingman Setup Script

echo "🚀 Setting up SocraticWingman Full-Stack Application..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "⚙️ Installing backend dependencies..."
cd backend
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running (mongod)"
echo "2. Run 'npm run dev' to start both frontend and backend"
echo "3. Frontend will be available at http://localhost:3000"
echo "4. Backend API will be available at http://localhost:5000"
echo ""
echo "Happy coding! 🎉"
