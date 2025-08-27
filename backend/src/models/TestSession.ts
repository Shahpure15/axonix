/**
 * Test Session Model (TypeScript)
 * Stores user test attempts and results with proper typing
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { Domain } from '../types/domain-questions';

// Test Session Question Interface
export interface ITestSessionQuestion {
  questionId: Schema.Types.ObjectId;
  userAnswer?: any;
  isCorrect?: boolean;
  timeSpent: number;
  points: number;
  confidenceLevel?: number;
  attemptCount: number;
  skipped: boolean;
  flaggedForReview: boolean;
  answerTimestamp: Date;
}

// Test Session Interface
export interface ITestSession {
  userId: Schema.Types.ObjectId;
  testType: 'diagnostic' | 'module-quiz' | 'practice' | 'final-assessment';
  domain: Domain;
  questions: ITestSessionQuestion[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  totalTimeSpent: number;
  feedback?: string;
  recommendations: Array<{
    domain: string;
    level: string;
    modules: string[];
  }>;
}

// Test Session Document Interface
export interface ITestSessionDocument extends ITestSession, Document {
  complete(): Promise<ITestSessionDocument>;
  getIncorrectAnswers(): ITestSessionQuestion[];
  getPerformanceInsights(): {
    avgTimePerQuestion: number;
    fastestQuestion: number;
    slowestQuestion: number;
    questionsRushed: number;
    questionsStruggledWith: number;
  } | null;
}

// Test Session Schema
const testSessionSchema = new Schema<ITestSessionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
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
    enum: Object.values(Domain)
  },
  questions: [{
    questionId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    userAnswer: {
      type: Schema.Types.Mixed,
      required: false
    },
    isCorrect: {
      type: Boolean,
      required: false
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    },
    confidenceLevel: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    attemptCount: {
      type: Number,
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
    type: Number,
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

// Indexes for better performance
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
testSessionSchema.methods.complete = function(this: ITestSessionDocument): Promise<ITestSessionDocument> {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to get incorrect answers for review
testSessionSchema.methods.getIncorrectAnswers = function(this: ITestSessionDocument): ITestSessionQuestion[] {
  return this.questions.filter(q => q.isCorrect === false);
};

// Method to get time-based performance insights
testSessionSchema.methods.getPerformanceInsights = function(this: ITestSessionDocument) {
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

// Static method to get user's test history
testSessionSchema.statics.getUserTestHistory = function(
  this: Model<ITestSessionDocument>,
  userId: string, 
  testType?: string
) {
  const query: any = { userId };
  if (testType) query.testType = testType;
  
  return this.find(query)
    .sort({ createdAt: -1 });
};

// Static method to get user's response patterns for learning recommendations
testSessionSchema.statics.getUserResponsePatterns = function(
  this: Model<ITestSessionDocument>,
  userId: string, 
  domain?: Domain
) {
  const matchStage: any = { userId };
  if (domain) matchStage.domain = domain;

  return this.aggregate([
    { $match: matchStage },
    { $unwind: '$questions' },
    {
      $group: {
        _id: {
          domain: '$domain',
          testType: '$testType'
        },
        totalAttempts: { $sum: 1 },
        correctAnswers: { $sum: { $cond: ['$questions.isCorrect', 1, 0] } },
        avgTimeSpent: { $avg: '$questions.timeSpent' },
        avgConfidence: { $avg: '$questions.confidenceLevel' },
        totalScore: { $sum: '$questions.points' }
      }
    },
    {
      $project: {
        domain: '$_id.domain',
        testType: '$_id.testType',
        successRate: { $divide: ['$correctAnswers', '$totalAttempts'] },
        totalAttempts: 1,
        avgTimeSpent: 1,
        avgConfidence: 1,
        totalScore: 1,
        needsImprovement: { $lt: [{ $divide: ['$correctAnswers', '$totalAttempts'] }, 0.7] }
      }
    },
    { $sort: { successRate: 1 } }
  ]);
};

// Use environment variable for collection name
const collectionName = process.env.TESTSESSIONS_COLLECTION || 'testsessions';
const TestSession = mongoose.model<ITestSessionDocument>('TestSession', testSessionSchema, collectionName);

export default TestSession;
