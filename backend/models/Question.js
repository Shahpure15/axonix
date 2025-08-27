/**
 * Question Model for SocraticWingman
 * Stores questions for diagnostic tests and learning modules
 */

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'coding'],
    required: true
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  correctAnswer: {
    type: String, // For short-answer or coding questions
    required: false
  },
  explanation: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  domains: [{
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
  }],
  tags: [{
    type: String,
    trim: true
  }],
  points: {
    type: Number,
    default: 1,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
questionSchema.index({ domains: 1, difficulty: 1 });
questionSchema.index({ questionType: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ isActive: 1 });

// Virtual for formatted question data
questionSchema.virtual('formattedQuestion').get(function() {
  return {
    id: this._id,
    question: this.questionText,
    type: this.questionType,
    options: this.options,
    difficulty: this.difficulty,
    domains: this.domains,
    points: this.points
  };
});

// Use environment variable for collection name
const collectionName = process.env.QUESTIONS_COLLECTION || 'questions';
module.exports = mongoose.model('Question', questionSchema, collectionName);
