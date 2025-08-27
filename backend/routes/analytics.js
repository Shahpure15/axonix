/**
 * Analytics Routes for SocraticWingman
 * Handles user response analysis and learning insights using domain-specific collections
 */

const express = require('express');
const router = express.Router();
const TestSession = require('../models/TestSession');
const { getQuestionsByDomain, getAvailableDomains } = require('../models/DomainQuestions');
const { authenticateToken } = require('../middleware/auth');

// Get user's response patterns and learning insights
router.get('/response-patterns', authenticateToken, async (req, res) => {
  try {
    const { domain } = req.query;
    const userId = req.user._id;

    const patterns = await TestSession.getUserResponsePatterns(userId, domain);
    
    res.json({
      success: true,
      data: patterns
    });
  } catch (error) {
    console.error('Error fetching response patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch response patterns'
    });
  }
});

// Get personalized learning recommendations based on response history
router.get('/learning-recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get response patterns
    const patterns = await TestSession.getUserResponsePatterns(userId);
    
    // Identify weak areas (success rate < 70%)
    const weakAreas = patterns.filter(p => p.successRate < 0.7);
    
    // Get questions for weak areas
    const recommendations = [];
    
    for (const area of weakAreas) {
      try {
        const practiceQuestions = await getQuestionsByDomain(area.domain, {
          difficulty: area.difficulty,
          isActive: true
        });
        
        recommendations.push({
          domain: area.domain,
          difficulty: area.difficulty,
          successRate: area.successRate,
          recommendedAction: area.successRate < 0.5 ? 'Review fundamentals' : 'Practice more',
          practiceQuestions: practiceQuestions.slice(0, 5).map(q => q._id),
          estimatedStudyTime: Math.ceil((1 - area.successRate) * 60) // minutes
        });
      } catch (error) {
        console.warn(`Failed to get questions for domain ${area.domain}:`, error.message);
        // Add recommendation without specific questions
        recommendations.push({
          domain: area.domain,
          difficulty: area.difficulty,
          successRate: area.successRate,
          recommendedAction: area.successRate < 0.5 ? 'Review fundamentals' : 'Practice more',
          practiceQuestions: [],
          estimatedStudyTime: Math.ceil((1 - area.successRate) * 60) // minutes
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        weakAreas: recommendations,
        overallProgress: patterns.reduce((acc, p) => acc + p.successRate, 0) / patterns.length || 0
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations'
    });
  }
});

// Get detailed performance insights for a specific test session
router.get('/performance-insights/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;
    
    const session = await TestSession.findOne({
      _id: sessionId,
      userId
    }).populate('questions.questionId');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found'
      });
    }
    
    const insights = session.getPerformanceInsights();
    const incorrectAnswers = session.getIncorrectAnswers();
    
    res.json({
      success: true,
      data: {
        sessionSummary: {
          score: session.percentage,
          totalQuestions: session.totalQuestions,
          correctAnswers: session.correctAnswers,
          totalTime: session.totalTimeSpent
        },
        timeInsights: insights,
        incorrectAnswers: incorrectAnswers.map(qa => ({
          questionId: qa.questionId,
          userAnswer: qa.userAnswer,
          timeSpent: qa.timeSpent,
          confidenceLevel: qa.confidenceLevel,
          flaggedForReview: qa.flaggedForReview
        })),
        recommendations: {
          focusAreas: incorrectAnswers.map(qa => qa.questionId),
          nextSteps: session.recommendations
        }
      }
    });
  } catch (error) {
    console.error('Error fetching performance insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance insights'
    });
  }
});

// Get questions user consistently struggles with across all tests
router.get('/struggle-areas', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const struggleData = await TestSession.aggregate([
      { $match: { userId } },
      { $unwind: '$questions' },
      { $match: { 'questions.isCorrect': false } },
      {
        $lookup: {
          from: 'questions',
          localField: 'questions.questionId',
          foreignField: '_id',
          as: 'questionData'
        }
      },
      { $unwind: '$questionData' },
      { $unwind: '$questionData.tags' },
      {
        $group: {
          _id: '$questionData.tags',
          missedCount: { $sum: 1 },
          avgTimeSpent: { $avg: '$questions.timeSpent' },
          domains: { $addToSet: '$domain' }
        }
      },
      { $sort: { missedCount: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      data: struggleData
    });
  } catch (error) {
    console.error('Error fetching struggle areas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch struggle areas'
    });
  }
});

module.exports = router;
