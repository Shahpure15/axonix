/**
 * User Model for SocraticWingman
 * MongoDB schema using Mongoose with bcrypt password hashing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  xp: {
    type: Number,
    default: 0,
    min: [0, 'XP cannot be negative']
  },
  level: {
    type: Number,
    default: 1,
    min: [1, 'Level must be at least 1']
  },
  clan: {
    type: String,
    default: null,
    trim: true
  },
  quests: [{
    id: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['completed', 'in-progress'],
      required: true
    },
    completedAt: {
      type: Date,
      default: null
    }
  }],
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  onboardingData: {
    domains: [{
      type: String,
      required: false
    }],
    experience_level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: false
    },
    preferred_study_time: {
      type: String,
      required: false
    },
    timezone: {
      type: String,
      required: false
    },
    completed_at: {
      type: Date,
      required: false
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  collection: 'users'
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    // Hash password with salt rounds of 12
    const saltRounds = 12;
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to add XP and potentially level up
userSchema.methods.addXP = function(xpAmount) {
  this.xp += xpAmount;
  
  // Simple leveling formula: level = floor(sqrt(xp/100)) + 1
  const newLevel = Math.floor(Math.sqrt(this.xp / 100)) + 1;
  
  if (newLevel > this.level) {
    this.level = newLevel;
    return { leveledUp: true, newLevel };
  }
  
  return { leveledUp: false, newLevel: this.level };
};

// Instance method to add/update quest
userSchema.methods.updateQuest = function(questId, status) {
  const existingQuestIndex = this.quests.findIndex(q => q.id === questId);
  
  if (existingQuestIndex >= 0) {
    // Update existing quest
    this.quests[existingQuestIndex].status = status;
    if (status === 'completed') {
      this.quests[existingQuestIndex].completedAt = new Date();
    }
  } else {
    // Add new quest
    this.quests.push({
      id: questId,
      status,
      completedAt: status === 'completed' ? new Date() : null
    });
  }
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual for user profile (excluding sensitive data)
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    xp: this.xp,
    level: this.level,
    clan: this.clan,
    quests: this.quests,
    onboardingCompleted: this.onboardingCompleted,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
