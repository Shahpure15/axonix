/**
 * Test Service (TypeScript)
 * Handles test creation, execution, scoring, and result storage
 */

import { 
  getDiagnosticQuestions, 
  getQuestionModel,
  isValidDomain,
  getDomainFromString 
} from '../models/DomainQuestions';
import TestSession, { ITestSessionDocument, ITestSessionQuestion } from '../models/TestSession';
import { Domain, IQuestionDocument } from '../types/domain-questions';

// Test Answer Interface
export interface ITestAnswer {
  questionId: string;
  answer: any;
  timeSpent: number;
  confidenceLevel?: number;
  attemptCount?: number;
  skipped?: boolean;
  flaggedForReview?: boolean;
}

// Test Result Interface
export interface ITestResult {
  sessionId: string;
  score: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  domain: Domain;
  testType: string;
  results: Array<{
    questionId: string;
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
    points: number;
    timeSpent: number;
    explanation?: string;
  }>;
  recommendations: string[];
  performanceInsights: {
    avgTimePerQuestion: number;
    fastestQuestion: number;
    slowestQuestion: number;
    questionsRushed: number;
    questionsStruggledWith: number;
  } | null;
}

// Test Creation Response Interface
export interface ITestCreationResponse {
  sessionId: string;
  questions: Array<{
    id: string;
    questionText: string;
    questionType: string;
    options?: Array<{ text: string }>;
    difficulty: string;
    points: number;
  }>;
  totalQuestions: number;
  timeLimit: number;
  domain: Domain;
  testType: string;
}

class TestService {
  /**
   * Create a new test session
   */
  static async createTestSession(
    userId: string,
    domain: string,
    testType: 'diagnostic' | 'module-quiz' | 'practice' | 'final-assessment' = 'diagnostic',
    questionCount: number = 10
  ): Promise<ITestCreationResponse> {
    // Validate domain
    if (!isValidDomain(domain)) {
      throw new Error(`Invalid domain: ${domain}`);
    }

    const validDomain = getDomainFromString(domain);

    // Get questions for the test
    const questions = await getDiagnosticQuestions(validDomain, questionCount);
    
    if (!questions || questions.length === 0) {
      throw new Error(`No questions available for domain: ${domain}`);
    }

    // Create new test session
    const testSession = new TestSession({
      userId,
      testType,
      domain: validDomain,
      questions: questions.map((q: IQuestionDocument) => ({
        questionId: q._id,
        userAnswer: null,
        isCorrect: null,
        timeSpent: 0,
        points: 0,
        confidenceLevel: null,
        attemptCount: 0,
        skipped: false,
        flaggedForReview: false,
        answerTimestamp: new Date()
      })),
      totalQuestions: questions.length,
      score: 0,
      correctAnswers: 0,
      percentage: 0,
      status: 'in-progress',
      startedAt: new Date(),
      totalTimeSpent: 0
    });

    await testSession.save();

    // Return sanitized questions (without correct answers)
    const sanitizedQuestions = questions.map((q: IQuestionDocument) => ({
      id: q._id.toString(),
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options ? q.options.map(opt => ({ text: opt.text })) : [],
      difficulty: q.difficulty,
      points: q.points
    }));

    return {
      sessionId: (testSession._id as any).toString(),
      questions: sanitizedQuestions,
      totalQuestions: questions.length,
      timeLimit: questions.length * 90, // 90 seconds per question
      domain: validDomain,
      testType
    };
  }

  /**
   * Submit test answers and calculate results
   */
  static async submitTestAnswers(
    sessionId: string,
    userId: string,
    answers: ITestAnswer[],
    totalTimeSpent: number
  ): Promise<ITestResult> {
    // Find the test session
    const testSession = await TestSession.findOne({
      _id: sessionId,
      userId,
      status: 'in-progress'
    });

    if (!testSession) {
      throw new Error('Test session not found or already completed');
    }

    const domain = getDomainFromString(testSession.domain);
    
    // Get the original questions with correct answers
    const QuestionModel = getQuestionModel(domain);
    const questionIds = testSession.questions.map(q => q.questionId);
    const originalQuestions = await QuestionModel.find({ _id: { $in: questionIds } });
    
    let correctAnswers = 0;
    let totalPoints = 0;
    const detailedResults: ITestResult['results'] = [];

    // Process each answer and calculate score
    testSession.questions.forEach((sessionQuestion: ITestSessionQuestion, index: number) => {
      const userAnswer = answers.find(a => a.questionId === sessionQuestion.questionId.toString());
      const originalQuestion = originalQuestions.find(q => 
        q._id.toString() === sessionQuestion.questionId.toString()
      );

      if (originalQuestion && userAnswer) {
        // Update session question with user's response
        sessionQuestion.userAnswer = userAnswer.answer;
        sessionQuestion.timeSpent = userAnswer.timeSpent || 0;
        sessionQuestion.confidenceLevel = userAnswer.confidenceLevel || 3;
        sessionQuestion.attemptCount = userAnswer.attemptCount || 1;
        sessionQuestion.skipped = userAnswer.skipped || false;
        sessionQuestion.flaggedForReview = userAnswer.flaggedForReview || false;
        sessionQuestion.answerTimestamp = new Date();

        // Determine correct answer and check if user's answer is correct
        let isCorrect = false;
        let correctAnswer: any = null;

        if (originalQuestion.questionType === 'multiple-choice') {
          const correctOption = originalQuestion.options?.find(opt => opt.isCorrect);
          correctAnswer = correctOption?.text || 'No correct answer found';
          isCorrect = userAnswer.answer === correctAnswer;
        } else if (originalQuestion.questionType === 'true-false') {
          correctAnswer = originalQuestion.correctAnswer || 'true';
          isCorrect = userAnswer.answer?.toString().toLowerCase() === correctAnswer.toLowerCase();
        } else if (originalQuestion.questionType === 'short-answer') {
          correctAnswer = originalQuestion.correctAnswer || '';
          // Simple string comparison (could be enhanced with fuzzy matching)
          isCorrect = userAnswer.answer?.toString().toLowerCase().trim() === 
                     correctAnswer.toLowerCase().trim();
        }

        // Update session question results
        sessionQuestion.isCorrect = isCorrect;
        if (isCorrect) {
          sessionQuestion.points = originalQuestion.points;
          correctAnswers++;
          totalPoints += originalQuestion.points;
        } else {
          sessionQuestion.points = 0;
        }

        // Add to detailed results
        detailedResults.push({
          questionId: sessionQuestion.questionId.toString(),
          userAnswer: userAnswer.answer,
          correctAnswer,
          isCorrect,
          points: sessionQuestion.points,
          timeSpent: sessionQuestion.timeSpent,
          explanation: originalQuestion.explanation
        });
      }
    });

    // Update test session with final results
    testSession.correctAnswers = correctAnswers;
    testSession.score = totalPoints;
    testSession.percentage = Math.round((correctAnswers / testSession.totalQuestions) * 100);
    testSession.status = 'completed';
    testSession.completedAt = new Date();
    testSession.totalTimeSpent = totalTimeSpent;

    // Generate recommendations based on performance
    const recommendations = this.generateRecommendations(
      testSession.percentage,
      domain,
      detailedResults
    );
    testSession.recommendations = recommendations;

    await testSession.save();

    // Get performance insights
    const performanceInsights = testSession.getPerformanceInsights();

    return {
      sessionId: (testSession._id as any).toString(),
      score: testSession.score,
      percentage: testSession.percentage,
      correctAnswers: testSession.correctAnswers,
      totalQuestions: testSession.totalQuestions,
      timeTaken: testSession.totalTimeSpent,
      domain,
      testType: testSession.testType,
      results: detailedResults,
      recommendations: recommendations.map(r => 
        `${r.domain}: ${r.level} level - Focus on ${r.modules.join(', ')}`
      ),
      performanceInsights
    };
  }

  /**
   * Get test session details
   */
  static async getTestSession(sessionId: string, userId: string): Promise<ITestSessionDocument | null> {
    return await TestSession.findOne({ _id: sessionId, userId });
  }

  /**
   * Get user's test history
   */
  static async getUserTestHistory(
    userId: string, 
    testType?: string, 
    domain?: string,
    limit: number = 20
  ): Promise<ITestSessionDocument[]> {
    const query: any = { userId };
    if (testType) query.testType = testType;
    if (domain) query.domain = domain;

    return await TestSession.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Get user's performance analytics
   */
  static async getUserAnalytics(userId: string, domain?: Domain) {
    const query: any = { userId };
    if (domain) query.domain = domain;

    const sessions = await TestSession.find(query).sort({ createdAt: -1 }).limit(50);
    
    return {
      totalTests: sessions.length,
      averageScore: sessions.length > 0 ? 
        sessions.reduce((sum, test) => sum + test.percentage, 0) / sessions.length : 0,
      completedTests: sessions.filter(test => test.status === 'completed').length,
      domains: [...new Set(sessions.map(test => test.domain))],
      recentPerformance: sessions.slice(0, 10).map(test => ({
        domain: test.domain,
        percentage: test.percentage,
        date: test.completedAt
      }))
    };
  }

  /**
   * Generate personalized recommendations based on test performance
   */
  private static generateRecommendations(
    percentage: number, 
    domain: Domain, 
    results: ITestResult['results']
  ): Array<{ domain: string; level: string; modules: string[] }> {
    const recommendations: Array<{ domain: string; level: string; modules: string[] }> = [];
    
    // Determine overall level and focus areas
    let level: string;
    let modules: string[] = [];

    if (percentage >= 80) {
      level = 'advanced';
      modules = ['Advanced Projects', 'Specialized Topics', 'Industry Applications'];
    } else if (percentage >= 60) {
      level = 'intermediate';
      modules = ['Core Concepts Review', 'Practical Applications', 'Problem Solving'];
    } else {
      level = 'beginner';
      modules = ['Fundamental Concepts', 'Basic Principles', 'Foundation Building'];
    }

    // Add specific recommendations based on incorrect answers
    const incorrectAreas = results
      .filter(r => !r.isCorrect)
      .map(r => r.questionId); // Could be enhanced to map to specific topics

    if (incorrectAreas.length > 0) {
      modules.push('Review Missed Concepts', 'Practice Similar Questions');
    }

    recommendations.push({
      domain,
      level,
      modules
    });

    return recommendations;
  }

  /**
   * Abandon test session
   */
  static async abandonTestSession(sessionId: string, userId: string): Promise<boolean> {
    const result = await TestSession.updateOne(
      { _id: sessionId, userId, status: 'in-progress' },
      { 
        status: 'abandoned',
        completedAt: new Date()
      }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Get test statistics for a domain
   */
  static async getDomainTestStatistics(domain: Domain) {
    return await TestSession.aggregate([
      { $match: { domain, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          avgScore: { $avg: '$percentage' },
          avgTime: { $avg: '$totalTimeSpent' },
          highestScore: { $max: '$percentage' },
          lowestScore: { $min: '$percentage' }
        }
      }
    ]);
  }
}

export default TestService;
