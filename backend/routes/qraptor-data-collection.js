/**
 * Data Collection Routes for Qraptor Agent
 * These endpoints provide additional context data that the agent can fetch
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const LearningProgress = require('../models/LearningProgress');
const TestSession = require('../models/TestSession');
const UserPerformanceAnalytics = require('../models/UserPerformanceAnalytics');

const router = express.Router();

/**
 * @route   GET /api/qraptor/data/user-profile/:userId
 * @desc    Get comprehensive user profile data for agent
 * @access  Qraptor Agent (with API key)
 */
router.get('/user-profile/:userId', validateQraptorAgent, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user basic info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get learning progress
    const learningProgress = await LearningProgress.findOne({ userId });
    
    // Get performance analytics
    const performanceAnalytics = await UserPerformanceAnalytics.findOne({ userId });

    const userProfile = {
      // Basic User Info
      userId: user._id,
      level: user.level || 1,
      xp: user.xp || 0,
      registrationDate: user.createdAt,
      
      // Learning Preferences
      onboardingData: user.onboardingData || {},
      preferredDomains: user.onboardingData?.domains || [],
      experienceLevel: user.onboardingData?.experience_level || 'beginner',
      studyTimePreference: user.onboardingData?.preferred_study_time || 'mixed',
      timezone: user.onboardingData?.timezone || 'UTC',
      
      // Overall Progress
      overallProgress: learningProgress?.overallProgress || 0,
      totalXP: learningProgress?.overallXP || 0,
      completedDomains: learningProgress?.domains?.filter(d => d.completionPercentage >= 100).length || 0,
      
      // Learning Patterns
      learningStreak: calculateLearningStreak(user),
      averageSessionTime: calculateAverageSessionTime(userId),
      preferredDifficulty: determinePreferredDifficulty(performanceAnalytics),
      learningVelocity: calculateLearningVelocity(learningProgress)
    };

    res.status(200).json({
      success: true,
      data: userProfile,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching user profile for agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/qraptor/data/learning-history/:userId
 * @desc    Get detailed learning history for personalization
 * @access  Qraptor Agent (with API key)
 */
router.get('/learning-history/:userId', validateQraptorAgent, async (req, res) => {
  try {
    const { userId } = req.params;
    const { domain, limit = 50 } = req.query;

    // Get test sessions
    const query = { userId };
    if (domain) query.domain = domain;

    const testSessions = await TestSession.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('questions.questionId');

    // Get performance analytics
    const performanceAnalytics = await UserPerformanceAnalytics.findOne({ userId });

    const learningHistory = {
      // Recent Test Performance
      recentSessions: testSessions.map(session => ({
        sessionId: session._id,
        testType: session.testType,
        domain: session.domain,
        score: session.score,
        percentage: session.percentage,
        timeSpent: session.totalTimeSpent,
        questionsCount: session.totalQuestions,
        completedAt: session.completedAt,
        status: session.status
      })),

      // Performance Trends
      performanceTrends: calculatePerformanceTrends(testSessions),
      
      // Domain-wise Performance
      domainPerformance: performanceAnalytics?.domainMetrics || [],
      
      // Learning Patterns
      strongAreas: identifyStrongAreas(performanceAnalytics),
      weakAreas: identifyWeakAreas(performanceAnalytics),
      improvementAreas: identifyImprovementAreas(testSessions),
      
      // Time-based Analytics
      peakPerformanceTime: calculatePeakPerformanceTime(testSessions),
      consistencyScore: calculateConsistencyScore(testSessions)
    };

    res.status(200).json({
      success: true,
      data: learningHistory,
      sessionsAnalyzed: testSessions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching learning history for agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning history',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/qraptor/data/module-context/:moduleId
 * @desc    Get detailed module and curriculum context
 * @access  Qraptor Agent (with API key)
 */
router.get('/module-context/:moduleId', validateQraptorAgent, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { subModuleId } = req.query;

    // Extract domain and module info
    const domain = moduleId.split('_')[0];
    const moduleSequence = moduleId.split('_').slice(1);

    const moduleContext = {
      // Module Identity
      moduleId,
      subModuleId,
      domain,
      moduleSequence,
      
      // Curriculum Context
      prerequisites: getModulePrerequisites(moduleId),
      nextModules: getNextModules(moduleId),
      relatedConcepts: getRelatedConcepts(domain, moduleSequence),
      
      // Difficulty Progression
      currentDifficulty: determineDifficulty(moduleId),
      difficultyProgression: getDifficultyProgression(domain),
      
      // Learning Objectives
      learningObjectives: getLearningObjectives(moduleId, subModuleId),
      keyMilestones: getKeyMilestones(moduleId),
      
      // Content Structure
      topicsHierarchy: getTopicsHierarchy(domain, moduleId),
      practiceAreas: getPracticeAreas(moduleId),
      assessmentCriteria: getAssessmentCriteria(moduleId)
    };

    res.status(200).json({
      success: true,
      data: moduleContext,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching module context for agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch module context',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/qraptor/data/performance-analytics/:userId/:moduleId
 * @desc    Get detailed performance analytics for specific module
 * @access  Qraptor Agent (with API key)
 */
router.get('/performance-analytics/:userId/:moduleId', validateQraptorAgent, async (req, res) => {
  try {
    const { userId, moduleId } = req.params;
    
    const domain = moduleId.split('_')[0];
    
    // Get performance analytics
    const performanceAnalytics = await UserPerformanceAnalytics.findOne({ userId });
    
    if (!performanceAnalytics) {
      return res.status(404).json({
        success: false,
        message: 'No performance analytics found for user'
      });
    }

    // Get domain-specific metrics
    const domainMetric = performanceAnalytics.domainMetrics.find(m => m.domain === domain);
    
    // Get module-specific test sessions
    const moduleSessions = await TestSession.find({
      userId,
      domain,
      status: 'completed'
    }).sort({ createdAt: -1 });

    const analytics = {
      // Overall Performance
      overallAccuracy: domainMetric?.overallAccuracy || 0,
      totalQuestions: domainMetric?.totalQuestionsAttempted || 0,
      averageScore: calculateAverageScore(moduleSessions),
      
      // Detailed Metrics
      topicPerformance: domainMetric?.topicPerformance || [],
      difficultyBreakdown: domainMetric?.difficultyBreakdown || {},
      
      // Learning Insights
      strengths: domainMetric?.strongTopics || [],
      weaknesses: domainMetric?.weaknessAreas || [],
      improvementRate: calculateImprovementRate(moduleSessions),
      
      // Time Analytics
      averageTimePerQuestion: calculateAverageTimePerQuestion(moduleSessions),
      timeEfficiency: calculateTimeEfficiency(moduleSessions),
      
      // Answer Patterns
      commonMistakes: identifyCommonMistakes(performanceAnalytics, domain),
      confidencePatterns: analyzeConfidencePatterns(performanceAnalytics, domain),
      
      // Recommendations
      focusAreas: generateFocusAreas(domainMetric),
      nextSteps: generateNextSteps(domainMetric, moduleSessions)
    };

    res.status(200).json({
      success: true,
      data: analytics,
      sessionsAnalyzed: moduleSessions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching performance analytics for agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance analytics',
      error: error.message
    });
  }
});

/**
 * Middleware to validate Qraptor agent access
 */
function validateQraptorAgent(req, res, next) {
  const apiKey = req.headers['x-qraptor-agent-key'];
  const expectedKey = process.env.QRAPTOR_AGENT_API_KEY;
  
  if (!apiKey || !expectedKey || apiKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or missing Qraptor agent API key'
    });
  }
  
  next();
}

// Helper functions for data analysis
function calculateLearningStreak(user) {
  // Calculate consecutive days of learning activity
  return user.learningStreak || 0;
}

function calculateAverageSessionTime(userId) {
  // Calculate average session duration
  return 25; // Placeholder - implement actual calculation
}

function determinePreferredDifficulty(analytics) {
  if (!analytics) return 'intermediate';
  
  // Analyze performance across difficulties to determine preference
  const difficulties = analytics.domainMetrics || [];
  // Implement logic to determine preferred difficulty
  return 'intermediate';
}

function calculateLearningVelocity(progress) {
  if (!progress) return 'average';
  
  // Calculate how quickly user progresses through material
  return progress.learningVelocity || 'average';
}

function calculatePerformanceTrends(sessions) {
  if (sessions.length < 2) return { trend: 'insufficient_data' };
  
  const recentScores = sessions.slice(0, 10).map(s => s.percentage || 0);
  const earlierScores = sessions.slice(-10).map(s => s.percentage || 0);
  
  const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const earlierAvg = earlierScores.reduce((a, b) => a + b, 0) / earlierScores.length;
  
  return {
    trend: recentAvg > earlierAvg ? 'improving' : recentAvg < earlierAvg ? 'declining' : 'stable',
    recentAverage: recentAvg,
    previousAverage: earlierAvg,
    improvement: recentAvg - earlierAvg
  };
}

function identifyStrongAreas(analytics) {
  if (!analytics || !analytics.domainMetrics) return [];
  
  return analytics.domainMetrics
    .filter(domain => domain.overallAccuracy >= 80)
    .map(domain => domain.domain);
}

function identifyWeakAreas(analytics) {
  if (!analytics || !analytics.domainMetrics) return [];
  
  return analytics.domainMetrics
    .filter(domain => domain.overallAccuracy < 60)
    .map(domain => domain.domain);
}

function identifyImprovementAreas(sessions) {
  // Analyze recent sessions to identify areas showing improvement
  return ['problem_solving', 'time_management']; // Placeholder
}

function calculatePeakPerformanceTime(sessions) {
  // Analyze when user performs best
  return 'morning'; // Placeholder
}

function calculateConsistencyScore(sessions) {
  if (sessions.length < 3) return 0;
  
  const scores = sessions.map(s => s.percentage || 0);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  
  // Return consistency score (lower variance = higher consistency)
  return Math.max(0, 100 - Math.sqrt(variance));
}

// Module context helper functions
function getModulePrerequisites(moduleId) {
  // Return prerequisite modules
  return []; // Implement based on curriculum structure
}

function getNextModules(moduleId) {
  // Return next modules in learning path
  return []; // Implement based on curriculum structure
}

function getRelatedConcepts(domain, moduleSequence) {
  // Return related concepts for the module
  return []; // Implement based on domain knowledge
}

function determineDifficulty(moduleId) {
  // Determine module difficulty based on ID
  if (moduleId.includes('basic') || moduleId.includes('intro')) return 'beginner';
  if (moduleId.includes('advanced') || moduleId.includes('expert')) return 'advanced';
  return 'intermediate';
}

function getDifficultyProgression(domain) {
  // Return difficulty progression for domain
  return ['beginner', 'intermediate', 'advanced'];
}

function getLearningObjectives(moduleId, subModuleId) {
  // Return learning objectives for module/submodule
  return [`Master ${subModuleId} concepts`, `Apply ${subModuleId} in practice`];
}

function getKeyMilestones(moduleId) {
  // Return key milestones for module
  return [];
}

function getTopicsHierarchy(domain, moduleId) {
  // Return hierarchical structure of topics
  return {};
}

function getPracticeAreas(moduleId) {
  // Return practice areas for module
  return [];
}

function getAssessmentCriteria(moduleId) {
  // Return assessment criteria
  return {};
}

// Performance analytics helper functions
function calculateAverageScore(sessions) {
  if (!sessions.length) return 0;
  return sessions.reduce((sum, session) => sum + (session.percentage || 0), 0) / sessions.length;
}

function calculateImprovementRate(sessions) {
  if (sessions.length < 2) return 0;
  
  const recent = sessions.slice(0, 5);
  const earlier = sessions.slice(-5);
  
  const recentAvg = calculateAverageScore(recent);
  const earlierAvg = calculateAverageScore(earlier);
  
  return recentAvg - earlierAvg;
}

function calculateAverageTimePerQuestion(sessions) {
  if (!sessions.length) return 0;
  
  const totalTime = sessions.reduce((sum, session) => sum + (session.totalTimeSpent || 0), 0);
  const totalQuestions = sessions.reduce((sum, session) => sum + (session.totalQuestions || 0), 0);
  
  return totalQuestions > 0 ? totalTime / totalQuestions : 0;
}

function calculateTimeEfficiency(sessions) {
  // Calculate time efficiency score
  return 75; // Placeholder
}

function identifyCommonMistakes(analytics, domain) {
  // Identify common mistake patterns
  return [];
}

function analyzeConfidencePatterns(analytics, domain) {
  // Analyze confidence patterns
  return {};
}

function generateFocusAreas(domainMetric) {
  if (!domainMetric) return [];
  
  return domainMetric.weaknessAreas?.map(area => area.topicName) || [];
}

function generateNextSteps(domainMetric, sessions) {
  // Generate recommended next steps
  return ['Continue practicing weak areas', 'Advance to next difficulty level'];
}

module.exports = router;
