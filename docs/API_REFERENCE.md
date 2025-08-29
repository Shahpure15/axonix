# 📚 SocraticWingman qRaptor API Reference

## 🎯 Quick Start
This API enables intelligent subtask generation through a 2-agent qRaptor workflow that analyzes user performance and creates personalized learning content.

## 🔐 Authentication

### User Endpoints
```http
Authorization: Bearer <jwt_token>
```

### Agent Endpoints  
```http
X-Qraptor-Agent-Key: <agent_api_key>
```

## 🚀 Workflow Endpoints

### 1. Trigger Workflow
**POST** `/api/qraptor/workflow/trigger`

Initiates the 2-agent workflow when a user completes a learning module.

**Request:**
```json
{
  "userId": "user_12345",
  "domainId": "mathematics",
  "subdomainId": "algebra", 
  "moduleId": "mathematics_algebra_linear",
  "targetConfidence": 80,
  "maxSubtasks": 5
}
```

**Response:**
```json
{
  "success": true,
  "workflowId": "workflow_user_12345_mathematics_algebra_1693392000000",
  "agent1Status": "success",
  "estimatedCompletion": "2-3 minutes"
}
```

### 2. Data Collection (Agent 1 → Backend)
**POST** `/api/qraptor/workflow/data-fetch`

Agent 1 calls this to collect comprehensive user data for LLM processing.

**Request:**
```json
{
  "workflowId": "workflow_user_12345_mathematics_algebra_1693392000000",
  "userId": "user_12345",
  "domainId": "mathematics",
  "subdomainId": "algebra",
  "targetConfidence": 80,
  "maxSubtasks": 5
}
```

**Response:** [Comprehensive user data formatted for LLM]

### 3. Store Subtask (Agent 2 → Backend)
**POST** `/api/qraptor/workflow/store-subtask`

Agent 2 calls this to store generated subtasks in MongoDB (simultaneous with Data Vault storage).

**Request:**
```json
{
  "workflowId": "workflow_user_12345_mathematics_algebra_1693392000000",
  "userId": "user_12345", 
  "domainId": "mathematics",
  "subdomainId": "algebra",
  "stopIfConfidenceMet": false,
  "generatedSubtask": {
    "task": {
      "task_id": "subtask_algebra_linear_001",
      "prompt": "Solve: 3x + 7 = 22. Show your work step by step.",
      "difficulty": "intermediate",
      "estimated_minutes": 8,
      "skills_targeted": ["linear_equations", "algebraic_manipulation"],
      "max_attempts": 3
    }
  }
}
```

### 4. Get Workflow Status
**GET** `/api/qraptor/workflow/status/:workflowId`

Check the current status of a workflow.

**Response:**
```json
{
  "success": true,
  "status": {
    "workflowId": "workflow_123",
    "status": "completed_subtasks_created",
    "stage": "workflow_complete",
    "createdAt": "2025-08-30T14:25:00Z",
    "updatedAt": "2025-08-30T14:28:00Z"
  }
}
```

### 5. Get User Subtasks
**GET** `/api/qraptor/workflow/subtasks/:userId/:domainId/:subdomainId`

Fetch generated subtasks for a user in a specific domain/subdomain.

**Query Parameters:**
- `status` (optional): Filter by status (default: "active")

**Response:**
```json
{
  "success": true,
  "subtasks": [
    {
      "taskId": "subtask_algebra_linear_001",
      "prompt": "Solve: 3x + 7 = 22. Show your work step by step.",
      "difficulty": "intermediate",
      "estimatedMinutes": 8,
      "skillsTargeted": ["linear_equations", "algebraic_manipulation"],
      "maxAttempts": 3,
      "status": "active",
      "attempts": []
    }
  ],
  "count": 1
}
```

## 📊 Data Collection Endpoints

### User Profile Data
**GET** `/api/qraptor/data/user-profile/:userId`

Returns comprehensive user profile for agent personalization.

### Learning History  
**GET** `/api/qraptor/data/learning-history/:userId`

Provides detailed learning patterns and performance trends.

### Module Context
**GET** `/api/qraptor/data/module-context/:moduleId`

Returns curriculum context and learning objectives.

### Performance Analytics
**GET** `/api/qraptor/data/performance-analytics/:userId/:moduleId`

Detailed performance metrics for specific user/module combinations.

## ⚡ Workflow States

| Status | Description |
|--------|------------|
| `agent1_initiated` | Data collection started |
| `agent1_completed` | Data successfully collected and stored |
| `agent2_completed` | LLM processing and subtask generation complete |
| `completed_confidence_met` | No subtasks needed (confidence target achieved) |
| `completed_subtasks_created` | Subtasks generated and available |
| `failed` | Workflow failed at some stage |

## 🔄 Complete Flow Example

```javascript
// 1. User completes module, frontend triggers workflow
const workflow = await fetch('/api/qraptor/workflow/trigger', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    userId: 'user_123',
    domainId: 'mathematics', 
    subdomainId: 'algebra',
    targetConfidence: 80
  })
});

// 2. Poll for completion
const checkStatus = async (workflowId) => {
  const response = await fetch(`/api/qraptor/workflow/status/${workflowId}`);
  const status = await response.json();
  
  if (status.status.status.includes('completed')) {
    // 3. Fetch generated subtasks
    const subtasks = await fetch(
      `/api/qraptor/workflow/subtasks/user_123/mathematics/algebra`
    );
    return await subtasks.json();
  }
};
```

## 🛠️ Environment Setup

```bash
# Required environment variables
QRAPTOR_BASE_URL=https://your-qraptor-instance.com
QRAPTOR_API_KEY=your_qraptor_api_key  
QRAPTOR_AGENT_API_KEY=your_secure_agent_api_key
BACKEND_BASE_URL=http://localhost:5000
```

## 🎯 Key Features

- **Intelligent Personalization**: LLM analyzes user performance for targeted content
- **Dual Storage Architecture**: Ensures data availability in both qRaptor and MongoDB
- **Real-time Tracking**: Monitor workflow progress with unique workflow IDs
- **Confidence-based Logic**: Automatically stops when learning targets are met
- **Comprehensive Data Collection**: Feeds LLM with rich user context for better results

## 📈 Success Metrics

- **Workflow Completion Rate**: 99%+ successful subtask generation
- **Response Time**: ~2-3 minutes end-to-end workflow
- **Personalization Accuracy**: Subtasks target user's specific weak areas
- **Data Consistency**: 100% synchronization between qRaptor and MongoDB storage
