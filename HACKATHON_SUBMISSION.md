# 🏆 SocraticWingman x qRaptor Integration - Hackathon Submission

## 🎯 Project Overview
**SocraticWingman** is an adaptive learning platform enhanced with **qRaptor AI agents** for intelligent, personalized subtask generation. When users complete learning modules, our system automatically triggers a 2-agent workflow that analyzes their performance and generates targeted practice problems.

## 🚀 Key Innovation
- **Intelligent Subtask Generation**: AI-powered personalized learning paths
- **Real-time Performance Analysis**: Tracks strengths/weaknesses for targeted practice
- **Seamless Integration**: 2-agent qRaptor workflow with dual storage architecture
- **Adaptive Learning**: Confidence-based progression with automatic difficulty adjustment

## 🏗️ Architecture

### **Frontend (Next.js + TypeScript)**
```
frontend/
├── src/
│   ├── components/         # React components
│   ├── pages/             # Next.js pages and API routes
│   ├── lib/               # Utilities and integrations
│   └── styles/            # Styling and themes
```

### **Backend (Node.js + Express + MongoDB)**
```
backend/
├── routes/                # API endpoints
│   ├── qraptor-workflow.js    # 2-agent workflow orchestration
│   └── qraptor-data-collection.js  # Agent data collection endpoints
├── services/              # Business logic
│   └── QraptorWorkflowService.js   # Core qRaptor integration service
├── models/                # Database schemas
│   └── QraptorSubtask.js          # Subtask storage model
└── middleware/            # Authentication & validation
```

## 🔄 qRaptor 2-Agent Workflow

### **Agent 1: Data Mapper & Store-er**
1. Fetches user progress, performance analytics, and learning history from MongoDB
2. Formats data for LLM processing (user strengths, weaknesses, recent mistakes)
3. Stores comprehensive context in qRaptor Data Vault
4. Triggers Agent 2

### **Agent 2: LLM Task Generator**
1. Processes user data with advanced LLM
2. Generates personalized subtasks targeting specific weak areas
3. **Dual Storage**: Stores in qRaptor Data Vault + MongoDB simultaneously
4. Ensures immediate availability for both systems

## 📊 Data Flow
```
User Completes Module
        ↓
Frontend triggers workflow
        ↓
Agent 1 collects MongoDB data
        ↓ 
Agent 2 generates personalized subtasks
        ↓
Simultaneous storage (qRaptor + MongoDB)
        ↓
User gets targeted practice problems
```

## 🛠️ Technical Implementation

### **Core API Endpoints**
- `POST /api/qraptor/workflow/trigger` - Initiate AI workflow
- `POST /api/qraptor/workflow/data-fetch` - Agent 1 data collection
- `POST /api/qraptor/workflow/store-subtask` - Agent 2 result storage
- `GET /api/qraptor/workflow/subtasks/{userId}/{domain}/{subdomain}` - Fetch generated tasks

### **Key Features**
- **JWT Authentication** for secure user access
- **API Key Authentication** for qRaptor agent communication
- **Workflow Tracking** with unique IDs for monitoring
- **Error Handling** with comprehensive logging and fallbacks
- **Real-time Status** updates for frontend integration

## 🎯 Intelligent Personalization

### **Data Collection for LLM**
- **User Progress**: Current confidence levels and completion status
- **Performance Analytics**: Accuracy patterns and time efficiency
- **Learning History**: Recent test sessions and mistake patterns
- **Domain Context**: Skills, prerequisites, and learning objectives

### **Smart Subtask Generation**
- **Adaptive Difficulty**: Based on current performance levels
- **Targeted Practice**: Focuses on identified weak areas
- **Progressive Learning**: Builds on existing strengths
- **Confidence Thresholds**: Stops generation when targets are met

## 🏆 Hackathon Value Proposition

### **Innovation**
- First-of-its-kind integration between adaptive learning and AI agent workflows
- Dual storage architecture ensuring data consistency and availability
- Real-time personalization based on comprehensive user analytics

### **Technical Excellence**
- Clean, modular architecture with clear separation of concerns
- Comprehensive API documentation and error handling
- Scalable design supporting multiple domains and user types
- Production-ready code with proper authentication and validation

### **User Impact**
- **Personalized Learning**: Each user gets practice problems tailored to their specific needs
- **Efficient Progress**: No time wasted on concepts already mastered
- **Confidence Building**: Gradual difficulty progression builds learner confidence
- **Real-time Adaptation**: System continuously adapts to user performance

## 🔧 Setup & Configuration

### **Environment Variables**
```bash
# qRaptor Configuration
QRAPTOR_BASE_URL=https://your-qraptor-instance.com
QRAPTOR_API_KEY=your_qraptor_api_key
QRAPTOR_AGENT_API_KEY=your_secure_agent_api_key

# Database
MONGODB_URI=mongodb://localhost:27017/socraticwingman

# Authentication
JWT_SECRET=your_jwt_secret
```

### **Installation**
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend  
cd frontend
npm install
npm run dev
```

## 📈 Future Enhancements
- **Multi-modal Learning**: Support for video, audio, and interactive content
- **Collaborative Learning**: Group challenges and peer learning features
- **Advanced Analytics**: Detailed learning analytics dashboard
- **Mobile App**: Native mobile application for on-the-go learning

## 🏅 Demo Highlights
1. **User completes algebra module** → System detects 72% accuracy in linear equations
2. **qRaptor workflow triggers** → Agents analyze user's specific mistake patterns
3. **Personalized subtasks generated** → Practice problems targeting algebraic manipulation errors
4. **Real-time availability** → User immediately sees new practice problems
5. **Adaptive progression** → Difficulty adjusts based on user performance

This project demonstrates the power of combining adaptive learning platforms with intelligent AI agents to create truly personalized educational experiences.
