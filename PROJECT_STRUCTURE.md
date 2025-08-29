# 📁 SocraticWingman x qRaptor - Clean Project Structure

## 🏗️ **Final Organized Structure**

```
📁 SocraticWingman-qRaptor/
├── 📄 README.md                    # 📖 Main project documentation
├── 📄 HACKATHON_SUBMISSION.md      # 🏆 Hackathon highlights & innovation
├── 📄 PROJECT_CLEANUP_SUMMARY.md   # ✅ Cleanup actions summary
├── 📄 .gitignore                   # 🚫 Git ignore rules
├── 📁 docs/                        # 📚 Global project documentation
│   └── 📄 API_REFERENCE.md         # 📡 Complete API reference
├── 📁 backend/                     # 🔧 Node.js Backend
│   ├── 📄 package.json             # 📦 Backend dependencies
│   ├── 📄 server.js                # 🚀 Express server entry point
│   ├── 📄 .env.example             # ⚙️ Environment variables template
│   ├── 📁 routes/                  # 🛣️ API route handlers
│   │   ├── 📄 auth.js              # 🔐 Authentication routes
│   │   ├── 📄 test.js              # 📝 Test/quiz management
│   │   ├── 📄 progress.js          # 📊 Learning progress tracking
│   │   ├── 📄 analytics.js         # 📈 Performance analytics
│   │   ├── 📄 qraptor-workflow.js          # 🤖 2-agent qRaptor workflow
│   │   └── 📄 qraptor-data-collection.js   # 📊 Agent data collection
│   ├── 📁 services/                # 🧠 Business logic services
│   │   ├── 📄 QraptorWorkflowService.js    # 🔄 Core qRaptor integration
│   │   └── 📄 AIPerformanceAnalyzer.js    # 📊 Performance analysis
│   ├── 📁 models/                  # 💾 Database schemas
│   │   ├── 📄 User.js              # 👤 User management
│   │   ├── 📄 LearningProgress.js  # 📈 Progress tracking
│   │   ├── 📄 TestSession.js       # 📝 Test session data
│   │   └── 📄 QraptorSubtask.js    # 🎯 Generated subtasks
│   ├── 📁 middleware/              # 🛡️ Express middleware
│   │   └── 📄 auth.js              # 🔐 JWT authentication
│   ├── 📁 data/                    # 📊 Static data files
│   │   ├── 📄 diagnostic_tests.json
│   │   ├── 📄 learning-progress.json
│   │   └── 📄 users.json
│   ├── 📁 scripts/                 # 🔧 Database & utility scripts
│   └── 📁 docs/                    # 📚 Backend technical documentation
│       ├── 📄 QRAPTOR_3_AGENT_WORKFLOW.md     # 🔄 Workflow integration
│       └── 📄 QRAPTOR_DATA_COLLECTION_API.md  # 📡 Data collection API
└── 📁 frontend/                    # ⚛️ Next.js Frontend
    ├── 📄 package.json             # 📦 Frontend dependencies
    ├── 📄 next.config.js           # ⚙️ Next.js configuration
    ├── 📄 tailwind.config.js       # 🎨 Tailwind CSS config
    ├── 📄 tsconfig.json            # 📘 TypeScript configuration
    ├── 📁 public/                  # 🌐 Static assets
    │   └── 📄 favicon.svg
    └── 📁 src/                     # 📦 Frontend source code
        ├── 📁 components/          # ⚛️ React components
        │   └── 📁 dashboard/       # 📊 Dashboard components
        ├── 📁 pages/               # 🌐 Next.js pages & API routes
        │   ├── 📄 _app.tsx         # 🔧 App wrapper
        │   ├── 📄 index.tsx        # 🏠 Home page
        │   ├── 📄 learn.tsx        # 📚 Learning interface
        │   ├── 📄 library.tsx      # 📖 Content library
        │   └── 📄 roadmap.tsx      # 🗺️ Learning roadmap
        ├── 📁 lib/                 # 🔧 Utilities & integrations
        │   ├── 📄 brand-colors.ts  # 🎨 Brand color system
        │   └── 📄 qraptor.ts       # 🤖 qRaptor integration utilities
        ├── 📁 styles/              # 🎨 Styling files
        │   ├── 📄 axonix-theme.css
        │   └── 📄 socratic-wingman-theme.css
        ├── 📁 hooks/               # 🪝 Custom React hooks
        └── 📁 types/               # 📘 TypeScript type definitions
```

## 🎯 **Clear Separation Guidelines**

### 🔧 **Backend (Node.js + Express + MongoDB)**
**Location**: `backend/`
**Purpose**: API server, business logic, database management, qRaptor integration
**Key Features**:
- RESTful API endpoints
- JWT authentication middleware
- MongoDB integration with Mongoose
- qRaptor 2-agent workflow orchestration
- Performance analytics and progress tracking

**Run Backend**:
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### ⚛️ **Frontend (Next.js + TypeScript + Tailwind)**
**Location**: `frontend/`
**Purpose**: User interface, learning dashboards, progress visualization
**Key Features**:
- React components with TypeScript
- Next.js App Router for routing
- Tailwind CSS for styling
- Integration with backend APIs
- Responsive design for all devices

**Run Frontend**:
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## 📊 **Data Flow Architecture**

```
┌─────────────────┐    HTTP/REST API    ┌──────────────────┐    HTTP/Webhooks    ┌─────────────────┐
│   Frontend      │◄─────────────────────►│    Backend       │◄────────────────────►│   qRaptor       │
│   (Port 3000)   │                      │  (Port 5000)     │                     │   Agents        │
│                 │                      │                  │                     │                 │
│ - User Interface│                      │ - API Routes     │                     │ - Agent 1: Data │
│ - React Pages   │                      │ - Business Logic │                     │ - Agent 2: LLM  │
│ - Progress Views│                      │ - MongoDB        │                     │ - Data Vault    │
│ - Auth Forms    │                      │ - Authentication │                     │                 │
└─────────────────┘                      └──────────────────┘                     └─────────────────┘
```

## 🔐 **Environment Configuration**

### Backend Environment (`.env`)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/socraticwingman

# Authentication
JWT_SECRET=your_jwt_secret_key

# qRaptor Integration
QRAPTOR_BASE_URL=https://your-qraptor-instance.com
QRAPTOR_API_KEY=your_qraptor_api_key
QRAPTOR_AGENT_API_KEY=your_secure_agent_api_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Frontend Environment (`.env.local`)
```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000

# App Configuration
NEXT_PUBLIC_APP_NAME=SocraticWingman
NEXT_PUBLIC_APP_VERSION=2.0.0
```

## 🚀 **Development Workflow**

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend (new terminal)
```bash
cd frontend
npm run dev
```

### 3. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: Available in `docs/API_REFERENCE.md`

## 📦 **Dependencies Summary**

### Backend Dependencies
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **axios** - HTTP client for qRaptor
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend Dependencies
- **next** - React framework
- **react** - UI library
- **typescript** - Type safety
- **tailwindcss** - Utility-first CSS
- **axios** - HTTP client for API calls

## 🎯 **Key Integration Points**

1. **User Authentication**: Frontend → Backend JWT validation
2. **Learning Progress**: Frontend displays → Backend tracks → MongoDB stores
3. **qRaptor Workflow**: Frontend triggers → Backend orchestrates → qRaptor processes
4. **Subtask Display**: qRaptor generates → Backend stores → Frontend displays

This clean separation ensures maintainable, scalable code with clear responsibilities for each part of the system!
