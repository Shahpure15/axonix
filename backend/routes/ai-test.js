/**
 * AI Test Generation API Routes
 * Handles user requests for AI-generated tests and test submissions
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { AITestGenerationService, TEST_TYPES } = require('../services/AITestGenerationService');
const UserPerformanceAnalytics = require('../models/UserPerformanceAnalytics');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware to authenticate JWT token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
}

/**
 * @route   GET /api/ai-test/available-modes
 * @desc    Get available test modes for the learn page
 * @access  Private
 */
router.get('/available-modes', authenticateToken, async (req, res) => {
  try {
    const modes = [
      {
        id: TEST_TYPES.REVIEW,
        name: 'Review Test',
        description: 'Comprehensive review covering various topics',
        icon: '📚',
        difficulty: 'Mixed',
        estimatedTime: '15-20 minutes'
      },
      {
        id: TEST_TYPES.WEAK_AREAS,
        name: 'Weak Areas Practice',
        description: 'Focus on your identified weak areas',
        icon: '🎯',
        difficulty: 'Beginner-Intermediate',
        estimatedTime: '10-15 minutes'
      },
      {
        id: TEST_TYPES.PRACTICE,
        name: 'General Practice',
        description: 'Balanced practice across all topics',
        icon: '💪',
        difficulty: 'Mixed',
        estimatedTime: '12-18 minutes'
      },
      {
        id: TEST_TYPES.ADVANCEMENT,
        name: 'Advancement Test',
        description: 'Challenge yourself with advanced questions',
        icon: '🚀',
        difficulty: 'Intermediate-Advanced',
        estimatedTime: '15-25 minutes'
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        modes,
        totalModes: modes.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching test modes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test modes'
    });
  }
});

/**
 * @route   GET /api/ai-test/user-readiness/:domain
 * @desc    Check user's readiness for different test types in a domain
 * @access  Private
 */
router.get('/user-readiness/:domain', authenticateToken, async (req, res) => {
  try {
    const { domain } = req.params;
    const userId = req.user.userId;

    // Get user analytics
    const analytics = await UserPerformanceAnalytics.findOne({ userId });
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'No performance data found. Please complete a diagnostic test first.',
        recommendations: {
          action: 'Take diagnostic test',
          message: 'Complete a diagnostic test to unlock AI-powered learning modes'
        }
      });
    }

    // Find domain-specific performance
    const domainMetric = analytics.domainMetrics.find(m => m.domain === domain);
    
    if (!domainMetric) {
      return res.status(404).json({
        success: false,
        message: `No performance data found for ${domain}. Please complete a diagnostic test for this domain first.`
      });
    }

    // Calculate readiness for each test type
    const readiness = {
      [TEST_TYPES.REVIEW]: {
        ready: domainMetric.totalQuestionsAttempted >= 5,
        reason: domainMetric.totalQuestionsAttempted >= 5 ? 'Ready' : 'Need more practice questions',
        accuracy: domainMetric.overallAccuracy
      },
      [TEST_TYPES.WEAK_AREAS]: {
        ready: domainMetric.weaknessAreas && domainMetric.weaknessAreas.length > 0,
        reason: domainMetric.weaknessAreas && domainMetric.weaknessAreas.length > 0 
          ? `${domainMetric.weaknessAreas.length} weak areas identified` 
          : 'No specific weak areas identified yet',
        weakAreas: domainMetric.weaknessAreas?.slice(0, 3) || []
      },
      [TEST_TYPES.PRACTICE]: {
        ready: true,
        reason: 'Always available for practice',
        accuracy: domainMetric.overallAccuracy
      },
      [TEST_TYPES.ADVANCEMENT]: {
        ready: domainMetric.overallAccuracy >= 70,
        reason: domainMetric.overallAccuracy >= 70 
          ? 'Performance indicates readiness for advanced content' 
          : `Need 70%+ accuracy (current: ${Math.round(domainMetric.overallAccuracy)}%)`,
        accuracy: domainMetric.overallAccuracy
      }
    };

    res.status(200).json({
      success: true,
      data: {
        domain,
        overallAccuracy: Math.round(domainMetric.overallAccuracy),
        totalQuestions: domainMetric.totalQuestionsAttempted,
        readiness,
        recommendations: generateRecommendations(domainMetric)
      }
    });

  } catch (error) {
    console.error('❌ Error checking user readiness:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check user readiness'
    });
  }
});

/**
 * @route   POST /api/ai-test/generate
 * @desc    Generate AI-powered test based on user's selection
 * @access  Private
 */
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { domain, testType, questionCount = 10 } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!domain || !testType) {
      return res.status(400).json({
        success: false,
        message: 'Domain and test type are required'
      });
    }

    if (!Object.values(TEST_TYPES).includes(testType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test type'
      });
    }

    console.log(`🎯 Generating AI test for user ${userId}: ${testType} in ${domain}`);

    // Generate test using AI service
    const generatedTest = await AITestGenerationService.generateTestForUser(
      userId, 
      domain, 
      testType, 
      questionCount
    );

    res.status(200).json({
      success: true,
      message: 'AI test generated successfully',
      data: generatedTest
    });

  } catch (error) {
    console.error('❌ Error generating AI test:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate AI test',
      errorType: error.message.includes('No performance data') ? 'MISSING_ANALYTICS' : 'GENERATION_ERROR'
    });
  }
});

/**
 * @route   POST /api/ai-test/submit
 * @desc    Submit completed AI-generated test
 * @access  Private
 */
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { testId, answers, timeSpent } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!testId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Test ID and answers array are required'
      });
    }

    console.log(`📤 Submitting AI test ${testId} for user ${userId}`);

    // Submit test using AI service
    const results = await AITestGenerationService.submitAIGeneratedTest(testId, userId, answers);

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      data: results
    });

  } catch (error) {
    console.error('❌ Error submitting AI test:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit test'
    });
  }
});

/**
 * @route   GET /api/ai-test/history
 * @desc    Get user's AI test history
 * @access  Private
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { domain, limit = 10 } = req.query;

    const { AIGeneratedTest } = require('../services/AITestGenerationService');

    let query = { userId };
    if (domain) {
      query.domain = domain;
    }

    const tests = await AIGeneratedTest.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('domain testType status createdAt aiAnalysis.aiConfidence questions');

    const history = tests.map(test => ({
      testId: test._id,
      domain: test.domain,
      testType: test.testType,
      status: test.status,
      questionsCount: test.questions.length,
      aiConfidence: test.aiAnalysis.aiConfidence,
      createdAt: test.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        history,
        total: history.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching test history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test history'
    });
  }
});

/**
 * @route   GET /api/ai-test/analytics/:domain
 * @desc    Get detailed analytics for a domain
 * @access  Private
 */
router.get('/analytics/:domain', authenticateToken, async (req, res) => {
  try {
    const { domain } = req.params;
    const userId = req.user.userId;

    const analytics = await UserPerformanceAnalytics.findOne({ userId });
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'No analytics data found'
      });
    }

    const domainMetric = analytics.domainMetrics.find(m => m.domain === domain);
    
    if (!domainMetric) {
      return res.status(404).json({
        success: false,
        message: `No analytics found for domain: ${domain}`
      });
    }

    // Prepare detailed analytics
    const detailedAnalytics = {
      domain,
      overallPerformance: {
        accuracy: Math.round(domainMetric.overallAccuracy),
        totalQuestions: domainMetric.totalQuestionsAttempted,
        correctAnswers: domainMetric.totalCorrectAnswers
      },
      topicBreakdown: domainMetric.topicPerformance.map(topic => ({
        topic: topic.topicName,
        accuracy: Math.round(topic.accuracy),
        questionsAttempted: topic.questionsAttempted,
        averageTime: Math.round(topic.averageTimeSpent),
        lastAttempted: topic.lastAttempted
      })),
      weaknessAreas: domainMetric.weaknessAreas?.map(weakness => ({
        topic: weakness.topic,
        severity: weakness.weaknessLevel,
        recommendation: weakness.recommendedPractice
      })) || [],
      recentProgress: analytics.sessionHistory
        .filter(session => session.domain === domain)
        .slice(-5)
        .map(session => ({
          date: session.startTime,
          accuracy: session.accuracy,
          improvement: session.improvementFromLastSession
        }))
    };

    res.status(200).json({
      success: true,
      data: detailedAnalytics
    });

  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Helper function
function generateRecommendations(domainMetric) {
  const recommendations = [];
  
  if (domainMetric.overallAccuracy < 60) {
    recommendations.push({
      type: 'focus',
      message: 'Focus on weak areas practice to build fundamentals',
      action: 'weak-areas'
    });
  } else if (domainMetric.overallAccuracy >= 80) {
    recommendations.push({
      type: 'advance',
      message: 'Ready for advancement test - challenge yourself!',
      action: 'advancement'
    });
  } else {
    recommendations.push({
      type: 'practice',
      message: 'Continue with regular practice to improve consistency',
      action: 'practice'
    });
  }
  
  return recommendations;
}

module.exports = router;
