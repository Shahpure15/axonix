/**
 * User Performance Analytics Model for AI-Driven Test Generation
 * Stores detailed metrics and response patterns for personalized learning
 */

const mongoose = require('mongoose');

// Detailed question response schema
const questionResponseSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'coding'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  topic: {
    type: String,
    required: true // e.g., "HTML Basics", "CSS Selectors", "JavaScript Functions"
  },
  subtopic: {
    type: String // e.g., "HTML Tags", "CSS Properties", "Arrow Functions"
  },
  correctAnswer: mongoose.Schema.Types.Mixed, // Store the correct answer for analysis
  userAnswer: mongoose.Schema.Types.Mixed, // User's actual answer
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number, // Time in seconds
    required: true
  },
  confidenceLevel: {
    type: String,
    enum: ['very-low', 'low', 'medium', 'high', 'very-high'],
    default: 'medium'
  },
  attemptNumber: {
    type: Number,
    default: 1 // Track if user attempts same question multiple times
  },
  hints_used: {
    type: Number,
    default: 0
  }
});

// Performance metrics schema
const performanceMetricsSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true
  },
  
  // Overall Performance
  totalQuestionsAttempted: { type: Number, default: 0 },
  totalCorrectAnswers: { type: Number, default: 0 },
  overallAccuracy: { type: Number, default: 0 }, // Percentage
  
  // Difficulty-based Performance
  beginnerAccuracy: { type: Number, default: 0 },
  intermediateAccuracy: { type: Number, default: 0 },
  advancedAccuracy: { type: Number, default: 0 },
  
  // Topic-wise Performance (flexible for different domains)
  topicPerformance: [{
    topicName: String,
    questionsAttempted: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    averageTimeSpent: { type: Number, default: 0 },
    lastAttempted: { type: Date, default: Date.now }
  }],
  
  // Learning Patterns
  averageTimePerQuestion: { type: Number, default: 0 }, // seconds
  fastestAnswerTime: { type: Number, default: 0 },
  slowestAnswerTime: { type: Number, default: 0 },
  
  // Mistake Patterns
  commonMistakes: [{
    mistakeType: String, // e.g., "syntax-error", "concept-confusion", "calculation-error"
    frequency: Number,
    examples: [String] // Store examples of the mistakes
  }],
  
  // Weakness Areas (AI will use this for test generation)
  weaknessAreas: [{
    topic: String,
    subtopic: String,
    weaknessLevel: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'mild'
    },
    recommendedPractice: String,
    lastReviewed: Date
  }],
  
  // Strength Areas
  strengthAreas: [{
    topic: String,
    masteryLevel: {
      type: String,
      enum: ['basic', 'good', 'excellent', 'expert'],
      default: 'basic'
    }
  }],
  
  // Learning Velocity
  improvementRate: { type: Number, default: 0 }, // How fast user is improving
  consistencyScore: { type: Number, default: 0 }, // How consistent is the performance
  
  lastUpdated: { type: Date, default: Date.now }
});

// Main User Performance Analytics Schema
const userPerformanceAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Detailed Response History
  responseHistory: [questionResponseSchema],
  
  // Domain-wise Performance Metrics
  domainMetrics: [performanceMetricsSchema],
  
  // Overall Learning Profile
  learningProfile: {
    preferredDifficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    learningSpeed: {
      type: String,
      enum: ['slow', 'average', 'fast'],
      default: 'average'
    },
    strongestDomains: [String],
    weakestDomains: [String],
    recommendedFocusAreas: [String]
  },
  
  // AI Analysis Results
  aiAnalysis: {
    lastAnalyzed: Date,
    readinessForAdvancement: {
      type: String,
      enum: ['not-ready', 'partially-ready', 'ready', 'overqualified'],
      default: 'not-ready'
    },
    suggestedNextTopics: [String],
    personalizedTips: [String],
    estimatedTimeToMastery: Number, // in hours
    confidenceScore: Number // How confident AI is about its analysis
  },
  
  // Session Tracking
  sessionHistory: [{
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestSession'
    },
    sessionType: {
      type: String,
      enum: ['diagnostic', 'practice', 'targeted-practice', 'review', 'assessment']
    },
    domain: String,
    startTime: Date,
    endTime: Date,
    questionsAttempted: Number,
    accuracy: Number,
    improvementFromLastSession: Number
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
userPerformanceAnalyticsSchema.index({ userId: 1 });
userPerformanceAnalyticsSchema.index({ 'domainMetrics.domain': 1 });
userPerformanceAnalyticsSchema.index({ 'responseHistory.topic': 1 });
userPerformanceAnalyticsSchema.index({ 'aiAnalysis.lastAnalyzed': 1 });

// Methods for AI Agent to use
userPerformanceAnalyticsSchema.methods.getWeaknessesForDomain = function(domain) {
  const domainMetric = this.domainMetrics.find(m => m.domain === domain);
  if (!domainMetric) return [];
  
  return domainMetric.weaknessAreas.sort((a, b) => {
    const severity = { 'severe': 3, 'moderate': 2, 'mild': 1 };
    return severity[b.weaknessLevel] - severity[a.weaknessLevel];
  });
};

userPerformanceAnalyticsSchema.methods.getTopicAccuracy = function(domain, topic) {
  const domainMetric = this.domainMetrics.find(m => m.domain === domain);
  if (!domainMetric) return 0;
  
  const topicPerf = domainMetric.topicPerformance.find(t => t.topicName === topic);
  return topicPerf ? topicPerf.accuracy : 0;
};

userPerformanceAnalyticsSchema.methods.addResponse = function(responseData) {
  this.responseHistory.push(responseData);
  this.updateMetrics(responseData);
};

userPerformanceAnalyticsSchema.methods.updateMetrics = function(responseData) {
  // Find or create domain metrics
  let domainMetric = this.domainMetrics.find(m => m.domain === responseData.domain);
  if (!domainMetric) {
    domainMetric = {
      domain: responseData.domain,
      totalQuestionsAttempted: 0,
      totalCorrectAnswers: 0,
      overallAccuracy: 0,
      topicPerformance: []
    };
    this.domainMetrics.push(domainMetric);
  }
  
  // Update overall metrics
  domainMetric.totalQuestionsAttempted++;
  if (responseData.isCorrect) {
    domainMetric.totalCorrectAnswers++;
  }
  domainMetric.overallAccuracy = (domainMetric.totalCorrectAnswers / domainMetric.totalQuestionsAttempted) * 100;
  
  // Update topic performance
  let topicPerf = domainMetric.topicPerformance.find(t => t.topicName === responseData.topic);
  if (!topicPerf) {
    topicPerf = {
      topicName: responseData.topic,
      questionsAttempted: 0,
      correctAnswers: 0,
      accuracy: 0,
      averageTimeSpent: 0
    };
    domainMetric.topicPerformance.push(topicPerf);
  }
  
  topicPerf.questionsAttempted++;
  if (responseData.isCorrect) {
    topicPerf.correctAnswers++;
  }
  topicPerf.accuracy = (topicPerf.correctAnswers / topicPerf.questionsAttempted) * 100;
  topicPerf.averageTimeSpent = ((topicPerf.averageTimeSpent * (topicPerf.questionsAttempted - 1)) + responseData.timeSpent) / topicPerf.questionsAttempted;
  topicPerf.lastAttempted = new Date();
};

// Static methods for AI Agent queries
userPerformanceAnalyticsSchema.statics.getUsersNeedingReview = function(domain) {
  return this.find({
    'domainMetrics.domain': domain,
    'domainMetrics.weaknessAreas.0': { $exists: true } // Has weakness areas
  });
};

userPerformanceAnalyticsSchema.statics.getTopicDifficultyData = function(domain, topic) {
  return this.aggregate([
    { $unwind: '$responseHistory' },
    { $match: { 'responseHistory.topic': topic, 'responseHistory.domain': domain } },
    { $group: {
        _id: '$responseHistory.difficulty',
        totalAttempts: { $sum: 1 },
        correctAnswers: { $sum: { $cond: ['$responseHistory.isCorrect', 1, 0] } },
        averageTime: { $avg: '$responseHistory.timeSpent' }
    }},
    { $project: {
        difficulty: '$_id',
        accuracy: { $multiply: [{ $divide: ['$correctAnswers', '$totalAttempts'] }, 100] },
        averageTime: 1,
        totalAttempts: 1
    }}
  ]);
};

const UserPerformanceAnalytics = mongoose.model('UserPerformanceAnalytics', userPerformanceAnalyticsSchema);

module.exports = UserPerformanceAnalytics;
