import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';
import { sendModuleSubmission } from '@/lib/qraptor';

interface TestSubmission {
  moduleId: string;
  subModuleId: string;
  userId: string;
  startTime: string;
  endTime: string;
  answers: Record<string, any>;
  timeSpent: number;
  completed: boolean;
}

interface TestSession {
  sessionId: string;
  submission: TestSubmission;
  score: number;
  results: any;
  timestamp: string;
}

const testSessionsPath = path.join(process.cwd(), 'data', 'test-sessions.json');

const readTestSessions = (): TestSession[] => {
  try {
    if (!fs.existsSync(testSessionsPath)) {
      return [];
    }
    const fileContent = fs.readFileSync(testSessionsPath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading test sessions:', error);
    return [];
  }
};

const writeTestSessions = (sessions: TestSession[]): void => {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(testSessionsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(testSessionsPath, JSON.stringify(sessions, null, 2));
  } catch (error) {
    console.error('Error writing test sessions:', error);
    throw error;
  }
};

const calculateScore = (answers: Record<string, any>, moduleId: string, subModuleId: string): number => {
  // Mock scoring logic - in real app, this would be more sophisticated
  const correctAnswers: Record<string, any> = {
    'arrays-array-basics': {
      'q1': 2, // O(1)
      'q2': 0, // int arr[10];
      'q3': 'partial', // Coding question - would need code analysis
      'q4': 'detailed' // Short answer - would need NLP analysis
    },
    'arrays-array-traversal': {
      'q1': 2, // for loop
      'q2': 'partial' // Coding question
    }
  };

  const moduleKey = `${moduleId}-${subModuleId}`;
  const moduleCorrectAnswers = correctAnswers[moduleKey] || {};
  
  let totalPoints = 0;
  let earnedPoints = 0;

  Object.keys(moduleCorrectAnswers).forEach(questionId => {
    const userAnswer = answers[questionId];
    const correctAnswer = moduleCorrectAnswers[questionId];
    
    totalPoints += 10; // Each question worth 10 points base
    
    if (typeof correctAnswer === 'number' && userAnswer === correctAnswer) {
      earnedPoints += 10;
    } else if (correctAnswer === 'partial' && userAnswer) {
      // For coding/text questions, give partial credit if answered
      earnedPoints += 7;
    } else if (correctAnswer === 'detailed' && userAnswer && userAnswer.length > 20) {
      // For detailed answers, check if substantial
      earnedPoints += 5;
    }
  });

  return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const submission: TestSubmission = req.body;

      if (!submission.userId || !submission.moduleId || !submission.subModuleId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Calculate score
      const score = calculateScore(submission.answers, submission.moduleId, submission.subModuleId);
      
      // Generate session ID
      const sessionId = `${submission.moduleId}-${submission.subModuleId}-${Date.now()}`;

      // Prepare data for Qraptor analysis
      const qraptorPayload = {
        userId: submission.userId,
        moduleId: `${submission.moduleId}_${submission.subModuleId}`,
        score,
        answers: submission.answers,
        timeSpent: submission.timeSpent,
        moduleType: 'dsa-cpp',
        difficulty: 'beginner'
      };

      // Send to Qraptor for analysis and get recommended subtasks
      let subtasks = [];
      try {
        subtasks = await sendModuleSubmission(qraptorPayload);
      } catch (error) {
        console.error('Qraptor API error:', error);
        // Fallback to default subtasks if Qraptor fails
        if (score < 70) {
          subtasks = [
            {
              id: `st_${Date.now()}_1`,
              title: 'Review Core Concepts',
              description: 'Revisit fundamental concepts that need strengthening',
              type: 'concept',
              difficulty: 'beginner'
            },
            {
              id: `st_${Date.now()}_2`,
              title: 'Practice Problems',
              description: 'Additional practice problems to reinforce learning',
              type: 'practice',
              difficulty: 'beginner'
            }
          ];
        }
      }

      // Create test session record
      const testSession: TestSession = {
        sessionId,
        submission,
        score,
        results: {
          subtasks,
          nextModuleUnlocked: score >= 70,
          feedback: score >= 80 ? 
            'Excellent work! You have a strong understanding of the concepts.' :
            score >= 70 ?
            'Good job! You understand most concepts but could benefit from additional practice.' :
            'You need more practice with these concepts. Complete the recommended subtasks before proceeding.'
        },
        timestamp: new Date().toISOString()
      };

      // Save test session
      const sessions = readTestSessions();
      sessions.push(testSession);
      writeTestSessions(sessions);

      // Update user's progress in users.json
      const usersPath = path.join(process.cwd(), 'data', 'users.json');
      try {
        const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const userIndex = usersData.users.findIndex((u: any) => u.id === submission.userId);
        
        if (userIndex !== -1) {
          const user = usersData.users[userIndex];
          
          // Initialize learning path if it doesn't exist
          if (!user.learningPath) {
            user.learningPath = { modules: [] };
          }

          // Find and update the module
          const moduleKey = `${submission.moduleId}_${submission.subModuleId}`;
          const moduleIndex = user.learningPath.modules.findIndex((m: any) => m.moduleId === moduleKey);
          
          if (moduleIndex !== -1) {
            user.learningPath.modules[moduleIndex] = {
              ...user.learningPath.modules[moduleIndex],
              completed: true,
              score,
              subtasks: subtasks.map((task: any) => ({
                ...task,
                completed: false
              }))
            };

            // Unlock next module if score is good enough
            if (score >= 70 && moduleIndex + 1 < user.learningPath.modules.length) {
              user.learningPath.modules[moduleIndex + 1].locked = false;
            }
          }

          fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
        }
      } catch (error) {
        console.error('Error updating user progress:', error);
      }

      res.status(200).json({
        sessionId,
        score,
        subtasks,
        nextModuleUnlocked: score >= 70,
        message: 'Test submitted successfully'
      });

    } catch (error) {
      console.error('Test submission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
