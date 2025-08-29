# 🤖 qRaptor 2-Agent Workflow Integration

## Overview
Complete integration guide for SocraticWingman's qRaptor 2-agent workflow system for intelligent subtask generation.

## 🎯 Architecture Overview

### **Agent 1: Data Mapper & Store-er**
- Collects user progress, performance analytics, and learning context from MongoDB
- Formats data according to LLM prompt requirements  
- Stores comprehensive context in qRaptor Data Vault
- Triggers Agent 2 for LLM processing

### **Agent 2: LLM Task Generator**
- Processes user data with advanced LLM for personalization
- Generates targeted subtasks based on user weaknesses and mistakes
- **Dual Storage**: Simultaneously stores in qRaptor Data Vault + MongoDB
- Ensures immediate availability for both systems

## 🎯 Workflow Architecture

```
User Completes Module
        ↓
Frontend calls: POST /api/qraptor/workflow/trigger
        ↓
Agent 1: Data Mapper & Store-er
        ↓
Agent 1 calls: POST /api/qraptor/workflow/data-fetch (our backend)
        ↓
Agent 1 stores data in qRaptor Data Vault
        ↓
Agent 1 triggers Agent 2: LLM Task Generator
        ↓
Agent 2 processes data with LLM & generates subtasks
        ↓
Agent 2 stores subtasks in qRaptor Data Vault
        ↓
Agent 2 SIMULTANEOUSLY calls: POST /api/qraptor/workflow/store-subtask (our backend)
        ↓
Subtasks stored in MongoDB & ready for user
```

## 🚀 API Endpoints

### 1. Trigger Workflow (Frontend → Backend)
**POST** `/api/qraptor/workflow/trigger`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
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
  "message": "Qraptor workflow initiated successfully",
  "workflowId": "workflow_user_12345_mathematics_algebra_1693392000000",
  "agent1Status": "success",
  "nextStep": "Agent 1 collecting and storing data, will trigger Agent 2 LLM",
  "estimatedCompletion": "2-3 minutes"
}
```

### 2. Data Fetch (Agent 1 → Backend)
**POST** `/api/qraptor/workflow/data-fetch`

**Headers:**
```
X-Qraptor-Agent-Key: <agent_api_key>
Content-Type: application/json
```

**Request Body:**
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

**Response:**
```json
{
  "success": true,
  "workflowId": "workflow_user_12345_mathematics_algebra_1693392000000",
  "data": {
    "user_progress_result": [{
      "id": "progress_id",
      "user_id": "user_12345",
      "domain_id": "mathematics",
      "subdomain_id": "algebra",
      "confidence": 65,
      "status": "in_progress",
      "last_task_id": "task_456",
      "history": [...]
    }],
    "domain_id": "mathematics",
    "subdomain_id": "algebra",
    "subdomain_info": [{
      "domain_id": "mathematics",
      "subdomain_id": "algebra", 
      "skills": "linear equations, quadratic equations, polynomial operations, factoring, solving systems of equations...",
      "description": "Fundamental algebraic concepts and problem-solving techniques",
      "difficulty_levels": ["beginner", "intermediate", "advanced"]
    }],
    "task_templates_list": [
      {
        "template_id": "mathematics_algebra_basic",
        "type": "problem_solving",
        "difficulty": "beginner",
        "format": "multiple_choice",
        "estimated_minutes": 5
      }
    ],
    "attempts_list": [
      {
        "attempt_id": "session_789",
        "user_id": "user_12345",
        "domain_id": "mathematics",
        "subdomain_id": "algebra",
        "score": 75,
        "percentage": 75,
        "questions_attempted": 10,
        "questions_correct": 7,
        "time_spent": 600,
        "mistakes": [
          {
            "question_id": "q_123",
            "skill": "linear_equations",
            "mistake_type": "algebraic_manipulation_error"
          }
        ],
        "completed_at": "2025-08-29T10:30:00Z"
      }
    ],
    "target_confidence": 80,
    "max_subtasks": 5,
    "existing_subtasks_count": 1,
    "user_id": "user_12345",
    "sys_subscription_id": "default",
    "timestamp": "2025-08-29T14:30:00Z",
    "data_source": "mongodb_socratic_wingman"
  }
}
```

### 3. Store Subtask (Agent 2 → Backend) **[NEW ENDPOINT]**
**POST** `/api/qraptor/workflow/store-subtask`

**Headers:**
```
X-Qraptor-Agent-Key: <agent_api_key>
Content-Type: application/json
```

**Request Body:**
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
      "prompt": "Solve the following linear equation step by step: 3x + 7 = 22. Show your work and explain each step.",
      "inputs_schema": {
        "type": "object",
        "properties": {
          "answer": { "type": "string" },
          "steps": { "type": "array", "items": { "type": "string" } }
        }
      },
      "answer_schema": {
        "type": "object", 
        "properties": {
          "correct_answer": { "type": "string" },
          "solution_steps": { "type": "array", "items": { "type": "string" } },
          "is_correct": { "type": "boolean" }
        }
      },
      "difficulty": "intermediate",
      "estimated_minutes": 8,
      "skills_targeted": ["linear_equations", "algebraic_manipulation"],
      "max_attempts": 3
    },
    "stop_if_confidence_met": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subtask stored successfully in MongoDB",
  "workflowId": "workflow_user_12345_mathematics_algebra_1693392000000",
  "subtaskId": "6678a1b2c3d4e5f6789012ab",
  "subtaskCreated": true,
  "nextAction": "Subtask ready for user"
}
```

### 4. Workflow Status Check
**GET** `/api/qraptor/workflow/status/:workflowId`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "workflowId": "workflow_user_12345_mathematics_algebra_1693392000000",
  "status": {
    "workflowId": "workflow_user_12345_mathematics_algebra_1693392000000",
    "status": "completed_subtasks_created",
    "stage": "workflow_complete",
    "createdAt": "2025-08-29T14:25:00Z",
    "updatedAt": "2025-08-29T14:28:00Z",
    "metadata": {
      "type": "workflow_tracking",
      "workflowId": "workflow_user_12345_mathematics_algebra_1693392000000"
    }
  }
}
```

### 5. Get User Subtasks
**GET** `/api/qraptor/workflow/subtasks/:userId/:domainId/:subdomainId`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (default: "active")

**Response:**
```json
{
  "success": true,
  "subtasks": [
    {
      "_id": "6678a1b2c3d4e5f6789012ab",
      "workflowId": "workflow_user_12345_mathematics_algebra_1693392000000",
      "userId": "user_12345",
      "domainId": "mathematics",
      "subdomainId": "algebra",
      "taskId": "subtask_algebra_linear_001",
      "prompt": "Solve the following linear equation step by step: 3x + 7 = 22...",
      "difficulty": "intermediate",
      "estimatedMinutes": 8,
      "skillsTargeted": ["linear_equations", "algebraic_manipulation"],
      "maxAttempts": 3,
      "status": "active",
      "completed": false,
      "attempts": [],
      "createdAt": "2025-08-29T14:28:00Z"
    }
  ],
  "count": 1,
  "timestamp": "2025-08-29T14:30:00Z"
}
```

## 🔄 Workflow Statuses

### Workflow States:
- `agent1_initiated` - Agent 1 (Data Mapper) has been triggered
- `agent1_completed` - Agent 1 successfully collected and stored data
- `agent1_failed` - Agent 1 failed to collect/store data
- `agent2_initiated` - Agent 2 (LLM) processing has started
- `agent2_completed` - Agent 2 successfully generated subtasks
- `agent2_failed` - Agent 2 failed to generate subtasks
- `completed_confidence_met` - Workflow completed, confidence target achieved
- `completed_subtasks_created` - Workflow completed, subtasks created
- `failed` - Workflow failed at some stage

### Workflow Stages:
- `data_mapping` - Collecting data from MongoDB
- `llm_processing` - LLM generating subtasks
- `llm_processing_complete` - LLM finished processing
- `result_storage` - Storing results in MongoDB
- `workflow_complete` - All stages completed

## 📊 Data Structure for LLM

The LLM receives data in this exact format matching your qRaptor prompt requirements:

```json
{
  "user_progress_result": [
    {
      "id": "progress_id",
      "user_id": "user_12345", 
      "domain_id": "mathematics",
      "subdomain_id": "algebra",
      "confidence": 65,
      "status": "in_progress", 
      "last_task_id": "task_456",
      "history": [...]
    }
  ],
  "domain_id": "mathematics",
  "subdomain_id": "algebra", 
  "subdomain_info": [
    {
      "skills": "linear equations, quadratic equations, polynomial operations..."
    }
  ],
  "task_templates_list": [...],
  "attempts_list": [...],
  "target_confidence": 80,
  "max_subtasks": 5
}
```

## 🛠 Environment Variables

Add these to your `.env` file:

```bash
# Qraptor Configuration
QRAPTOR_BASE_URL=https://your-qraptor-instance.com
QRAPTOR_API_KEY=your_qraptor_api_key
QRAPTOR_AGENT_API_KEY=your_secure_agent_api_key

# Backend Configuration  
BACKEND_BASE_URL=http://localhost:5000
SUBSCRIPTION_ID=your_subscription_id
```

## 🔐 Security

1. **Agent Authentication**: All agent endpoints require `X-Qraptor-Agent-Key` header
2. **User Authentication**: User-facing endpoints require JWT authentication
3. **Workflow Tracking**: Each workflow has a unique ID for tracking and security

## 🧪 Testing the Workflow

### 1. Test Frontend Integration
```javascript
// In your frontend, when user completes module:
const response = await fetch('/api/qraptor/workflow/trigger', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: currentUser.id,
    domainId: 'mathematics',
    subdomainId: 'algebra', 
    moduleId: 'mathematics_algebra_linear',
    targetConfidence: 80,
    maxSubtasks: 5
  })
});

const result = await response.json();
console.log('Workflow initiated:', result.workflowId);
```

### 2. Monitor Workflow Progress
```javascript
// Check workflow status
const checkStatus = async (workflowId) => {
  const response = await fetch(`/api/qraptor/workflow/status/${workflowId}`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  return response.json();
};

// Poll until complete
const pollWorkflow = async (workflowId) => {
  const status = await checkStatus(workflowId);
  if (status.status.status.includes('completed')) {
    console.log('Workflow complete!');
    // Fetch generated subtasks
    const subtasks = await fetchUserSubtasks();
  } else {
    setTimeout(() => pollWorkflow(workflowId), 5000); // Check every 5 seconds
  }
};
```

### 3. Fetch Generated Subtasks
```javascript
const fetchUserSubtasks = async () => {
  const response = await fetch(
    `/api/qraptor/workflow/subtasks/${userId}/${domainId}/${subdomainId}`,
    {
      headers: { 'Authorization': `Bearer ${userToken}` }
    }
  );
  return response.json();
};
```

## 📁 Database Schema

The `QraptorSubtask` model stores:
- **Workflow tracking records** (for monitoring progress)
- **Generated subtasks** (for user interaction)
- **User attempts** (for progress tracking)
- **Metadata** (for analytics and debugging)

## 🔄 Error Handling

Each stage has comprehensive error handling:
- Failed workflows are marked with appropriate status
- Errors are logged with context for debugging
- Fallback mechanisms prevent data loss
- Retry logic can be implemented at the qRaptor level

This system provides a complete, production-ready integration between SocraticWingman and qRaptor's 3-agent workflow for intelligent subtask generation!
