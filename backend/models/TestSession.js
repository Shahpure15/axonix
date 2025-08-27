/**
 * Test Session Model for SocraticWingman
 * Stores user test attempts and results
 */

const mongoose = require('mongoose');

const testSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testType: {
    type: String,
    enum: ['diagnostic', 'module-quiz', 'practice', 'final-assessment'],
    required: true
  },
  domain: {
    type: String,
    required: true,
    enum: [
      'machine-learning',
      'data-science', 
      'web-development',
      'mobile-development',
      'devops',
      'cybersecurity',
      'blockchain',
      'game-development',
      'ui-ux-design',
      'cloud-computing'
    ]
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    userAnswer: {
      type: mongoose.Schema.Types.Mixed, // Can be string, array, or object
      required: false
    },
    isCorrect: {
      type: Boolean,
      required: false
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    },
    points: {
      type: Number,
      default: 0
    },
    // Enhanced fields for future learning tests
    confidenceLevel: {
      type: Number, // 1-5 scale: how confident user was
      min: 1,
      max: 5,
      required: false
    },
    attemptCount: {
      type: Number, // How many times they changed their answer
      default: 1
    },
    skipped: {
      type: Boolean,
      default: false
    },
    flaggedForReview: {
      type: Boolean,
      default: false
    },
    answerTimestamp: {
      type: Date,
      default: Date.now
    }
  }],
  score: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    required: false
  },
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0
  },
  feedback: {
    type: String,
    trim: true
  },
  recommendations: [{
    domain: String,
    level: String,
    modules: [String]
  }]
}, {
  timestamps: true
});

// Indexes
testSessionSchema.index({ userId: 1, testType: 1 });
testSessionSchema.index({ domain: 1 });
testSessionSchema.index({ status: 1 });
testSessionSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate percentage
testSessionSchema.pre('save', function(next) {
  if (this.totalQuestions > 0) {
    this.percentage = Math.round((this.correctAnswers / this.totalQuestions) * 100);
  }
  next();
});

// Method to mark test as completed
testSessionSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Static method to get user's test history
testSessionSchema.statics.getUserTestHistory = function(userId, testType = null) {
  const query = { userId };
  if (testType) query.testType = testType;
  
  return this.find(query)
    .populate('questions.questionId')
    .sort({ createdAt: -1 });
};

// Static method to get user's response patterns for learning recommendations
testSessionSchema.statics.getUserResponsePatterns = function(userId, domain = null) {
  const matchStage = { userId };
  if (domain) matchStage.domain = domain;

  return this.aggregate([
    { $match: matchStage },
    { $unwind: '$questions' },
    {
      $lookup: {
        from: 'questions',
        localField: 'questions.questionId',
        foreignField: '_id',
        as: 'questionData'
      }
    },
    { $unwind: '$questionData' },
    {
      $group: {
        _id: {
          domain: '$domain',
          difficulty: '$questionData.difficulty',
          questionType: '$questionData.questionType'
        },
        totalAttempts: { $sum: 1 },
        correctAnswers: { $sum: { $cond: ['$questions.isCorrect', 1, 0] } },
        avgTimeSpent: { $avg: '$questions.timeSpent' },
        avgConfidence: { $avg: '$questions.confidenceLevel' },
        weakAreas: {
          $push: {
            $cond: [
              { $eq: ['$questions.isCorrect', false] },
              '$questionData.tags',
              null
            ]
          }
        }
      }
    },
    {
      $project: {
        domain: '$_id.domain',
        difficulty: '$_id.difficulty',
        questionType: '$_id.questionType',
        successRate: { $divide: ['$correctAnswers', '$totalAttempts'] },
        totalAttempts: 1,
        avgTimeSpent: 1,
        avgConfidence: 1,
        needsImprovement: { $lt: [{ $divide: ['$correctAnswers', '$totalAttempts'] }, 0.7] }
      }
    },
    { $sort: { successRate: 1 } }
  ]);
};

// Method to get incorrect answers for review
testSessionSchema.methods.getIncorrectAnswers = function() {
  return this.questions.filter(q => q.isCorrect === false);
};

// Method to get time-based performance insights
testSessionSchema.methods.getPerformanceInsights = function() {
  const questions = this.questions.filter(q => q.timeSpent > 0);
  
  if (questions.length === 0) return null;
  
  const timeSpent = questions.map(q => q.timeSpent);
  const avgTime = timeSpent.reduce((a, b) => a + b, 0) / timeSpent.length;
  
  return {
    avgTimePerQuestion: avgTime,
    fastestQuestion: Math.min(...timeSpent),
    slowestQuestion: Math.max(...timeSpent),
    questionsRushed: questions.filter(q => q.timeSpent < avgTime * 0.5).length,
    questionsStruggledWith: questions.filter(q => q.timeSpent > avgTime * 2).length
  };
};

// Use environment variable for collection name
const collectionName = process.env.TESTSESSIONS_COLLECTION || 'testsessions';
module.exports = mongoose.model('TestSession', testSessionSchema, collectionName);
