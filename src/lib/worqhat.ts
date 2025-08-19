import axios from 'axios';

const WORQHAT_API_URL = process.env.WORQHAT_API_URL || 'https://api.worqhat.com';
const WORQHAT_API_KEY = process.env.WORQHAT_API_KEY;

if (!WORQHAT_API_KEY) {
  console.warn('WORQHAT_API_KEY not set in environment variables');
}

const worqhatClient = axios.create({
  baseURL: WORQHAT_API_URL,
  headers: {
    'Authorization': `Bearer ${WORQHAT_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export interface DiagnosticEvent {
  userId: string;
  domainId: string;
  score: number;
  timestamp?: string;
}

export interface ModuleSubmissionEvent {
  userId: string;
  moduleId: string;
  score: number;
  answers: Record<string, any>;
  timestamp?: string;
}

export interface SubTask {
  id: string;
  title: string;
  description: string;
  type: 'practice' | 'concept' | 'quiz';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  priority?: 'high' | 'medium' | 'low';
  estimatedTime?: string;
}

export interface UserPerformance {
  score: number;
  timeSpent: number;
  difficulty: string;
  answers?: Record<string, any>;
}

export interface SubtaskGenerationRequest {
  userId: string;
  moduleId: string;
  subModuleId: string;
  answers: Record<string, any>;
  performance: UserPerformance;
}

export interface WorkflowRequest {
  userId: string;
  learningMode: 'diagnostic' | 'learning' | 'practice' | 'review';
  domain: string;
  userLevel?: string;
  previousPerformance?: UserPerformance[];
  preferences?: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    timeAvailable: number; // in minutes
    focusAreas?: string[];
  };
}

export interface WorkflowTask {
  id: string;
  type: 'question' | 'concept' | 'practice' | 'review';
  title: string;
  description: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  codeSnippet?: string;
  hints?: string[];
}

export interface WorkflowResponse {
  sessionId: string;
  tasks: WorkflowTask[];
  estimatedDuration: number;
  adaptiveSettings: {
    difficultyLevel: string;
    focusAreas: string[];
    personalizedTips: string[];
  };
}

export async function sendDiagnosticEvent(event: DiagnosticEvent): Promise<void> {
  try {
    await worqhatClient.post('/events/diagnostic', {
      ...event,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending diagnostic event to Worqhat:', error);
    throw error;
  }
}

export async function sendModuleSubmission(event: ModuleSubmissionEvent): Promise<SubTask[]> {
  try {
    const response = await worqhatClient.post('/events/module-submission', {
      ...event,
      timestamp: new Date().toISOString()
    });
    
    // Worqhat will analyze the submission and return recommended subtasks
    return response.data.subtasks;
  } catch (error) {
    console.error('Error sending module submission to Worqhat:', error);
    throw error;
  }
}

// Default templated roadmap
export const getTemplatedRoadmap = (domainId: string) => {
  return [
    {
      moduleId: `${domainId}_m1`,
      title: 'Fundamentals and Core Concepts',
      description: 'Master the basic principles and core concepts',
      estimatedHours: 4
    },
    {
      moduleId: `${domainId}_m2`, 
      title: 'Practical Implementation',
      description: 'Apply concepts in real-world scenarios',
      estimatedHours: 6
    },
    {
      moduleId: `${domainId}_m3`,
      title: 'Advanced Topics',
      description: 'Explore advanced concepts and edge cases',
      estimatedHours: 8
    }
  ];
};

// Generate personalized subtasks based on user performance and answers
export async function generatePersonalizedSubtasks(request: SubtaskGenerationRequest): Promise<SubTask[]> {
  try {
    const { userId, moduleId, subModuleId, answers, performance } = request;
    
    // Analyze user's weak areas and strengths
    const weakAreas = analyzeWeakAreas(answers, performance);
    const strengths = analyzeStrengths(answers, performance);
    
    // Generate subtasks using Worqhat AI
    const prompt = `
      Based on the following user performance data, generate 3-5 personalized subtasks for continuous improvement:
      
      Module: ${moduleId}
      Sub-module: ${subModuleId}
      Score: ${performance.score}%
      Time Spent: ${performance.timeSpent} minutes
      Difficulty Level: ${performance.difficulty}
      
      Weak Areas: ${weakAreas.join(', ')}
      Strengths: ${strengths.join(', ')}
      
      User Answers Analysis:
      ${JSON.stringify(answers, null, 2)}
      
      Generate subtasks that:
      1. Address identified weak areas
      2. Build on existing strengths
      3. Gradually increase in difficulty
      4. Include varied learning approaches (practice, concepts, quizzes)
      5. Are specific and actionable
      
      Return as a JSON array of subtasks with the following structure:
      {
        "id": "unique_id",
        "title": "Clear, specific title",
        "description": "Detailed description of what to learn/practice",
        "type": "practice|concept|quiz",
        "difficulty": "beginner|intermediate|advanced",
        "priority": "high|medium|low",
        "estimatedTime": "X minutes"
      }
    `;

    const response = await fetch('/api/worqhat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: prompt,
        training_data: `User Performance: Score ${performance.score}%, Time ${performance.timeSpent}min, Level ${performance.difficulty}`,
        model: 'aicon-v4',
        randomness: 0.2
      }),
    });

    if (!response.ok) {
      throw new Error(`Worqhat API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the AI response and validate subtasks
    let subtasks: SubTask[] = [];
    try {
      const aiResponse = data.content || data.response || '';
      const parsed = JSON.parse(aiResponse);
      subtasks = Array.isArray(parsed) ? parsed : [parsed];
    } catch (parseError) {
      console.warn('Failed to parse AI response, using fallback subtasks');
      subtasks = generateFallbackSubtasks(performance, moduleId, subModuleId);
    }

    // Validate and enhance subtasks
    return subtasks.map((subtask, index) => ({
      id: subtask.id || `subtask_${Date.now()}_${index}`,
      title: subtask.title || `Practice Task ${index + 1}`,
      description: subtask.description || 'Complete this practice exercise to improve your understanding.',
      type: subtask.type || 'practice',
      difficulty: (subtask.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
      priority: subtask.priority || 'medium',
      estimatedTime: subtask.estimatedTime || '10-15 minutes'
    }));

  } catch (error) {
    console.error('Error generating personalized subtasks:', error);
    // Return fallback subtasks
    return generateFallbackSubtasks(request.performance, request.moduleId, request.subModuleId);
  }
}

// Analyze weak areas based on answers and performance
function analyzeWeakAreas(answers: Record<string, any>, performance: UserPerformance): string[] {
  const weakAreas: string[] = [];
  
  // Analyze based on score
  if (performance.score < 70) {
    weakAreas.push('fundamental concepts');
  }
  if (performance.score < 50) {
    weakAreas.push('basic understanding');
  }
  
  // Analyze based on time spent
  if (performance.timeSpent > 30) {
    weakAreas.push('problem-solving speed');
  }
  
  // Analyze specific answer patterns
  Object.entries(answers).forEach(([key, value]) => {
    if (key.toLowerCase().includes('concept') && (!value || value === '')) {
      weakAreas.push('conceptual understanding');
    }
    if (key.toLowerCase().includes('practical') && (!value || value === '')) {
      weakAreas.push('practical application');
    }
  });
  
  return weakAreas.length > 0 ? weakAreas : ['general comprehension'];
}

// Analyze strengths based on answers and performance
function analyzeStrengths(answers: Record<string, any>, performance: UserPerformance): string[] {
  const strengths: string[] = [];
  
  if (performance.score >= 80) {
    strengths.push('strong conceptual grasp');
  }
  if (performance.score >= 90) {
    strengths.push('excellent understanding');
  }
  if (performance.timeSpent < 15) {
    strengths.push('efficient problem solving');
  }
  
  return strengths.length > 0 ? strengths : ['dedication to learning'];
}

// Generate fallback subtasks when AI fails
function generateFallbackSubtasks(performance: UserPerformance, moduleId: string, subModuleId: string): SubTask[] {
  const difficulty: 'beginner' | 'intermediate' | 'advanced' = 
    performance.score >= 80 ? 'advanced' : 
    performance.score >= 60 ? 'intermediate' : 'beginner';
  
  return [
    {
      id: `fallback_practice_${Date.now()}`,
      title: 'Review Core Concepts',
      description: `Review the fundamental concepts from ${subModuleId} to strengthen your understanding.`,
      type: 'concept',
      difficulty: difficulty,
      priority: 'high',
      estimatedTime: '15-20 minutes'
    },
    {
      id: `fallback_quiz_${Date.now()}`,
      title: 'Practice Quiz',
      description: `Take a focused quiz on areas that need improvement from ${subModuleId}.`,
      type: 'quiz',
      difficulty: difficulty,
      priority: 'medium',
      estimatedTime: '10-15 minutes'
    },
    {
      id: `fallback_practical_${Date.now()}`,
      title: 'Hands-on Practice',
      description: `Apply what you've learned through practical exercises related to ${subModuleId}.`,
      type: 'practice',
      difficulty: difficulty,
      priority: 'medium',
      estimatedTime: '20-25 minutes'
    }
  ];
}

// Create personalized learning workflow using WorqHat AI
export async function createLearningWorkflow(request: WorkflowRequest): Promise<WorkflowResponse> {
  try {
    const workflowDescription = generateWorkflowDescription(request);
    
    const response = await fetch(`${WORQHAT_API_URL}/api/ai/content/v4`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WORQHAT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: workflowDescription,
        model: 'aicon-v4',
        randomness: 0.3,
        response_type: 'json'
      }),
    });

    if (!response.ok) {
      throw new Error(`WorqHat API error: ${response.status}`);
    }

    const data = await response.json();
    let workflowData: any;

    try {
      const aiResponse = data.content || data.response || '';
      workflowData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.warn('Failed to parse AI workflow response, using fallback');
      workflowData = generateFallbackWorkflow(request);
    }

    return {
      sessionId: `session_${Date.now()}_${request.userId}`,
      tasks: validateAndFormatTasks(workflowData.tasks || []),
      estimatedDuration: workflowData.estimatedDuration || getDefaultDuration(request.learningMode),
      adaptiveSettings: {
        difficultyLevel: workflowData.difficultyLevel || (request.preferences?.difficulty || 'intermediate'),
        focusAreas: workflowData.focusAreas || [request.domain],
        personalizedTips: workflowData.personalizedTips || [`Focus on ${request.domain} fundamentals`, 'Take breaks every 25 minutes', 'Practice active recall']
      }
    };

  } catch (error) {
    console.error('Error creating learning workflow:', error);
    return generateFallbackWorkflow(request);
  }
}

// Generate workflow description for AI
function generateWorkflowDescription(request: WorkflowRequest): string {
  const modeDescriptions = {
    'diagnostic': 'Evaluate current knowledge level',
    'learning': 'Learn new concepts with practice',
    'practice': 'Reinforce skills with coding problems',
    'review': 'Review concepts using spaced repetition'
  };

  return `
    Create a personalized learning workflow for:
    
    **Learning Mode**: ${request.learningMode} - ${modeDescriptions[request.learningMode]}
    **Domain**: ${request.domain}
    **User Level**: ${request.userLevel || 'intermediate'}
    **Time Available**: ${request.preferences?.timeAvailable || 30} minutes
    **Difficulty Preference**: ${request.preferences?.difficulty || 'intermediate'}
    ${request.preferences?.focusAreas ? `**Focus Areas**: ${request.preferences.focusAreas.join(', ')}` : ''}
    
    Return a JSON response with this structure:
    {
      "tasks": [
        {
          "id": "unique_task_id",
          "type": "question|concept|practice|review",
          "title": "Task Title",
          "description": "Task Description",
          "content": "Main content/question text",
          "difficulty": "beginner|intermediate|advanced",
          "estimatedTime": 5,
          "options": ["Option A", "Option B", "Option C", "Option D"] (for questions only),
          "correctAnswer": "correct option" (for questions only),
          "explanation": "Detailed explanation",
          "codeSnippet": "code example if applicable",
          "hints": ["hint1", "hint2"]
        }
      ],
      "estimatedDuration": 30,
      "difficultyLevel": "intermediate",
      "focusAreas": ["${request.domain}"],
      "personalizedTips": ["tip1", "tip2", "tip3"]
    }
    
    Generate 3-5 high-quality, progressive tasks that match the learning mode and user preferences.
    Make sure tasks are engaging, educational, and appropriate for the ${request.domain} domain.
  `;
}

// Validate and format tasks from AI response
function validateAndFormatTasks(tasks: any[]): WorkflowTask[] {
  return tasks.map((task, index) => ({
    id: task.id || `task_${Date.now()}_${index}`,
    type: task.type || 'concept',
    title: task.title || `Learning Task ${index + 1}`,
    description: task.description || 'Complete this learning task',
    content: task.content || 'Learning content',
    difficulty: task.difficulty || 'intermediate',
    estimatedTime: task.estimatedTime || 10,
    options: task.options || [],
    correctAnswer: task.correctAnswer || '',
    explanation: task.explanation || '',
    codeSnippet: task.codeSnippet || '',
    hints: task.hints || []
  }));
}

// Generate fallback workflow when AI fails
function generateFallbackWorkflow(request: WorkflowRequest): WorkflowResponse {
  const defaultTasks = generateDefaultTasks(request);
  
  return {
    sessionId: `fallback_session_${Date.now()}_${request.userId}`,
    tasks: defaultTasks,
    estimatedDuration: getDefaultDuration(request.learningMode),
    adaptiveSettings: {
      difficultyLevel: request.preferences?.difficulty || 'intermediate',
      focusAreas: [request.domain],
      personalizedTips: [
        `Focus on mastering ${request.domain} fundamentals`,
        'Practice regularly for better retention',
        'Don\'t hesitate to review concepts multiple times'
      ]
    }
  };
}

// Generate default tasks based on learning mode
function generateDefaultTasks(request: WorkflowRequest): WorkflowTask[] {
  const domain = request.domain;
  const mode = request.learningMode;
  
  const baseTasks = {
    'diagnostic': [
      {
        id: `diagnostic_${Date.now()}_1`,
        type: 'question' as const,
        title: `${domain} Knowledge Assessment`,
        description: 'Evaluate your current understanding',
        content: `What is your experience level with ${domain}?`,
        difficulty: 'intermediate' as const,
        estimatedTime: 5,
        options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        correctAnswer: '',
        explanation: 'This helps us tailor your learning experience',
        codeSnippet: '',
        hints: ['Choose honestly for best results']
      }
    ],
    'learning': [
      {
        id: `learning_${Date.now()}_1`,
        type: 'concept' as const,
        title: `Introduction to ${domain}`,
        description: 'Learn fundamental concepts',
        content: `Let's explore the core concepts of ${domain}`,
        difficulty: 'beginner' as const,
        estimatedTime: 15,
        options: [],
        correctAnswer: '',
        explanation: '',
        codeSnippet: '',
        hints: []
      }
    ],
    'practice': [
      {
        id: `practice_${Date.now()}_1`,
        type: 'practice' as const,
        title: `${domain} Practice Problems`,
        description: 'Apply your knowledge through practice',
        content: `Complete these ${domain} exercises`,
        difficulty: 'intermediate' as const,
        estimatedTime: 20,
        options: [],
        correctAnswer: '',
        explanation: '',
        codeSnippet: '',
        hints: []
      }
    ],
    'review': [
      {
        id: `review_${Date.now()}_1`,
        type: 'review' as const,
        title: `Review ${domain} Concepts`,
        description: 'Reinforce previous learning',
        content: `Review key ${domain} concepts you've learned`,
        difficulty: 'intermediate' as const,
        estimatedTime: 10,
        options: [],
        correctAnswer: '',
        explanation: '',
        codeSnippet: '',
        hints: []
      }
    ]
  };
  
  return baseTasks[mode] || baseTasks['learning'];
}

// Get default duration based on learning mode
function getDefaultDuration(mode: string): number {
  const durations = {
    'diagnostic': 20,
    'learning': 35,
    'practice': 25,
    'review': 15
  };
  
  return durations[mode as keyof typeof durations] || 30;
}
