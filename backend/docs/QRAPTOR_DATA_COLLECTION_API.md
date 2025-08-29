# Qraptor Agent Data Collection Endpoints

## Overview
These endpoints provide comprehensive data collection capabilities for the Qraptor AI agent after workflow initiation. The agent can fetch detailed user context, learning history, module information, and performance analytics to generate personalized subtasks.

## Authentication
All endpoints require the `X-Qraptor-Agent-Key` header with a valid API key:
```
X-Qraptor-Agent-Key: your_qraptor_agent_api_key
```

Set the environment variable in your backend:
```bash
QRAPTOR_AGENT_API_KEY=your_secure_api_key_here
```

## Endpoints

### 1. User Profile Data
**GET** `/api/qraptor/data/user-profile/:userId`

Retrieves comprehensive user profile information for personalization.

**Parameters:**
- `userId` (path) - User ID to fetch profile for

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_id",
    "level": 3,
    "xp": 1250,
    "registrationDate": "2024-01-15T10:30:00Z",
    "onboardingData": {
      "domains": ["mathematics", "science"],
      "experience_level": "intermediate",
      "preferred_study_time": "evening",
      "timezone": "EST"
    },
    "overallProgress": 65,
    "totalXP": 1250,
    "completedDomains": 2,
    "learningStreak": 7,
    "averageSessionTime": 25,
    "preferredDifficulty": "intermediate",
    "learningVelocity": "fast"
  },
  "timestamp": "2024-01-20T14:30:00Z"
}
```

### 2. Learning History
**GET** `/api/qraptor/data/learning-history/:userId`

Provides detailed learning history and performance patterns.

**Parameters:**
- `userId` (path) - User ID to fetch history for
- `domain` (query, optional) - Filter by specific domain
- `limit` (query, optional) - Limit number of sessions (default: 50)

**Example:** `/api/qraptor/data/learning-history/12345?domain=mathematics&limit=20`

**Response:**
```json
{
  "success": true,
  "data": {
    "recentSessions": [
      {
        "sessionId": "session_123",
        "testType": "adaptive",
        "domain": "mathematics",
        "score": 85,
        "percentage": 85,
        "timeSpent": 1200,
        "questionsCount": 15,
        "completedAt": "2024-01-20T12:00:00Z",
        "status": "completed"
      }
    ],
    "performanceTrends": {
      "trend": "improving",
      "recentAverage": 82,
      "previousAverage": 75,
      "improvement": 7
    },
    "strongAreas": ["algebra", "geometry"],
    "weakAreas": ["calculus", "statistics"],
    "improvementAreas": ["problem_solving", "time_management"],
    "peakPerformanceTime": "morning",
    "consistencyScore": 78
  },
  "sessionsAnalyzed": 25,
  "timestamp": "2024-01-20T14:30:00Z"
}
```

### 3. Module Context
**GET** `/api/qraptor/data/module-context/:moduleId`

Retrieves detailed module and curriculum context information.

**Parameters:**
- `moduleId` (path) - Module ID to fetch context for
- `subModuleId` (query, optional) - Specific sub-module

**Example:** `/api/qraptor/data/module-context/mathematics_algebra_linear?subModuleId=solving_equations`

**Response:**
```json
{
  "success": true,
  "data": {
    "moduleId": "mathematics_algebra_linear",
    "subModuleId": "solving_equations",
    "domain": "mathematics",
    "moduleSequence": ["algebra", "linear"],
    "prerequisites": ["basic_algebra", "equation_fundamentals"],
    "nextModules": ["quadratic_equations", "system_of_equations"],
    "relatedConcepts": ["variables", "coefficients", "constants"],
    "currentDifficulty": "intermediate",
    "difficultyProgression": ["beginner", "intermediate", "advanced"],
    "learningObjectives": [
      "Master solving_equations concepts",
      "Apply solving_equations in practice"
    ],
    "keyMilestones": ["linear_solve", "substitution_method"],
    "topicsHierarchy": {
      "main_topic": "linear_equations",
      "subtopics": ["one_variable", "two_variables"]
    },
    "practiceAreas": ["word_problems", "graphing", "verification"],
    "assessmentCriteria": {
      "accuracy": 80,
      "time_efficiency": 70,
      "method_understanding": 90
    }
  },
  "timestamp": "2024-01-20T14:30:00Z"
}
```

### 4. Performance Analytics
**GET** `/api/qraptor/data/performance-analytics/:userId/:moduleId`

Provides detailed performance analytics for specific user and module.

**Parameters:**
- `userId` (path) - User ID
- `moduleId` (path) - Module ID

**Example:** `/api/qraptor/data/performance-analytics/12345/mathematics_algebra_linear`

**Response:**
```json
{
  "success": true,
  "data": {
    "overallAccuracy": 78,
    "totalQuestions": 156,
    "averageScore": 82,
    "topicPerformance": [
      {
        "topic": "linear_equations",
        "accuracy": 85,
        "questionsAttempted": 45
      },
      {
        "topic": "solving_methods",
        "accuracy": 72,
        "questionsAttempted": 38
      }
    ],
    "difficultyBreakdown": {
      "easy": { "accuracy": 92, "count": 50 },
      "medium": { "accuracy": 78, "count": 75 },
      "hard": { "accuracy": 65, "count": 31 }
    },
    "strengths": ["substitution_method", "graphing"],
    "weaknesses": ["word_problems", "complex_systems"],
    "improvementRate": 12,
    "averageTimePerQuestion": 48,
    "timeEfficiency": 85,
    "commonMistakes": [
      "algebraic_manipulation_errors",
      "sign_errors_in_equations"
    ],
    "confidencePatterns": {
      "high_confidence_accuracy": 88,
      "low_confidence_accuracy": 65
    },
    "focusAreas": ["word_problems", "complex_systems"],
    "nextSteps": [
      "Continue practicing weak areas",
      "Advance to next difficulty level"
    ]
  },
  "sessionsAnalyzed": 12,
  "timestamp": "2024-01-20T14:30:00Z"
}
```

## Data Collection Workflow

After the Qraptor agent is initiated via the `/api/qraptor/subtasks/initiate` endpoint, it should collect additional context by calling these endpoints in sequence:

### Recommended Collection Order:

1. **User Profile** - Get basic user information and preferences
   ```bash
   GET /api/qraptor/data/user-profile/{userId}
   ```

2. **Learning History** - Understand user's learning patterns and progress
   ```bash
   GET /api/qraptor/data/learning-history/{userId}?domain={domain}&limit=30
   ```

3. **Module Context** - Get detailed curriculum and module information
   ```bash
   GET /api/qraptor/data/module-context/{moduleId}?subModuleId={subModuleId}
   ```

4. **Performance Analytics** - Get specific performance data for the module
   ```bash
   GET /api/qraptor/data/performance-analytics/{userId}/{moduleId}
   ```

## Integration with Qraptor Workflow

The complete Qraptor workflow becomes:

1. **Initiation** - User submits module → Backend calls `/api/qraptor/subtasks/initiate`
2. **Agent Setup** - Qraptor receives basic context and sets up processing agent
3. **Data Collection** - Agent calls these data collection endpoints for comprehensive context
4. **LLM Processing** - Agent processes all collected data to generate personalized subtasks
5. **Callback** - Qraptor sends results back to `/api/qraptor/subtasks/receive`

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common error codes:
- `401` - Invalid or missing Qraptor agent API key
- `404` - User not found or module not found
- `500` - Internal server error

## Security Considerations

1. **API Key Protection** - Store the Qraptor agent API key securely in environment variables
2. **Rate Limiting** - Consider implementing rate limiting for these endpoints
3. **Data Privacy** - Ensure user data is only accessible to authenticated Qraptor agents
4. **Audit Logging** - Log all agent access for security auditing

## Usage Example

Here's how the Qraptor agent would collect data after initiation:

```javascript
// Agent data collection sequence
const userId = "user_12345";
const moduleId = "mathematics_algebra_linear";

// 1. Get user profile
const userProfile = await fetch(`/api/qraptor/data/user-profile/${userId}`, {
  headers: { 'X-Qraptor-Agent-Key': agentApiKey }
});

// 2. Get learning history
const learningHistory = await fetch(`/api/qraptor/data/learning-history/${userId}?domain=mathematics&limit=30`, {
  headers: { 'X-Qraptor-Agent-Key': agentApiKey }
});

// 3. Get module context
const moduleContext = await fetch(`/api/qraptor/data/module-context/${moduleId}`, {
  headers: { 'X-Qraptor-Agent-Key': agentApiKey }
});

// 4. Get performance analytics
const performanceAnalytics = await fetch(`/api/qraptor/data/performance-analytics/${userId}/${moduleId}`, {
  headers: { 'X-Qraptor-Agent-Key': agentApiKey }
});

// Process all collected data for LLM
const comprehensiveContext = {
  userProfile: await userProfile.json(),
  learningHistory: await learningHistory.json(),
  moduleContext: await moduleContext.json(),
  performanceAnalytics: await performanceAnalytics.json()
};
```

This comprehensive data collection enables the Qraptor agent to generate highly personalized and contextually relevant subtasks for optimal learning outcomes.
