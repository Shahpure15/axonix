/**
 * Onboarding Routes for SocraticWingman
 * Handles saving user onboarding data
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware to authenticate JWT token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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
 * @route   POST /api/onboarding
 * @desc    Save user onboarding data
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId, domains, experience_level, preferred_study_time, timezone } = req.body;

    // Validate input
    if (!userId || !domains || !experience_level || !preferred_study_time || !timezone) {
      return res.status(400).json({
        success: false,
        message: 'All onboarding fields are required'
      });
    }

    // Validate domains array
    if (!Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one domain must be selected'
      });
    }

    // Validate experience level
    const validExperienceLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validExperienceLevels.includes(experience_level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience level'
      });
    }

    // Ensure the user is updating their own data or is authorized
    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user\'s onboarding data'
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user with onboarding data
    // Add onboarding fields to user schema (we'll extend the User model)
    user.onboardingData = {
      domains,
      experience_level,
      preferred_study_time,
      timezone,
      completed_at: new Date()
    };
    user.onboardingCompleted = true;

    await user.save();

    console.log(`✅ Onboarding completed for user: ${user.email} (ID: ${user._id})`);

    res.status(200).json({
      success: true,
      message: 'Onboarding data saved successfully',
      data: {
        userId: user._id,
        domains,
        experience_level,
        preferred_study_time,
        timezone,
        completed_at: user.onboardingData.completed_at
      }
    });

  } catch (error) {
    console.error('❌ Onboarding save error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during onboarding save'
    });
  }
});

/**
 * @route   GET /api/onboarding
 * @desc    Get user onboarding data
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.onboardingCompleted || !user.onboardingData) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not completed'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        ...user.onboardingData,
        onboardingCompleted: user.onboardingCompleted
      }
    });

  } catch (error) {
    console.error('❌ Get onboarding error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
