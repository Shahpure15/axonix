@echo off
REM Quick start script for SocraticWingman Backend (Windows)

echo 🚀 Starting SocraticWingman Backend (MongoDB Edition)
echo =================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if MongoDB is running
mongosh --eval "db.runCommand({ping: 1})" --quiet >nul 2>&1
if errorlevel 1 (
    echo ⚠️  MongoDB is not running. Please start MongoDB first:
    echo    Windows: net start MongoDB
    echo    Or check if MongoDB service is installed
) else (
    echo ✅ MongoDB is running
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
)

echo 🌐 Starting server on port 5000...
echo 📡 API will be available at: http://localhost:5000
echo 📚 Test endpoints:
echo    - Health: GET http://localhost:5000/
echo    - Register: POST http://localhost:5000/auth/register
echo    - Login: POST http://localhost:5000/auth/login
echo.

REM Start the server
npm run dev

pause
