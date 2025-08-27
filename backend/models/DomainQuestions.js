/**
 * Dynamic Question Model for Domain-Specific Collections
 * Provides access to questions based on domain
 */

const mongoose = require('mongoose');

// Question Schema (same for all domains)
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true, trim: true },
  questionType: { 
    type: String, 
    enum: ['multiple-choice', 'true-false', 'short-answer', 'coding'],
    required: true 
  },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  correctAnswer: { type: String, required: false },
  explanation: { type: String, trim: true },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true 
  },
  domains: [{
    type: String,
    required: true,
    enum: [
      'machine-learning', 'data-science', 'web-development',
      'mobile-development', 'devops', 'cybersecurity',
      'blockchain', 'game-development', 'ui-ux-design', 'cloud-computing'
    ]
  }],
  tags: [{ type: String, trim: true }],
  points: { type: Number, default: 1, min: 1 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, default: 'system' }
}, { timestamps: true });

// Domain to collection mapping
const domainCollectionMap = {
  'machine-learning': process.env.QUESTIONS_ML_COLLECTION || 'questions_machine_learning',
  'data-science': process.env.QUESTIONS_DS_COLLECTION || 'questions_data_science',
  'web-development': process.env.QUESTIONS_WEB_COLLECTION || 'questions_web_development',
  'mobile-development': process.env.QUESTIONS_MOBILE_COLLECTION || 'questions_mobile_development',
  'devops': process.env.QUESTIONS_DEVOPS_COLLECTION || 'questions_devops',
  'cybersecurity': process.env.QUESTIONS_SECURITY_COLLECTION || 'questions_cybersecurity',
  'blockchain': process.env.QUESTIONS_BLOCKCHAIN_COLLECTION || 'questions_blockchain',
  'game-development': process.env.QUESTIONS_GAME_COLLECTION || 'questions_game_development',
  'ui-ux-design': process.env.QUESTIONS_UIUX_COLLECTION || 'questions_ui_ux_design',
  'cloud-computing': process.env.QUESTIONS_CLOUD_COLLECTION || 'questions_cloud_computing'
};

// Cache for models to avoid re-creation
const modelCache = {};

/**
 * Get Question model for specific domain
 * @param {string} domain - The domain name
 * @returns {mongoose.Model} Domain-specific Question model
 */
function getQuestionModel(domain) {
  if (!domainCollectionMap[domain]) {
    throw new Error(`Unknown domain: ${domain}`);
  }

  // Return cached model if exists
  if (modelCache[domain]) {
    return modelCache[domain];
  }

  // Create new model for domain
  const collectionName = domainCollectionMap[domain];
  const modelName = `Question_${domain.replace('-', '_')}`;
  
  const model = mongoose.model(modelName, questionSchema, collectionName);
  modelCache[domain] = model;
  
  return model;
}

/**
 * Get questions from specific domain
 * @param {string} domain - Domain name
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Array of questions
 */
async function getQuestionsByDomain(domain, filters = {}) {
  const QuestionModel = getQuestionModel(domain);
  return await QuestionModel.find({ isActive: true, ...filters });
}

/**
 * Get questions by difficulty from specific domain
 * @param {string} domain - Domain name
 * @param {string} difficulty - Difficulty level
 * @param {number} limit - Number of questions to return
 * @returns {Promise<Array>} Array of questions
 */
async function getQuestionsByDifficulty(domain, difficulty, limit = 10) {
  const QuestionModel = getQuestionModel(domain);
  return await QuestionModel.find({ 
    isActive: true, 
    difficulty 
  }).limit(limit);
}

/**
 * Get random questions from domain for diagnostic test
 * @param {string} domain - Domain name
 * @param {number} count - Number of questions needed
 * @param {Object} difficultyDistribution - Distribution of difficulties
 * @returns {Promise<Array>} Array of questions
 */
async function getDiagnosticQuestions(domain, count = 10, difficultyDistribution = { beginner: 0.5, intermediate: 0.3, advanced: 0.2 }) {
  const QuestionModel = getQuestionModel(domain);
  
  const beginnerCount = Math.ceil(count * difficultyDistribution.beginner);
  const intermediateCount = Math.ceil(count * difficultyDistribution.intermediate);
  const advancedCount = count - beginnerCount - intermediateCount;

  const [beginnerQuestions, intermediateQuestions, advancedQuestions] = await Promise.all([
    QuestionModel.aggregate([
      { $match: { isActive: true, difficulty: 'beginner' } },
      { $sample: { size: beginnerCount } }
    ]),
    QuestionModel.aggregate([
      { $match: { isActive: true, difficulty: 'intermediate' } },
      { $sample: { size: intermediateCount } }
    ]),
    QuestionModel.aggregate([
      { $match: { isActive: true, difficulty: 'advanced' } },
      { $sample: { size: advancedCount } }
    ])
  ]);

  return [...beginnerQuestions, ...intermediateQuestions, ...advancedQuestions];
}

/**
 * Get all available domains
 * @returns {Array<string>} Array of domain names
 */
function getAvailableDomains() {
  return Object.keys(domainCollectionMap);
}

/**
 * Get collection name for domain
 * @param {string} domain - Domain name
 * @returns {string} Collection name
 */
function getCollectionName(domain) {
  return domainCollectionMap[domain];
}

/**
 * Get statistics for all domain collections
 * @returns {Promise<Object>} Statistics object
 */
async function getDomainStatistics() {
  const stats = {};
  
  for (const domain of Object.keys(domainCollectionMap)) {
    try {
      const QuestionModel = getQuestionModel(domain);
      const totalCount = await QuestionModel.countDocuments({ isActive: true });
      
      const difficultyStats = await QuestionModel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } }
      ]);

      stats[domain] = {
        collection: domainCollectionMap[domain],
        totalQuestions: totalCount,
        difficulties: difficultyStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      };
    } catch (error) {
      stats[domain] = {
        collection: domainCollectionMap[domain],
        error: error.message
      };
    }
  }
  
  return stats;
}

module.exports = {
  getQuestionModel,
  getQuestionsByDomain,
  getQuestionsByDifficulty,
  getDiagnosticQuestions,
  getAvailableDomains,
  getCollectionName,
  getDomainStatistics,
  domainCollectionMap
};
