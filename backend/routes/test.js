/**
 * Test Routes for SocraticWingman
 * Handles diagnostic tests, quizzes, and assessments using domain-specific collections
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { 
  getDiagnosticQuestions, 
  getQuestionsByDomain, 
  getQuestionsByDifficulty,
  getAvailableDomains 
} = require('../models/DomainQuestions');
const TestSession = require('../models/TestSession');
const LearningProgress = require('../models/LearningProgress');
const User = require('../models/User');

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
 * @route   GET /api/test/domains
 * @desc    Get all available domains for testing
 * @access  Private
 */
router.get('/domains', authenticateToken, async (req, res) => {
  try {
    const domains = getAvailableDomains();
    
    res.status(200).json({
      success: true,
      data: {
        domains,
        count: domains.length
      }
    });
  } catch (error) {
    console.error('❌ Get domains error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available domains'
    });
  }
});

/**
 * @route   GET /api/test/diagnostic/:domain
 * @desc    Get diagnostic test questions for a domain
 * @access  Private
 */
router.get('/diagnostic/:domain', authenticateToken, async (req, res) => {
  try {
    const { domain } = req.params;
    const { limit = 10 } = req.query;

    // Validate domain
    if (!getAvailableDomains().includes(domain)) {
      return res.status(400).json({
        success: false,
        message: `Invalid domain: ${domain}. Available domains: ${getAvailableDomains().join(', ')}`
      });
    }

    // Get diagnostic questions using domain-specific collection
    const questions = await getDiagnosticQuestions(domain, parseInt(limit));

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions found for domain: ${domain}`
      });
    }

    // Remove correct answers from options for security
    const sanitizedQuestions = questions.map(q => ({
      ...q,
      options: q.options ? q.options.map(opt => ({ text: opt.text })) : []
    }));

    res.status(200).json({
      success: true,
      data: {
        domain,
        difficulty,
        questions: sanitizedQuestions,
        totalQuestions: sanitizedQuestions.length
      }
    });

  } catch (error) {
    console.error('❌ Get diagnostic test error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/test/start
 * @desc    Start a new test session
 * @access  Private
 */
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { testType, domain, questionIds } = req.body;
    const userId = req.user.userId;

    if (!testType || !domain || !questionIds || !Array.isArray(questionIds)) {
      return res.status(400).json({
        success: false,
        message: 'Test type, domain, and question IDs are required'
      });
    }

    // Create new test session
    const testSession = new TestSession({
      userId,
      testType,
      domain,
      questions: questionIds.map(qId => ({ questionId: qId })),
      totalQuestions: questionIds.length,
      status: 'in-progress'
    });

    await testSession.save();

    res.status(201).json({
      success: true,
      data: {
        sessionId: testSession._id,
        testType,
        domain,
        totalQuestions: questionIds.length,
        startedAt: testSession.startedAt
      }
    });

  } catch (error) {
    console.error('❌ Start test error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/test/submit
 * @desc    Submit test answers and get results
 * @access  Private
 */
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { sessionId, answers } = req.body;
    const userId = req.user.userId;

    if (!sessionId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and answers are required'
      });
    }

    // Get test session
    const testSession = await TestSession.findOne({
      _id: sessionId,
      userId: userId
    }).populate('questions.questionId');

    if (!testSession) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found'
      });
    }

    if (testSession.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Test already completed'
      });
    }

    // Grade the test
    let correctAnswers = 0;
    let totalScore = 0;

    testSession.questions.forEach((q, index) => {
      const userAnswer = answers[index];
      const question = q.questionId;
      
      if (question && userAnswer !== undefined) {
        let isCorrect = false;
        
        if (question.questionType === 'multiple-choice') {
          const correctOption = question.options.find(opt => opt.isCorrect);
          isCorrect = correctOption && correctOption.text === userAnswer;
        } else if (question.questionType === 'true-false') {
          isCorrect = question.correctAnswer === userAnswer;
        }
        
        if (isCorrect) {
          correctAnswers++;
          totalScore += question.points || 1;
        }
        
        q.userAnswer = userAnswer;
        q.isCorrect = isCorrect;
        q.points = isCorrect ? (question.points || 1) : 0;
      }
    });

    // Update test session
    testSession.correctAnswers = correctAnswers;
    testSession.score = totalScore;
    testSession.status = 'completed';
    testSession.completedAt = new Date();
    
    await testSession.save();

    // Update learning progress if it's a diagnostic test
    if (testSession.testType === 'diagnostic') {
      await updateDiagnosticProgress(userId, testSession.domain, testSession.percentage);
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: testSession._id,
        score: totalScore,
        correctAnswers,
        totalQuestions: testSession.totalQuestions,
        percentage: testSession.percentage,
        feedback: generateFeedback(testSession.percentage),
        recommendations: generateRecommendations(testSession.domain, testSession.percentage)
      }
    });

  } catch (error) {
    console.error('❌ Submit test error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/test/history
 * @desc    Get user's test history
 * @access  Private
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { testType, domain } = req.query;

    const query = { userId };
    if (testType) query.testType = testType;
    if (domain) query.domain = domain;

    const testHistory = await TestSession.find(query)
      .select('testType domain score percentage status createdAt completedAt')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: testHistory
    });

  } catch (error) {
    console.error('❌ Get test history error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to update diagnostic progress
async function updateDiagnosticProgress(userId, domain, percentage) {
  try {
    let progress = await LearningProgress.findOne({ userId });
    
    if (!progress) {
      progress = new LearningProgress({ userId, domains: [] });
    }

    const domainIndex = progress.domains.findIndex(d => d.domainName === domain);
    
    if (domainIndex >= 0) {
      progress.domains[domainIndex].diagnosticCompleted = true;
      progress.domains[domainIndex].diagnosticScore = percentage;
    } else {
      progress.domains.push({
        domainName: domain,
        level: percentage >= 80 ? 'advanced' : percentage >= 60 ? 'intermediate' : 'beginner',
        diagnosticCompleted: true,
        diagnosticScore: percentage,
        modules: []
      });
    }

    await progress.save();
  } catch (error) {
    console.error('Error updating diagnostic progress:', error);
  }
}

// Helper function to generate feedback
function generateFeedback(percentage) {
  if (percentage >= 80) {
    return "Excellent! You have a strong understanding of this domain.";
  } else if (percentage >= 60) {
    return "Good job! You have a solid foundation with room for improvement.";
  } else if (percentage >= 40) {
    return "Not bad! Focus on strengthening your fundamentals.";
  } else {
    return "Keep learning! Start with the basics and build your way up.";
  }
}

// Helper function to generate recommendations
function generateRecommendations(domain, percentage) {
  const level = percentage >= 80 ? 'advanced' : percentage >= 60 ? 'intermediate' : 'beginner';
  
  return [{
    domain,
    level,
    modules: [`${domain}-${level}-module-1`, `${domain}-${level}-module-2`]
  }];
}

module.exports = router;
