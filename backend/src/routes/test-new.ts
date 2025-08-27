/**
 * Test Routes (TypeScript)
 * API endpoints for test creation, execution, and result management
 */

import express, { Response } from 'express';
import TestService, { ITestAnswer } from '../services/TestService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { isValidDomain, getDomainFromString } from '../models/DomainQuestions';

const router = express.Router();

/**
 * POST /api/test/create
 * Create a new test session
 */
router.post('/create', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain, testType = 'diagnostic', questionCount = 10 } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    if (!isValidDomain(domain)) {
      return res.status(400).json({ error: 'Invalid domain specified' });
    }

    if (!['diagnostic', 'module-quiz', 'practice', 'final-assessment'].includes(testType)) {
      return res.status(400).json({ 
        error: 'Invalid test type. Must be one of: diagnostic, module-quiz, practice, final-assessment' 
      });
    }

    const testSession = await TestService.createTestSession(
      userId,
      domain,
      testType,
      questionCount
    );

    res.status(201).json({
      success: true,
      data: testSession
    });

  } catch (error: any) {
    console.error('Error creating test session:', error);
    res.status(500).json({ 
      error: 'Failed to create test session',
      details: error.message 
    });
  }
});

/**
 * POST /api/test/submit
 * Submit test answers and get results
 */
router.post('/submit', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId, answers, totalTimeSpent } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    if (typeof totalTimeSpent !== 'number') {
      return res.status(400).json({ error: 'Total time spent is required' });
    }

    // Validate answer format
    for (const answer of answers) {
      if (!answer.questionId || answer.answer === undefined) {
        return res.status(400).json({ 
          error: 'Each answer must have questionId and answer fields' 
        });
      }
    }

    const result = await TestService.submitTestAnswers(
      sessionId,
      userId,
      answers as ITestAnswer[],
      totalTimeSpent
    );

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Error submitting test answers:', error);
    res.status(500).json({ 
      error: 'Failed to submit test answers',
      details: error.message 
    });
  }
});

/**
 * GET /api/test/session/:sessionId
 * Get test session details
 */
router.get('/session/:sessionId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const testSession = await TestService.getTestSession(sessionId, userId);

    if (!testSession) {
      return res.status(404).json({ error: 'Test session not found' });
    }

    res.status(200).json({
      success: true,
      data: testSession
    });

  } catch (error: any) {
    console.error('Error getting test session:', error);
    res.status(500).json({ 
      error: 'Failed to get test session',
      details: error.message 
    });
  }
});

/**
 * GET /api/test/history
 * Get user's test history
 */
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { testType, domain, limit = '20' } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const limitNum = parseInt(limit as string, 10);
    if (isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
      return res.status(400).json({ error: 'Limit must be a number between 1 and 100' });
    }

    if (domain && !isValidDomain(domain as string)) {
      return res.status(400).json({ error: 'Invalid domain specified' });
    }

    const history = await TestService.getUserTestHistory(
      userId,
      testType as string,
      domain as string,
      limitNum
    );

    res.status(200).json({
      success: true,
      data: history
    });

  } catch (error: any) {
    console.error('Error getting test history:', error);
    res.status(500).json({ 
      error: 'Failed to get test history',
      details: error.message 
    });
  }
});

/**
 * GET /api/test/analytics
 * Get user's performance analytics
 */
router.get('/analytics', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { domain } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (domain && !isValidDomain(domain as string)) {
      return res.status(400).json({ error: 'Invalid domain specified' });
    }

    // For now, return basic analytics until we implement the getUserResponsePatterns method
    const history = await TestService.getUserTestHistory(userId, undefined, domain as string, 50);
    
    const analytics = {
      totalTests: history.length,
      averageScore: history.length > 0 ? 
        history.reduce((sum, test) => sum + test.percentage, 0) / history.length : 0,
      completedTests: history.filter(test => test.status === 'completed').length,
      domains: [...new Set(history.map(test => test.domain))],
      recentPerformance: history.slice(0, 10).map(test => ({
        domain: test.domain,
        percentage: test.percentage,
        date: test.completedAt
      }))
    };

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error: any) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({ 
      error: 'Failed to get user analytics',
      details: error.message 
    });
  }
});

/**
 * PUT /api/test/abandon/:sessionId
 * Abandon a test session
 */
router.put('/abandon/:sessionId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const success = await TestService.abandonTestSession(sessionId, userId);

    if (!success) {
      return res.status(404).json({ error: 'Test session not found or already completed' });
    }

    res.status(200).json({
      success: true,
      message: 'Test session abandoned successfully'
    });

  } catch (error: any) {
    console.error('Error abandoning test session:', error);
    res.status(500).json({ 
      error: 'Failed to abandon test session',
      details: error.message 
    });
  }
});

/**
 * GET /api/test/domain-stats/:domain
 * Get test statistics for a specific domain
 */
router.get('/domain-stats/:domain', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain } = req.params;

    if (!isValidDomain(domain)) {
      return res.status(400).json({ error: 'Invalid domain specified' });
    }

    const validDomain = getDomainFromString(domain);
    const stats = await TestService.getDomainTestStatistics(validDomain);

    res.status(200).json({
      success: true,
      data: stats.length > 0 ? stats[0] : {
        totalTests: 0,
        avgScore: 0,
        avgTime: 0,
        highestScore: 0,
        lowestScore: 0
      }
    });

  } catch (error: any) {
    console.error('Error getting domain statistics:', error);
    res.status(500).json({ 
      error: 'Failed to get domain statistics',
      details: error.message 
    });
  }
});

/**
 * GET /api/test/domains
 * Get list of available test domains
 */
router.get('/domains', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const domains = [
      'machine-learning',
      'data-science', 
      'web-development',
      'mobile-development',
      'cloud-computing',
      'cybersecurity',
      'artificial-intelligence',
      'blockchain',
      'devops',
      'ui-ux-design'
    ];

    res.status(200).json({
      success: true,
      data: domains
    });

  } catch (error: any) {
    console.error('Error getting domains:', error);
    res.status(500).json({ 
      error: 'Failed to get domains',
      details: error.message 
    });
  }
});

export default router;
