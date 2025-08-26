# SocraticWingman Backend - MongoDB Edition

A modern authentication backend built with Node.js, Express, MongoDB, and JWT tokens for the SocraticWingman learning platform.

## 🏗️ Architecture

- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Framework**: Express.js with CORS support
- **Features**: User registration, login, profile management, XP/leveling system

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (v5.0 or higher) running locally or remotely
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Default MongoDB URI: mongodb://localhost:27017/socratic_wingman
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS with Homebrew:
brew services start mongodb/brew/mongodb-community

# On Ubuntu:
sudo systemctl start mongod

# On Windows:
net start MongoDB
```

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL: `http://localhost:5000`

### Health Check
- **GET** `/` - Check if the API is running

### Authentication Endpoints

#### Register User
- **POST** `/auth/register`
- **Body**: `{ "email": "user@example.com", "password": "password123" }`
- **Response**: JWT token + user profile

#### Login User
- **POST** `/auth/login`
- **Body**: `{ "email": "user@example.com", "password": "password123" }`
- **Response**: JWT token + user profile

#### Get User Profile
- **GET** `/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User profile with XP, level, quests

## 🧪 Testing the API

### Using cURL

**Register a new user:**
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123456"}'
```

**Login user:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123456"}'
```

**Get user profile (replace TOKEN with actual JWT token):**
```bash
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Using the Test Suite

Run the automated test suite:

```bash
npm test
```

This will test all endpoints and verify functionality.

## 📊 Database Schema

### User Model

```javascript
{
  email: String,        // Unique, required
  passwordHash: String, // Bcrypt hashed, required
  xp: Number,          // Experience points, default: 0
  level: Number,       // User level, default: 1
  clan: String,        // User's clan, default: null
  quests: [{           // Array of quest objects
    id: String,        // Quest identifier
    status: String,    // "completed" or "in-progress"
    completedAt: Date  // Completion timestamp
  }],
  createdAt: Date,     // Auto-generated
  updatedAt: Date      // Auto-generated
}
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured for frontend integration
- **Environment Variables**: Sensitive data in .env files

## 🎮 Gaming Features

### XP System
Users gain experience points and level up automatically:
```javascript
// Level calculation: level = floor(sqrt(xp/100)) + 1
// Example: 400 XP = Level 3
```

### Quest Management
Track user progress through quests:
```javascript
// Add/update quest
user.updateQuest('quest_001', 'completed');
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `MONGODB_URI` | mongodb://localhost:27017/socratic_wingman | MongoDB connection string |
| `JWT_SECRET` | your-secret-key | JWT signing secret |
| `JWT_EXPIRES_IN` | 1h | Token expiration time |
| `FRONTEND_URL` | http://localhost:3000 | Frontend URL for CORS |

## 🧪 Testing with PowerShell/CMD

**Register a new user:**
```powershell
$body = @{
    email = "test@example.com"
    password = "test123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Login user:**
```powershell
$body = @{
    email = "test@example.com"
    password = "test123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/auth/login" -Method POST -Body $body -ContentType "application/json"
```

## 🛠️ Development

### Project Structure

```
backend/
├── models/
│   └── User.js           # Mongoose user model
├── routes/
│   └── auth.js           # Authentication routes
├── test/
│   └── auth.test.js      # API tests
├── db.js                 # MongoDB connection
├── server.js             # Express server setup
├── package.json          # Dependencies and scripts
└── .env                  # Environment variables
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running:**
   ```bash
   # Check status
   mongosh --eval "db.runCommand({ping: 1})"
   ```

2. **Verify connection string:**
   ```bash
   # Test connection
   mongosh "mongodb://localhost:27017/socratic_wingman"
   ```

### Port Already in Use

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F
```

## 🔄 Migration from PostgreSQL

This backend replaces the previous PostgreSQL implementation with:

- ✅ **Removed**: All PostgreSQL/psycopg2 dependencies
- ✅ **Added**: MongoDB/Mongoose with modern schema design
- ✅ **Enhanced**: Gaming features (XP, levels, quests)
- ✅ **Improved**: Better error handling and validation
- ✅ **Modernized**: ES6+ syntax and async/await

---

**Happy coding! 🚀**
