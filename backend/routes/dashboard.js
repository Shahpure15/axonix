/**
 * Dashboard Routes for SocraticWingman
 * Handles dashboard data including diagnostic test status
 */

const express = require('express');
const User = require('../models/User');
const TestSession = require('../models/TestSession');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/dashboard
 * Get comprehensive dashboard data for the authenticated user
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user with diagnostic test data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's preferred domains from onboarding
    const preferredDomains = user.onboardingData?.domains || [];
    
    if (preferredDomains.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          userProfile: {
            name: user.name,
            email: user.email,
            xp: user.xp,
            level: user.level,
            onboardingCompleted: user.onboardingCompleted
          },
          preferredDomains: [],
          diagnosticTests: [],
          message: 'Please complete onboarding to see diagnostic tests'
        }
      });
    }

    // Initialize diagnostic tests map if it doesn't exist
    if (!user.diagnosticTests) {
      user.diagnosticTests = new Map();
    }

    // Prepare diagnostic test data for each preferred domain
    const diagnosticTests = preferredDomains.map(domain => {
      const testData = user.diagnosticTests.get(domain) || {
        completed: false,
        attempts: 0,
        bestScore: 0,
        lastAttemptDate: null,
        testSessionIds: []
      };

      return {
        domain,
        domainDisplayName: domain.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        completed: testData.completed,
        attempts: testData.attempts,
        bestScore: testData.bestScore,
        lastAttemptDate: testData.lastAttemptDate,
        canAttempt: true, // Users can always attempt diagnostic tests
        status: testData.completed ? 'completed' : 'not-started',
        recommendation: testData.completed ? 
          'Great! Continue with your learning path' : 
          'Take this diagnostic test to personalize your learning journey'
      };
    });

    // Get recent test sessions for additional insights
    const recentSessions = await TestSession.find({ 
      userId,
      testType: 'diagnostic'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('domain score percentage status createdAt');

    res.status(200).json({
      success: true,
      data: {
        userProfile: {
          name: user.name,
          email: user.email,
          xp: user.xp,
          level: user.level,
          onboardingCompleted: user.onboardingCompleted,
          experienceLevel: user.onboardingData?.experience_level
        },
        preferredDomains,
        diagnosticTests,
        recentTestSessions: recentSessions,
        stats: {
          totalDomains: preferredDomains.length,
          completedTests: diagnosticTests.filter(test => test.completed).length,
          totalAttempts: diagnosticTests.reduce((sum, test) => sum + test.attempts, 0),
          averageScore: diagnosticTests.length > 0 ? 
            diagnosticTests.reduce((sum, test) => sum + test.bestScore, 0) / diagnosticTests.length : 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/dashboard/diagnostic-test/start
 * Start a new diagnostic test for a specific domain
 */
router.post('/diagnostic-test/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: 'Domain is required'
      });
    }

    // Validate domain
    const validDomains = [
      'machine-learning', 'data-science', 'web-development',
      'mobile-development', 'devops', 'cybersecurity',
      'blockchain', 'game-development', 'ui-ux-design', 'cloud-computing'
    ];

    if (!validDomains.includes(domain)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid domain specified'
      });
    }

    // Get user to check if domain is in their preferences
    const user = await User.findById(userId);
    const preferredDomains = user.onboardingData?.domains || [];
    
    if (!preferredDomains.includes(domain)) {
      return res.status(400).json({
        success: false,
        message: 'This domain is not in your learning preferences'
      });
    }

    // Create a new test session (we'll implement the TestService later)
    const testSession = new TestSession({
      userId,
      testType: 'diagnostic',
      domain,
      questions: [], // Will be populated with questions
      totalQuestions: 0,
      score: 0,
      correctAnswers: 0,
      percentage: 0,
      status: 'in-progress',
      startedAt: new Date(),
      totalTimeSpent: 0
    });

    await testSession.save();

    // Update user's diagnostic test tracking
    if (!user.diagnosticTests) {
      user.diagnosticTests = new Map();
    }

    const currentTestData = user.diagnosticTests.get(domain) || {
      completed: false,
      attempts: 0,
      bestScore: 0,
      lastAttemptDate: null,
      testSessionIds: []
    };

    currentTestData.attempts += 1;
    currentTestData.lastAttemptDate = new Date();
    currentTestData.testSessionIds.push(testSession._id);

    user.diagnosticTests.set(domain, currentTestData);
    await user.save();

    res.status(201).json({
      success: true,
      data: {
        sessionId: testSession._id,
        domain,
        message: 'Diagnostic test session created successfully',
        attempts: currentTestData.attempts
      }
    });

  } catch (error) {
    console.error('❌ Start diagnostic test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start diagnostic test',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/dashboard/diagnostic-test/complete
 * Complete a diagnostic test and update user progress
 */
router.post('/diagnostic-test/complete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId, score, percentage, totalTimeSpent } = req.body;

    if (!sessionId || score === undefined || percentage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Session ID, score, and percentage are required'
      });
    }

    // Find and update the test session
    const testSession = await TestSession.findOne({ 
      _id: sessionId, 
      userId,
      status: 'in-progress'
    });

    if (!testSession) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found or already completed'
      });
    }

    // Update test session
    testSession.score = score;
    testSession.percentage = percentage;
    testSession.totalTimeSpent = totalTimeSpent || 0;
    testSession.status = 'completed';
    testSession.completedAt = new Date();
    await testSession.save();

    // Update user's diagnostic test data
    const user = await User.findById(userId);
    if (!user.diagnosticTests) {
      user.diagnosticTests = new Map();
    }

    const domain = testSession.domain;
    const currentTestData = user.diagnosticTests.get(domain) || {
      completed: false,
      attempts: 0,
      bestScore: 0,
      lastAttemptDate: null,
      testSessionIds: []
    };

    currentTestData.completed = true;
    currentTestData.bestScore = Math.max(currentTestData.bestScore, percentage);
    currentTestData.lastAttemptDate = new Date();

    user.diagnosticTests.set(domain, currentTestData);
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        sessionId,
        domain,
        score,
        percentage,
        isNewBestScore: percentage > (currentTestData.bestScore || 0),
        totalAttempts: currentTestData.attempts,
        message: 'Diagnostic test completed successfully!'
      }
    });

  } catch (error) {
    console.error('❌ Complete diagnostic test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete diagnostic test',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
