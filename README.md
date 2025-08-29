# 🚀 SocraticWingman x qRaptor Integration

> **AI-Powered Adaptive Learning Platform with Intelligent Subtask Generation**

## 🎯 Overview
SocraticWingman is an adaptive learning platform enhanced with qRaptor AI agents that automatically generate personalized practice problems based on user performance. When learners complete modules, our 2-agent workflow analyzes their strengths and weaknesses to create targeted subtasks for optimal learning progression.

## ✨ Key Features
- 🤖 **AI-Powered Personalization**: 2-agent qRaptor workflow for intelligent content generation
- 📊 **Performance Analytics**: Real-time tracking of learning progress and patterns
- 🎯 **Targeted Practice**: Subtasks generated based on specific user weaknesses
- ⚡ **Real-time Integration**: Seamless workflow between qRaptor agents and MongoDB
- 🔒 **Secure Architecture**: JWT authentication and API key validation
- 📱 **Modern Frontend**: Next.js with TypeScript for responsive user experience

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   qRaptor       │
│   (Next.js)     │◄──►│  (Node.js +      │◄──►│   Agents        │
│                 │    │   Express +      │    │                 │
│   - User Interface   │   MongoDB)       │    │ - Agent 1: Data │
│   - Progress Display │                  │    │ - Agent 2: LLM  │
│   - Subtask Interaction - API Routes    │    │                 │
└─────────────────┘    │ - Workflow Logic │    └─────────────────┘
                       │ - Data Storage   │
                       └──────────────────┘
```

## 🔄 Workflow Process

1. **User Completes Module** → Frontend detects completion
2. **Workflow Trigger** → Backend initiates qRaptor 2-agent workflow  
3. **Data Collection** → Agent 1 fetches user performance data from MongoDB
4. **AI Processing** → Agent 2 analyzes data and generates personalized subtasks
5. **Dual Storage** → Subtasks stored in both qRaptor Data Vault and MongoDB
6. **User Practice** → Learner receives targeted practice problems immediately

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- qRaptor instance access

### Installation

```bash
# Clone repository
git clone https://github.com/Shahpure15/axonix.git
cd axonix

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev           # Starts on http://localhost:5000

# Frontend setup (new terminal)
cd ../frontend  
npm install
npm run dev          # Starts on http://localhost:3000
```

### Environment Configuration

**Backend (`.env`)**:
```bash
MONGODB_URI=mongodb://localhost:27017/socraticwingman
JWT_SECRET=your_jwt_secret_key
QRAPTOR_BASE_URL=https://your-qraptor-instance.com
QRAPTOR_API_KEY=your_qraptor_api_key
QRAPTOR_AGENT_API_KEY=your_secure_agent_api_key
PORT=5000
```

**Frontend (`.env.local`)**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=SocraticWingman
```

## 📚 Documentation

- **[📖 Project Structure](PROJECT_STRUCTURE.md)** - Detailed file organization and architecture
- **[📡 API Reference](docs/API_REFERENCE.md)** - Complete API documentation with examples
- **[🔄 qRaptor Workflow](backend/docs/QRAPTOR_3_AGENT_WORKFLOW.md)** - Technical workflow integration guide
- **[📊 Data Collection](backend/docs/QRAPTOR_DATA_COLLECTION_API.md)** - Agent data collection endpoints
- **[🏆 Hackathon Submission](HACKATHON_SUBMISSION.md)** - Project highlights and innovation summary

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript  
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern state management

### Backend  
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Axios** - HTTP client for qRaptor integration

### AI Integration
- **qRaptor Agents** - 2-agent workflow system
- **LLM Processing** - Advanced language model for content generation
- **Data Vault** - qRaptor's data storage system

## 🎯 Core Features

### Intelligent Subtask Generation
```javascript
// When user completes a module, trigger workflow
const response = await fetch('/api/qraptor/workflow/trigger', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    userId: user.id,
    domainId: 'mathematics',
    subdomainId: 'algebra',
    targetConfidence: 80,
    maxSubtasks: 5
  })
});
```

### Real-time Progress Tracking
```javascript
// Monitor workflow progress
const checkWorkflowStatus = async (workflowId) => {
  const status = await fetch(`/api/qraptor/workflow/status/${workflowId}`);
  return status.json();
};
```

### Personalized Content Delivery
```javascript
// Fetch generated subtasks for user
const subtasks = await fetch(
  `/api/qraptor/workflow/subtasks/${userId}/${domain}/${subdomain}`
);
```

## 📊 Project Structure

```
SocraticWingman-qRaptor/
├── 📄 README.md                    # Main project documentation
├── 📄 HACKATHON_SUBMISSION.md      # Hackathon highlights
├── 📁 docs/                        # Global documentation
│   └── 📄 API_REFERENCE.md         # Complete API reference
├── 📁 backend/                     # 🔧 Node.js Backend (Port 5000)
│   ├── 📁 routes/                  # API endpoints
│   │   ├── 📄 qraptor-workflow.js          # 2-agent workflow
│   │   └── 📄 qraptor-data-collection.js   # Agent data collection
│   ├── 📁 services/                # Business logic
│   │   └── 📄 QraptorWorkflowService.js    # Core qRaptor integration
│   ├── 📁 models/                  # Database schemas
│   │   └── 📄 QraptorSubtask.js            # Subtask storage
│   ├── 📁 data/                    # Static data files
│   └── 📁 docs/                    # Backend documentation
└── 📁 frontend/                    # ⚛️ Next.js Frontend (Port 3000)
    ├── 📁 src/
    │   ├── 📁 components/          # React components
    │   ├── 📁 pages/               # Next.js pages
    │   ├── 📁 lib/                 # Utilities & integrations
    │   └── 📁 styles/              # Styling files
    └── 📁 public/                  # Static assets
```

## 🏆 Hackathon Highlights

- **Innovation**: First-of-its-kind integration between adaptive learning and AI agent workflows
- **Technical Excellence**: Production-ready code with comprehensive error handling and authentication
- **User Impact**: Personalized learning experiences that adapt in real-time to user performance
- **Scalability**: Modular architecture supporting multiple domains and learning types

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- qRaptor team for the intelligent agent framework
- MongoDB for reliable data storage
- Next.js team for the amazing React framework

---

**Built with ❤️ for the future of adaptive learning**
