/**
 * Learning Progress Routes for SocraticWingman
 * Handles user learning progress and roadmap data
 */

const express = require('express');
const jwt = require('jsonwebtoken');
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
 * @route   GET /api/progress
 * @desc    Get user's learning progress
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    let progress = await LearningProgress.findOne({ userId });
    
    if (!progress) {
      // Create initial progress if doesn't exist
      progress = new LearningProgress({ 
        userId, 
        domains: [],
        overallXP: 0,
        currentLevel: 1,
        streak: {
          currentStreak: 0,
          longestStreak: 0
        }
      });
      await progress.save();
    }

    res.status(200).json({
      success: true,
      data: progress
    });

  } catch (error) {
    console.error('❌ Get learning progress error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/progress/initialize
 * @desc    Initialize learning progress from onboarding data
 * @access  Private
 */
router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { domains, experienceLevel } = req.body;

    if (!domains || !Array.isArray(domains)) {
      return res.status(400).json({
        success: false,
        message: 'Domains array is required'
      });
    }

    let progress = await LearningProgress.findOne({ userId });
    
    if (!progress) {
      progress = new LearningProgress({ userId, domains: [] });
    }

    // Initialize domains from onboarding
    const initializedDomains = domains.map(domainName => ({
      domainName,
      level: experienceLevel || 'beginner',
      diagnosticCompleted: false,
      diagnosticScore: 0,
      modules: [],
      overallProgress: 0,
      completedModules: 0,
      totalModules: 0
    }));

    progress.domains = initializedDomains;
    await progress.save();

    res.status(200).json({
      success: true,
      data: progress,
      message: 'Learning progress initialized successfully'
    });

  } catch (error) {
    console.error('❌ Initialize progress error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/progress/domains
 * @desc    Add or remove learning domains
 * @access  Private
 */
router.put('/domains', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { action, domainName, experienceLevel = 'beginner' } = req.body;

    if (!action || !domainName) {
      return res.status(400).json({
        success: false,
        message: 'Action and domain name are required'
      });
    }

    let progress = await LearningProgress.findOne({ userId });
    
    if (!progress) {
      progress = new LearningProgress({ userId, domains: [] });
    }

    if (action === 'add') {
      // Check if domain already exists
      const existingDomain = progress.domains.find(d => d.domainName === domainName);
      
      if (existingDomain) {
        return res.status(400).json({
          success: false,
          message: 'Domain already exists in learning path'
        });
      }

      // Add new domain
      progress.domains.push({
        domainName,
        level: experienceLevel,
        diagnosticCompleted: false,
        diagnosticScore: 0,
        modules: [],
        overallProgress: 0,
        completedModules: 0,
        totalModules: 0
      });

    } else if (action === 'remove') {
      // Remove domain
      progress.domains = progress.domains.filter(d => d.domainName !== domainName);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "add" or "remove"'
      });
    }

    await progress.save();

    // Also update user's onboarding data
    const user = await User.findById(userId);
    if (user && user.onboardingData) {
      const updatedDomains = progress.domains.map(d => d.domainName);
      user.onboardingData.domains = updatedDomains;
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: progress,
      message: `Domain ${action}ed successfully`
    });

  } catch (error) {
    console.error('❌ Update domains error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/progress/module
 * @desc    Update module progress
 * @access  Private
 */
router.put('/module', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { domainName, moduleId, moduleName, progress: moduleProgress, status } = req.body;

    if (!domainName || !moduleId) {
      return res.status(400).json({
        success: false,
        message: 'Domain name and module ID are required'
      });
    }

    let userProgress = await LearningProgress.findOne({ userId });
    
    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: 'Learning progress not found'
      });
    }

    const domainIndex = userProgress.domains.findIndex(d => d.domainName === domainName);
    
    if (domainIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found in learning path'
      });
    }

    const domain = userProgress.domains[domainIndex];
    const moduleIndex = domain.modules.findIndex(m => m.moduleId === moduleId);

    if (moduleIndex >= 0) {
      // Update existing module
      domain.modules[moduleIndex].progress = moduleProgress || domain.modules[moduleIndex].progress;
      domain.modules[moduleIndex].status = status || domain.modules[moduleIndex].status;
      
      if (status === 'completed') {
        domain.modules[moduleIndex].completedAt = new Date();
      }
    } else {
      // Add new module
      domain.modules.push({
        moduleId,
        moduleName: moduleName || `Module ${moduleId}`,
        status: status || 'available',
        progress: moduleProgress || 0,
        subtasks: []
      });
    }

    // Recalculate domain progress
    const completedModules = domain.modules.filter(m => m.status === 'completed').length;
    domain.completedModules = completedModules;
    domain.totalModules = domain.modules.length;
    domain.overallProgress = domain.totalModules > 0 ? Math.round((completedModules / domain.totalModules) * 100) : 0;

    await userProgress.save();

    res.status(200).json({
      success: true,
      data: userProgress,
      message: 'Module progress updated successfully'
    });

  } catch (error) {
    console.error('❌ Update module progress error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
