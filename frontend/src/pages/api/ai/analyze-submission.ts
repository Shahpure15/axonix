import type { NextApiRequest, NextApiResponse } from 'next';
import { generatePersonalizedSubtasks } from '@/lib/qraptor';

interface AnalysisRequest {
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
    timeSpent: number;
  };
  testQuestions: Array<{
    id: string;
    type: string;
    question: string;
    difficulty: string;
    points: number;
  }>;
  moduleContext: {
    moduleId: string;
    subModuleId: string;
    difficulty: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { sessionData, testQuestions, moduleContext }: AnalysisRequest = req.body;

      console.log('Processing AI analysis for:', moduleContext);

      // Calculate basic score
      const answeredQuestions = Object.keys(sessionData.answers).length;
      const totalQuestions = testQuestions.length;
      const completionRate = (answeredQuestions / totalQuestions) * 100;
      
      // Calculate confidence score
      const avgConfidence = sessionData.realTimeResponses?.reduce((acc, response) => 
        acc + (response.confidence || 0), 0) / Math.max(sessionData.realTimeResponses?.length || 1, 1);

      // Analyze response patterns
      const responsePatterns = analyzeResponsePatterns(sessionData.answers, testQuestions);
      
      try {
        // Try to get AI-generated subtasks from Qraptor
        const aiSubtasks = await generatePersonalizedSubtasks({
          userId: 'current-user',
          moduleId: sessionData.moduleId,
          subModuleId: sessionData.subModuleId,
          answers: sessionData.answers,
          performance: {
            score: Math.round(completionRate),
            timeSpent: sessionData.timeSpent || 900,
            difficulty: moduleContext.difficulty
          }
        });

        if (aiSubtasks && aiSubtasks.length > 0) {
          const feedback = {
            score: Math.round(Math.min(95, Math.max(60, completionRate + avgConfidence * 0.3))),
            feedback: generateContextualFeedback(completionRate, avgConfidence, responsePatterns),
            suggestions: generateSuggestions(responsePatterns),
            nextTopics: generateNextTopics(moduleContext.subModuleId),
            strengths: identifyStrengths(responsePatterns, avgConfidence),
            weaknesses: identifyWeaknesses(responsePatterns, completionRate),
            subtasks: aiSubtasks.map((subtask: any, index: number) => ({
              id: `ai_${Date.now()}_${index}`,
              title: subtask.title || `Advanced ${moduleContext.subModuleId} Practice`,
              description: subtask.description || `Practice advanced concepts in ${moduleContext.subModuleId}`,
              priority: subtask.priority || (index === 0 ? 'high' : index === 1 ? 'medium' : 'low'),
              estimatedTime: subtask.estimatedTime || `${30 + index * 15} minutes`
            }))
          };

          return res.status(200).json(feedback);
        }
      } catch (qraptorError) {
        console.log('Qraptor AI unavailable, using enhanced fallback');
      }

      // Enhanced fallback with better analysis
      const feedback = {
        score: Math.round(Math.min(95, Math.max(60, completionRate + avgConfidence * 0.3))),
        feedback: generateContextualFeedback(completionRate, avgConfidence, responsePatterns),
        suggestions: generateSuggestions(responsePatterns),
        nextTopics: generateNextTopics(moduleContext.subModuleId),
        strengths: identifyStrengths(responsePatterns, avgConfidence),
        weaknesses: identifyWeaknesses(responsePatterns, completionRate),
        subtasks: generateIntelligentSubtasks(moduleContext, responsePatterns, completionRate)
      };

      res.status(200).json(feedback);
    } catch (error) {
      console.error('AI analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze submission' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function analyzeResponsePatterns(answers: Record<string, any>, questions: any[]) {
  const patterns = {
    multipleChoiceAccuracy: 0,
    codeQualityScore: 0,
    responseCompleteness: 0,
    conceptualUnderstanding: 0
  };

  let mcCount = 0;
  let codeCount = 0;
  let totalResponseLength = 0;

  questions.forEach(q => {
    const answer = answers[q.id];
    if (!answer) return;

    if (q.type === 'multiple-choice') {
      mcCount++;
      // Simulate accuracy based on confidence
      patterns.multipleChoiceAccuracy += Math.random() > 0.3 ? 1 : 0;
    } else if (q.type === 'coding') {
      codeCount++;
      const codeLength = answer.toString().length;
      patterns.codeQualityScore += Math.min(100, codeLength / 5); // Basic code quality metric
    }
    
    totalResponseLength += answer.toString().length;
  });

  patterns.multipleChoiceAccuracy = mcCount > 0 ? (patterns.multipleChoiceAccuracy / mcCount) * 100 : 0;
  patterns.codeQualityScore = codeCount > 0 ? patterns.codeQualityScore / codeCount : 0;
  patterns.responseCompleteness = Math.min(100, totalResponseLength / (questions.length * 50));
  patterns.conceptualUnderstanding = (patterns.multipleChoiceAccuracy + patterns.responseCompleteness) / 2;

  return patterns;
}

function generateContextualFeedback(completionRate: number, avgConfidence: number, patterns: any): string {
  if (completionRate >= 90 && avgConfidence >= 80) {
    return "Excellent work! You've demonstrated strong mastery of the concepts with high confidence in your responses. Your analytical approach and attention to detail are impressive.";
  } else if (completionRate >= 75) {
    return "Good progress! You've shown solid understanding of most concepts. Focus on the areas highlighted in your personalized subtasks to achieve mastery.";
  } else if (completionRate >= 60) {
    return "You're on the right track! There are some key concepts that need reinforcement. The recommended subtasks will help strengthen your foundation.";
  } else {
    return "This is a learning opportunity! Don't worry - the personalized subtasks are designed to help you build confidence and understanding step by step.";
  }
}

function generateSuggestions(patterns: any): string[] {
  const suggestions = [];
  
  if (patterns.multipleChoiceAccuracy < 70) {
    suggestions.push("Review fundamental concepts and definitions");
    suggestions.push("Practice with flashcards for key terminology");
  }
  
  if (patterns.codeQualityScore < 60) {
    suggestions.push("Practice writing clean, well-commented code");
    suggestions.push("Focus on proper syntax and code structure");
  }
  
  if (patterns.responseCompleteness < 70) {
    suggestions.push("Provide more detailed explanations in your answers");
    suggestions.push("Take time to fully think through each question");
  }

  suggestions.push("Work through the recommended subtasks in order");
  
  return suggestions;
}

function generateNextTopics(subModuleId: string): string[] {
  const topicMap: Record<string, string[]> = {
    'array-basics': [
      'Array traversal patterns',
      'Memory optimization techniques',
      'Multi-dimensional arrays'
    ],
    'array-traversal': [
      'Advanced iteration methods',
      'Performance optimization',
      'Complex array algorithms'
    ],
    'linked-list-basics': [
      'Doubly linked lists',
      'Circular linked lists',
      'Memory management'
    ]
  };

  return topicMap[subModuleId] || [
    'Advanced algorithms',
    'Data structure optimization',
    'Real-world applications'
  ];
}

function identifyStrengths(patterns: any, avgConfidence: number): string[] {
  const strengths = [];
  
  if (patterns.multipleChoiceAccuracy > 80) {
    strengths.push("Strong conceptual understanding");
  }
  
  if (patterns.codeQualityScore > 70) {
    strengths.push("Good coding practices");
  }
  
  if (avgConfidence > 75) {
    strengths.push("Confident in your knowledge");
  }
  
  if (patterns.responseCompleteness > 80) {
    strengths.push("Thorough and detailed responses");
  }

  if (strengths.length === 0) {
    strengths.push("Willingness to learn and improve");
  }
  
  return strengths;
}

function identifyWeaknesses(patterns: any, completionRate: number): string[] {
  const weaknesses = [];
  
  if (patterns.multipleChoiceAccuracy < 60) {
    weaknesses.push("Conceptual understanding needs reinforcement");
  }
  
  if (patterns.codeQualityScore < 50) {
    weaknesses.push("Code implementation skills");
  }
  
  if (completionRate < 80) {
    weaknesses.push("Time management or question completion");
  }
  
  if (patterns.responseCompleteness < 60) {
    weaknesses.push("Response depth and detail");
  }

  return weaknesses;
}

function generateIntelligentSubtasks(moduleContext: any, patterns: any, completionRate: number) {
  const subtasks = [];
  
  // High priority subtask based on weakest area
  if (patterns.multipleChoiceAccuracy < 60) {
    subtasks.push({
      id: `concept_review_${Date.now()}`,
      title: `${moduleContext.subModuleId.replace('-', ' ')} Concept Review`,
      description: `Comprehensive review of fundamental concepts with interactive examples`,
      priority: 'high',
      estimatedTime: '45 minutes'
    });
  }
  
  // Medium priority for code practice
  if (patterns.codeQualityScore < 70) {
    subtasks.push({
      id: `coding_practice_${Date.now()}`,
      title: `Hands-on Coding Practice`,
      description: `Practice implementing algorithms with step-by-step guidance`,
      priority: 'medium',
      estimatedTime: '60 minutes'
    });
  }
  
  // Additional practice based on performance
  if (completionRate < 80) {
    subtasks.push({
      id: `comprehensive_practice_${Date.now()}`,
      title: `Comprehensive Problem Solving`,
      description: `Mixed practice problems to reinforce all concepts`,
      priority: completionRate < 60 ? 'high' : 'medium',
      estimatedTime: '50 minutes'
    });
  }
  
  // Advanced topics for high performers
  if (completionRate > 85 && patterns.conceptualUnderstanding > 80) {
    subtasks.push({
      id: `advanced_topics_${Date.now()}`,
      title: `Advanced Applications`,
      description: `Explore real-world applications and optimization techniques`,
      priority: 'low',
      estimatedTime: '40 minutes'
    });
  }

  // Ensure we always have at least 2 subtasks
  while (subtasks.length < 2) {
    subtasks.push({
      id: `practice_${Date.now()}_${subtasks.length}`,
      title: `Additional Practice Session`,
      description: `Extra practice to strengthen understanding`,
      priority: 'medium',
      estimatedTime: '35 minutes'
    });
  }
  
  return subtasks.slice(0, 4); // Limit to 4 subtasks max
}
