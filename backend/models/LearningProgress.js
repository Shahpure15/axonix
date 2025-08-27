/**
 * Learning Progress Model for SocraticWingman
 * Tracks user's learning journey and module progress
 */

const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  domains: [{
    domainName: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true
    },
    diagnosticCompleted: {
      type: Boolean,
      default: false
    },
    diagnosticScore: {
      type: Number,
      default: 0
    },
    modules: [{
      moduleId: {
        type: String,
        required: true
      },
      moduleName: {
        type: String,
        required: true
      },
      status: {
        type: String,
        enum: ['locked', 'available', 'in-progress', 'completed'],
        default: 'locked'
      },
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      score: {
        type: Number,
        default: 0
      },
      startedAt: Date,
      completedAt: Date,
      subtasks: [{
        subtaskId: String,
        title: String,
        completed: {
          type: Boolean,
          default: false
        },
        completedAt: Date
      }]
    }],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedModules: {
      type: Number,
      default: 0
    },
    totalModules: {
      type: Number,
      default: 0
    }
  }],
  overallXP: {
    type: Number,
    default: 0
  },
  currentLevel: {
    type: Number,
    default: 1
  },
  streak: {
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActivityDate: Date
  },
  achievements: [{
    achievementId: String,
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    xpReward: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Indexes
learningProgressSchema.index({ userId: 1 });
learningProgressSchema.index({ 'domains.domainName': 1 });
learningProgressSchema.index({ overallXP: -1 });

// Method to update overall progress
learningProgressSchema.methods.updateOverallProgress = function() {
  let totalProgress = 0;
  let activeDomains = 0;

  this.domains.forEach(domain => {
    if (domain.modules.length > 0) {
      totalProgress += domain.overallProgress;
      activeDomains++;
    }
  });

  if (activeDomains > 0) {
    this.overallProgress = Math.round(totalProgress / activeDomains);
  }

  return this.save();
};

// Method to add XP and check level up
learningProgressSchema.methods.addXP = function(xpAmount) {
  this.overallXP += xpAmount;
  
  // Simple level calculation (every 1000 XP = 1 level)
  const newLevel = Math.floor(this.overallXP / 1000) + 1;
  if (newLevel > this.currentLevel) {
    this.currentLevel = newLevel;
    // Could trigger achievement here
  }
  
  return this.save();
};

// Static method to get leaderboard
learningProgressSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find()
    .populate('userId', 'name email')
    .sort({ overallXP: -1 })
    .limit(limit);
};

// Use environment variable for collection name
const collectionName = process.env.LEARNINGPROGRESS_COLLECTION || 'learningprogresses';
module.exports = mongoose.model('LearningProgress', learningProgressSchema, collectionName);
