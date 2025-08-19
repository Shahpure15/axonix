# SocraticWingman - Adaptive Tutoring Platform

SocraticWingman is an adaptive tutor for beginner→intermediate developers that teaches via Socratic questioning and a 5-level hint ladder, enforces "no direct answers", and uses SRS to remember learning.

## ✨ Features

- **🎯 Socratic Method**: 5-level progressive hint system with no direct answers
- **🧠 Adaptive Learning**: Personalized difficulty adjustment based on performance
- **📚 Spaced Repetition System (SRS)**: SM-2 algorithm for long-term retention
- **💻 Code Sandbox Integration**: Secure code execution and automated scoring
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