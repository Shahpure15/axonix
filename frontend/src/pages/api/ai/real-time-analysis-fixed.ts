import type { NextApiRequest, NextApiResponse } from 'next';

interface RealTimeAnalysisRequest {
  questionId: string;
  response: any;
  currentQuestion: {
    id: string;
    type: string;
    question: string;
    difficulty: string;
  };
  sessionData: {
    moduleId: string;
    subModuleId: string;
    answers: Record<string, any>;
    realTimeResponses: Array<{
      questionId: string;
      response: any;
      timestamp: string;
      confidence?: number;
    }>;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { questionId, response, currentQuestion, sessionData }: RealTimeAnalysisRequest = req.body;

      // Validate input
      if (!questionId || !currentQuestion || !sessionData) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Calculate progress metrics
      const answeredQuestions = Object.keys(sessionData.answers || {}).length;
      const totalQuestions = sessionData.realTimeResponses?.length || 1;
      const progressPercentage = (answeredQuestions / Math.max(totalQuestions, 1)) * 100;

      // Generate insights based on current performance
      const insights = generateRealTimeInsights(sessionData.answers, questionId, currentQuestion, progressPercentage);
      
      // Calculate confidence scores for current response
      const confidence = calculateAnswerConfidence(response, currentQuestion);

      const analysis = {
        insights,
        confidence,
        progressPercentage: Math.round(progressPercentage),
        recommendations: generateRecommendations(sessionData.answers, currentQuestion, progressPercentage),
        timeEstimate: estimateRemainingTime(answeredQuestions, totalQuestions),
        strengths: identifyCurrentStrengths(sessionData.answers, currentQuestion),
        focusAreas: identifyFocusAreas(sessionData.answers, currentQuestion)
      };

      res.status(200).json(analysis);
    } catch (error) {
      console.error('Real-time analysis error:', error);
      res.status(500).json({ error: 'Analysis temporarily unavailable' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function generateRealTimeInsights(answers: Record<string, any>, questionId: string, currentQuestion: any, progressPercentage: number): string {
  const insights = [
    "AI is analyzing your response patterns...",
    "Evaluating your understanding of key concepts...",
    `You're ${progressPercentage > 75 ? 'doing great' : progressPercentage > 50 ? 'making good progress' : 'building your foundation'} - keep going!`,
    "Real-time feedback will be generated upon submission.",
    `Building your knowledge step by step...`,
    progressPercentage > 80 ? "Excellent progress! You're demonstrating strong mastery." : 
    progressPercentage > 60 ? "Good work! Focus on completing all questions thoroughly." :
    "Take your time to think through each answer carefully."
  ];

  const randomInsight = insights[Math.floor(Math.random() * insights.length)];
  return randomInsight;
}

function calculateAnswerConfidence(response: any, currentQuestion: any): number {
  if (!response || !currentQuestion) {
    return 0;
  }

  switch (currentQuestion.type) {
    case 'multiple-choice':
      return response !== undefined && response !== null ? 95 : 0;
    case 'short-answer':
      const textLength = response.toString().length;
      if (textLength < 10) return 25;
      if (textLength < 50) return 60;
      if (textLength < 100) return 80;
      return 95;
    case 'coding':
      const codeLength = response.toString().length;
      if (codeLength < 20) return 20;
      if (codeLength < 100) return 50;
      if (codeLength < 200) return 75;
      return 90;
    default:
      return 50;
  }
}

function generateRecommendations(answers: Record<string, any>, currentQuestion: any, progressPercentage: number): string[] {
  const recommendations = [];

  if (progressPercentage < 50) {
    recommendations.push("Take time to read each question carefully");
    recommendations.push("Don't rush - focus on understanding the concepts");
  } else if (progressPercentage < 80) {
    recommendations.push("You're doing well - maintain this pace");
    recommendations.push("Review your answers before moving on");
  } else {
    recommendations.push("Excellent work! You're demonstrating strong understanding");
    recommendations.push("Continue with this level of attention to detail");
  }

  // Question-specific recommendations
  if (currentQuestion.type === 'coding') {
    recommendations.push("Consider edge cases in your solution");
    recommendations.push("Make sure your code is well-structured");
  } else if (currentQuestion.type === 'short-answer') {
    recommendations.push("Provide specific examples to support your answer");
    recommendations.push("Be clear and concise in your explanation");
  }

  return recommendations.slice(0, 3); // Return top 3 recommendations
}

function estimateRemainingTime(answered: number, total: number): string {
  const remaining = total - answered;
  const avgTimePerQuestion = 3; // minutes
  const estimatedMinutes = remaining * avgTimePerQuestion;
  
  if (estimatedMinutes < 1) return "Less than 1 minute";
  if (estimatedMinutes < 60) return `${Math.round(estimatedMinutes)} minutes`;
  
  const hours = Math.floor(estimatedMinutes / 60);
  const minutes = Math.round(estimatedMinutes % 60);
  return `${hours}h ${minutes}m`;
}

function identifyCurrentStrengths(answers: Record<string, any>, currentQuestion: any): string[] {
  const strengths = [];
  
  const answerCount = Object.keys(answers).length;
  if (answerCount > 0) {
    strengths.push("Consistent engagement with questions");
  }
  
  if (currentQuestion.difficulty === 'Hard') {
    strengths.push("Tackling challenging problems");
  }
  
  if (currentQuestion.type === 'coding') {
    strengths.push("Applying programming concepts");
  }
  
  return strengths.slice(0, 2);
}

function identifyFocusAreas(answers: Record<string, any>, currentQuestion: any): string[] {
  const focusAreas = [];
  
  if (currentQuestion.difficulty === 'Hard') {
    focusAreas.push("Complex problem solving");
  }
  
  if (currentQuestion.type === 'coding') {
    focusAreas.push("Algorithm implementation");
    focusAreas.push("Code optimization");
  } else if (currentQuestion.type === 'short-answer') {
    focusAreas.push("Conceptual explanation");
    focusAreas.push("Clear communication");
  }
  
  return focusAreas.slice(0, 2);
}
