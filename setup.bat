@echo off
REM SocraticWingman Setup Script for Windows

echo 🚀 Setting up SocraticWingman Full-Stack Application...

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install

REM Install frontend dependencies
echo 🎨 Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Install backend dependencies
echo ⚙️ Installing backend dependencies...
cd backend
call npm install
cd ..

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Make sure MongoDB is running (mongod)
echo 2. Run 'npm run dev' to start both frontend and backend
echo 3. Frontend will be available at http://localhost:3000
echo 4. Backend API will be available at http://localhost:5000
echo.
echo Happy coding! 🎉

pause
