/**
 * Dynamic Question Model for Domain-Specific Collections (TypeScript)
 * Provides access to questions based on domain with full type safety
 */

import mongoose, { Model, Schema } from 'mongoose';
import { 
  Domain, 
  QuestionType, 
  Difficulty, 
  IQuestionDocument, 
  IQuestionFilters, 
  IDifficultyDistribution, 
  DomainStatistics,
  DomainCollectionMap 
} from '../types/domain-questions';

// Question Schema with TypeScript typing
const questionSchema = new Schema<IQuestionDocument>({
  questionText: { 
    type: String, 
    required: [true, 'Question text is required'], 
    trim: true 
  },
  questionType: { 
    type: String, 
    enum: Object.values(QuestionType),
    required: true 
  },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  correctAnswer: { 
    type: String, 
    required: false 
  },
  explanation: { 
    type: String, 
    trim: true 
  },
  difficulty: { 
    type: String, 
    enum: Object.values(Difficulty),
    required: true 
  },
  domains: [{
    type: String,
    required: true,
    enum: Object.values(Domain)
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
    type: String, 
    default: 'system' 
  }
}, { 
  timestamps: true 
});

// Virtual for formatted question data
questionSchema.virtual('formattedQuestion').get(function(this: IQuestionDocument) {
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

// Domain to collection mapping with proper typing
const domainCollectionMap: DomainCollectionMap = {
  [Domain.MachineLearning]: process.env.QUESTIONS_ML_COLLECTION || 'questions_machine_learning',
  [Domain.DataScience]: process.env.QUESTIONS_DS_COLLECTION || 'questions_data_science',
  [Domain.WebDevelopment]: process.env.QUESTIONS_WEB_COLLECTION || 'questions_web_development',
  [Domain.MobileDevelopment]: process.env.QUESTIONS_MOBILE_COLLECTION || 'questions_mobile_development',
  [Domain.DevOps]: process.env.QUESTIONS_DEVOPS_COLLECTION || 'questions_devops',
  [Domain.Cybersecurity]: process.env.QUESTIONS_SECURITY_COLLECTION || 'questions_cybersecurity',
  [Domain.Blockchain]: process.env.QUESTIONS_BLOCKCHAIN_COLLECTION || 'questions_blockchain',
  [Domain.GameDevelopment]: process.env.QUESTIONS_GAME_COLLECTION || 'questions_game_development',
  [Domain.UIUXDesign]: process.env.QUESTIONS_UIUX_COLLECTION || 'questions_ui_ux_design',
  [Domain.CloudComputing]: process.env.QUESTIONS_CLOUD_COLLECTION || 'questions_cloud_computing'
};

// Cache for models to avoid re-creation
const modelCache: Map<Domain, Model<IQuestionDocument>> = new Map();

/**
 * Get Question model for specific domain
 */
export function getQuestionModel(domain: Domain): Model<IQuestionDocument> {
  if (!domainCollectionMap[domain]) {
    throw new Error(`Unknown domain: ${domain}`);
  }

  // Return cached model if exists
  const cachedModel = modelCache.get(domain);
  if (cachedModel) {
    return cachedModel;
  }

  // Create new model for domain
  const collectionName = domainCollectionMap[domain];
  const modelName = `Question_${domain.replace('-', '_')}`;
  
  const model = mongoose.model<IQuestionDocument>(modelName, questionSchema, collectionName);
  modelCache.set(domain, model);
  
  return model;
}

/**
 * Get questions from specific domain
 */
export async function getQuestionsByDomain(
  domain: Domain, 
  filters: IQuestionFilters = {}
): Promise<IQuestionDocument[]> {
  const QuestionModel = getQuestionModel(domain);
  return await QuestionModel.find({ isActive: true, ...filters }).exec();
}

/**
 * Get questions by difficulty from specific domain
 */
export async function getQuestionsByDifficulty(
  domain: Domain, 
  difficulty: Difficulty, 
  limit: number = 10
): Promise<IQuestionDocument[]> {
  const QuestionModel = getQuestionModel(domain);
  return await QuestionModel.find({ 
    isActive: true, 
    difficulty 
  }).limit(limit).exec();
}

/**
 * Get random questions from domain for diagnostic test
 */
export async function getDiagnosticQuestions(
  domain: Domain, 
  count: number = 10, 
  difficultyDistribution: IDifficultyDistribution = { 
    beginner: 0.5, 
    intermediate: 0.3, 
    advanced: 0.2 
  }
): Promise<IQuestionDocument[]> {
  const QuestionModel = getQuestionModel(domain);
  
  const beginnerCount = Math.ceil(count * difficultyDistribution.beginner);
  const intermediateCount = Math.ceil(count * difficultyDistribution.intermediate);
  const advancedCount = count - beginnerCount - intermediateCount;

  const [beginnerQuestions, intermediateQuestions, advancedQuestions] = await Promise.all([
    QuestionModel.aggregate([
      { $match: { isActive: true, difficulty: Difficulty.Beginner } },
      { $sample: { size: beginnerCount } }
    ]).exec(),
    QuestionModel.aggregate([
      { $match: { isActive: true, difficulty: Difficulty.Intermediate } },
      { $sample: { size: intermediateCount } }
    ]).exec(),
    QuestionModel.aggregate([
      { $match: { isActive: true, difficulty: Difficulty.Advanced } },
      { $sample: { size: advancedCount } }
    ]).exec()
  ]);

  return [...beginnerQuestions, ...intermediateQuestions, ...advancedQuestions] as IQuestionDocument[];
}

/**
 * Get all available domains
 */
export function getAvailableDomains(): Domain[] {
  return Object.values(Domain);
}

/**
 * Get collection name for domain
 */
export function getCollectionName(domain: Domain): string {
  return domainCollectionMap[domain];
}

/**
 * Get statistics for all domain collections
 */
export async function getDomainStatistics(): Promise<DomainStatistics> {
  const stats = {} as DomainStatistics;
  
  for (const domain of Object.values(Domain)) {
    try {
      const QuestionModel = getQuestionModel(domain);
      const totalCount = await QuestionModel.countDocuments({ isActive: true }).exec();
      
      const difficultyStats = await QuestionModel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } }
      ]).exec();

      stats[domain] = {
        collection: domainCollectionMap[domain],
        totalQuestions: totalCount,
        difficulties: difficultyStats.reduce((acc, stat) => {
          acc[stat._id as Difficulty] = stat.count;
          return acc;
        }, {} as { [key in Difficulty]?: number })
      };
    } catch (error) {
      stats[domain] = {
        collection: domainCollectionMap[domain],
        totalQuestions: 0,
        difficulties: {},
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  return stats;
}

/**
 * Validate if domain is supported
 */
export function isValidDomain(domain: string): domain is Domain {
  return Object.values(Domain).includes(domain as Domain);
}

/**
 * Get domain enum from string with validation
 */
export function getDomainFromString(domainString: string): Domain {
  if (!isValidDomain(domainString)) {
    throw new Error(`Invalid domain: ${domainString}. Available domains: ${Object.values(Domain).join(', ')}`);
  }
  return domainString;
}

// Export the domain collection map for external use
export { domainCollectionMap };

// Default export with all functions
export default {
  getQuestionModel,
  getQuestionsByDomain,
  getQuestionsByDifficulty,
  getDiagnosticQuestions,
  getAvailableDomains,
  getCollectionName,
  getDomainStatistics,
  isValidDomain,
  getDomainFromString,
  domainCollectionMap
};
