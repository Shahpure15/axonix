/**
 * Qraptor Subtask Model
 * Stores LLM-generated subtasks and workflow tracking
 */

const mongoose = require('mongoose');

const qraptorSubtaskSchema = new mongoose.Schema({
  // Workflow tracking
  workflowId: {
    type: String,
    required: true,
    index: true
  },
  
  // User and context
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  domainId: {
    type: String,
    required: true,
    index: true
  },
  
  subdomainId: {
    type: String,
    required: true,
    index: true
  },
  
  // Task details from LLM
  taskId: {
    type: String,
    required: true,
    unique: true
  },
  
  prompt: {
    type: String,
    required: false // Not required for workflow tracking records
  },
  
  inputsSchema: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  
  answerSchema: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: false
  },
  
  estimatedMinutes: {
    type: Number,
    required: false
  },
  
  skillsTargeted: [{
    type: String
  }],
  
  maxAttempts: {
    type: Number,
    default: 3
  },
  
  // Task status
  status: {
    type: String,
    enum: ['active', 'pending', 'completed', 'skipped', 'workflow_tracking'],
    default: 'active',
    index: true
  },
  
  // Workflow specific fields
  workflowStatus: {
    type: String,
    enum: [
      'agent1_initiated',
      'agent1_completed', 
      'agent1_failed',
      'agent2_initiated',
      'agent2_completed',
      'agent2_failed',
      'completed_confidence_met',
      'completed_subtasks_created',
      'failed'
    ],
    required: false
  },
  
  workflowStage: {
    type: String,
    enum: [
      'data_mapping',
      'llm_processing',
      'llm_processing_complete',
      'result_storage',
      'workflow_complete'
    ],
    required: false
  },
  
  // User interaction
  attempts: [{
    attemptNumber: Number,
    userAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    timeSpent: Number, // in seconds
    submittedAt: Date,
    feedback: String
  }],
  
  // Results
  completed: {
    type: Boolean,
    default: false
  },
  
  completedAt: {
    type: Date,
    required: false
  },
  
  finalScore: {
    type: Number,
    required: false
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient queries
qraptorSubtaskSchema.index({ userId: 1, domainId: 1, subdomainId: 1 });
qraptorSubtaskSchema.index({ workflowId: 1, status: 1 });
qraptorSubtaskSchema.index({ userId: 1, status: 1, createdAt: -1 });

// Update timestamp on save
qraptorSubtaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for total attempts
qraptorSubtaskSchema.virtual('totalAttempts').get(function() {
  return this.attempts ? this.attempts.length : 0;
});

// Virtual for success rate
qraptorSubtaskSchema.virtual('successRate').get(function() {
  if (!this.attempts || this.attempts.length === 0) return 0;
  
  const correctAttempts = this.attempts.filter(attempt => attempt.isCorrect).length;
  return (correctAttempts / this.attempts.length) * 100;
});

// Method to add attempt
qraptorSubtaskSchema.methods.addAttempt = function(attemptData) {
  const attemptNumber = this.attempts.length + 1;
  
  this.attempts.push({
    attemptNumber,
    userAnswer: attemptData.userAnswer,
    isCorrect: attemptData.isCorrect,
    timeSpent: attemptData.timeSpent,
    submittedAt: new Date(),
    feedback: attemptData.feedback
  });
  
  // Check if task is completed
  if (attemptData.isCorrect || attemptNumber >= this.maxAttempts) {
    this.completed = true;
    this.completedAt = new Date();
    this.status = 'completed';
    this.finalScore = attemptData.isCorrect ? 100 : 0;
  }
  
  return this.save();
};

// Method to check if user can attempt
qraptorSubtaskSchema.methods.canAttempt = function() {
  return !this.completed && this.attempts.length < this.maxAttempts;
};

// Static method to get user's active subtasks
qraptorSubtaskSchema.statics.getActiveSubtasks = function(userId, domainId = null, subdomainId = null) {
  const query = {
    userId,
    status: 'active',
    taskId: { $not: /^workflow_/ } // Exclude workflow tracking
  };
  
  if (domainId) query.domainId = domainId;
  if (subdomainId) query.subdomainId = subdomainId;
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get workflow status
qraptorSubtaskSchema.statics.getWorkflowStatus = function(workflowId) {
  return this.findOne({
    workflowId,
    status: 'workflow_tracking'
  });
};

module.exports = mongoose.model('QraptorSubtask', qraptorSubtaskSchema);
