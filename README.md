# SocraticWingman - Full-Stack Setup

This project has been reorganized into a proper frontend/backend structure with MongoDB authentication.

## Project Structure

```
axonix/
├── frontend/           # Next.js React frontend
│   ├── src/           # Frontend source code
│   ├── public/        # Static assets
│   ├── package.json   # Frontend dependencies
│   └── .env.local     # Frontend environment variables
├── backend/           # Node.js Express backend
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── db.js         # Database connection
│   ├── server.js     # Express server
│   ├── package.json  # Backend dependencies
│   └── .env          # Backend environment variables
├── data/             # JSON data files
├── docs/             # Documentation
├── package.json      # Root package.json for workspace management
└── README.md         # This file
```

## Quick Start

### 1. Install Dependencies
```bash
# Install all dependencies (frontend and backend)
npm run setup

# Or install separately
npm run install:frontend
npm run install:backend
```

### 2. Environment Setup

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/socratic_wingman
JWT_SECRET=your-secret-key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB
Make sure MongoDB is running locally:
```bash
mongod
```

### 4. Development

**Start both frontend and backend:**
```bash
npm run dev
```

**Start separately:**
```bash
# Frontend only (runs on http://localhost:3000)
npm run frontend:dev

# Backend only (runs on http://localhost:5000)
npm run backend:dev
```

## API Endpoints

The backend provides the following authentication endpoints:

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile (requires JWT token)

## Frontend Integration

The frontend is configured to communicate with the backend API:

- API calls are made to `http://localhost:5000`
- JWT tokens are stored in localStorage
- Authentication state is managed through React hooks

## Development Workflow

1. **Frontend Development**: Work in the `frontend/` directory
2. **Backend Development**: Work in the `backend/` directory
3. **Full-stack Development**: Use `npm run dev` from the root directory

## Testing

```bash
# Test frontend
npm run test:frontend

# Test backend
npm run test:backend

# Test both
npm run test
```

## Production Build

```bash
# Build frontend
npm run frontend:build

# Start production servers
npm run frontend:start
npm run backend:start
```

## Key Changes Made

1. **Separated Frontend/Backend**: All frontend files moved to `frontend/` directory
2. **Updated API URLs**: Frontend now points to backend at `http://localhost:5000`
3. **Fixed Authentication Routes**: Updated signup endpoint from `/auth/signup` to `/auth/register`
4. **Environment Configuration**: Proper `.env` files for both frontend and backend
5. **Workspace Management**: Root package.json with scripts to manage both apps
6. **CORS Setup**: Backend configured to accept requests from frontend

## MongoDB Authentication System

The backend uses:
- **MongoDB** with Mongoose for data persistence
- **bcrypt** for password hashing
- **JWT** for authentication tokens
- **Express.js** for the REST API

The user model includes:
- Email/password authentication
- XP and level tracking
- Quest progress tracking
- Secure password hashing with pre-save hooks

## Original Features

SocraticWingman is an adaptive tutor for beginner→intermediate developers that teaches via Socratic questioning and a 5-level hint ladder, enforces "no direct answers", and uses SRS to remember learning.
- **📊 Learning Analytics**: Progress tracking and mastery visualization
- **🔐 Secure Authentication**: JWT-based auth with OAuth support

## 🚀 Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn-ui
- **Backend**: Node.js microservices with Express.js
- **Database**: PostgreSQL + Vector DB (Pinecone/Weaviate)
- **Authentication**: JWT with OAuth 2.0 (Google, LinkedIn)
- **Real-time**: WebSocket for live session updates
- **Styling**: Tailwind CSS with custom design system

## 🏗️ Architecture

The platform follows a microservices architecture with 10 core services:

1. **API Gateway** (Port 3000) - Routing and rate limiting
2. **Auth Service** (Port 3001) - Authentication and authorization
3. **User Service** (Port 3002) - Profile management
4. **Content Service** (Port 3003) - Question repository
5. **Session Service** (Port 3004) - Session management
6. **Tutor Service** (Port 3005) - Socratic questioning logic
7. **Scoring Worker** (Port 3006) - Code execution and scoring
8. **SRS Scheduler** (Port 3007) - Spaced repetition system
9. **Analytics Service** (Port 3008) - Learning analytics
10. **Notification Service** (Port 3009) - Email and push notifications

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 14+
[# Worqhat MVP
- Docker (for development services)

### Installation
```bash
# Install dependencies
pnpm run db:migrate
# Start the development server
pnpm run dev
```

### Backend Services

```bash
# Start all microservices
pnpm run services:dev

# Or start individual services
pnpm run auth:dev
pnpm run user:dev
pnpm run content:dev
# ... etc
```

## 📁 Project Structure

```
socratic-wingman/
├── src/                        # Frontend application (Next.js)
│   ├── components/             # React components
│   │   ├── ui/                # UI component library
│   │   ├── api/               # API routes (if needed)
│   │   ├── learn.tsx          # Learning page
│   │   └── onboarding.tsx     # Onboarding page
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and configurations
│   │   ├── api.ts             # API client
│   │   ├── auth.ts            # Auth store
│   │   └── utils.ts           # Utility functions
│   ├── styles/                # Global styles
│   │   └── globals.css        # Tailwind CSS imports
│   └── types/                 # TypeScript type definitions
├── backend/                   # Backend microservices
│   ├── shared/                # Shared types and utilities
│   ├── api-gateway/           # API Gateway service
│   ├── auth-service/          # Authentication service
│   ├── user-service/          # User management service
│   ├── session-service/       # Session management service
│   ├── tutor-service/         # Socratic tutoring logic
│   ├── scoring-worker/        # Code execution and scoring
│   ├── analytics-service/     # Learning analytics
│   └── notification-service/  # Notifications
├── database/                  # Database schemas and migrations
│   └── seeds/                 # Database seed files
├── docs/                      # Documentation
│   ├── prd.md                 # Product Requirements Document
│   └── system-design.md       # System Design Document
```
## 🔑 Authentication

- Remove the development bypass when connecting to real backend
## API Documentation

- `POST /api/session/{id}/answer` - Submit answer

## Deployment
### Staging
pnpm run build
pnpm run deploy:staging
### Production
pnpm run build
pnpm run deploy:prod
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.