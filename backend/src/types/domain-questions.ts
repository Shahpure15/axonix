/**
 * TypeScript definitions for SocraticWingman Domain Question System
 */

import { Document, Schema } from 'mongoose';
import { Request } from 'express';

// Domain enum
export enum Domain {
  MachineLearning = 'machine-learning',
  DataScience = 'data-science',
  WebDevelopment = 'web-development',
  MobileDevelopment = 'mobile-development',
  DevOps = 'devops',
  Cybersecurity = 'cybersecurity',
  Blockchain = 'blockchain',
  GameDevelopment = 'game-development',
  UIUXDesign = 'ui-ux-design',
  CloudComputing = 'cloud-computing'
}

// Question types
export enum QuestionType {
  MultipleChoice = 'multiple-choice',
  TrueFalse = 'true-false',
  ShortAnswer = 'short-answer',
  Coding = 'coding'
}

// Difficulty levels
export enum Difficulty {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced'
}

// Question option interface
export interface IQuestionOption {
  text: string;
  isCorrect: boolean;
}

// Base question interface
export interface IQuestion {
  questionText: string;
  questionType: QuestionType;
  options?: IQuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: Difficulty;
  domains: Domain[];
  tags: string[];
  points: number;
  isActive: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Question document interface (extends Mongoose Document)
export interface IQuestionDocument extends IQuestion, Document {
  _id: Schema.Types.ObjectId;
  formattedQuestion: {
    id: Schema.Types.ObjectId;
    question: string;
    type: QuestionType;
    options?: IQuestionOption[];
    difficulty: Difficulty;
    domains: Domain[];
    points: number;
  };
}

// Domain collection mapping type
export type DomainCollectionMap = {
  [key in Domain]: string;
};

// Question query filters
export interface IQuestionFilters {
  difficulty?: Difficulty;
  isActive?: boolean;
  tags?: string[];
  points?: number;
  [key: string]: any;
}

// Difficulty distribution for diagnostic tests
export interface IDifficultyDistribution {
  beginner: number;
  intermediate: number;
  advanced: number;
}

// Domain statistics interface
export interface IDomainStats {
  collection: string;
  totalQuestions: number;
  difficulties: {
    [key in Difficulty]?: number;
  };
  error?: string;
}

// Complete domain statistics
export type DomainStatistics = {
  [key in Domain]: IDomainStats;
};

// Test session question interface
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

// Test session interface
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

// Test session document interface
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

// API Response types
export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface IDiagnosticTestResponse extends IApiResponse {
  data: {
    questions: IQuestion[];
    totalQuestions: number;
    domain: Domain;
    timeLimit?: number;
  };
}

export interface IDomainsResponse extends IApiResponse {
  data: {
    domains: Domain[];
    count: number;
  };
}

// Function type definitions
export type GetQuestionModelFunction = (domain: Domain) => any;
export type GetQuestionsByDomainFunction = (domain: Domain, filters?: IQuestionFilters) => Promise<IQuestionDocument[]>;
export type GetQuestionsByDifficultyFunction = (domain: Domain, difficulty: Difficulty, limit?: number) => Promise<IQuestionDocument[]>;
export type GetDiagnosticQuestionsFunction = (domain: Domain, count?: number, distribution?: IDifficultyDistribution) => Promise<IQuestionDocument[]>;
export type GetDomainStatisticsFunction = () => Promise<DomainStatistics>;

// Environment variable types
export interface IEnvironmentConfig {
  MONGODB_URI: string;
  QUESTIONS_ML_COLLECTION: string;
  QUESTIONS_DS_COLLECTION: string;
  QUESTIONS_WEB_COLLECTION: string;
  QUESTIONS_MOBILE_COLLECTION: string;
  QUESTIONS_DEVOPS_COLLECTION: string;
  QUESTIONS_SECURITY_COLLECTION: string;
  QUESTIONS_BLOCKCHAIN_COLLECTION: string;
  QUESTIONS_GAME_COLLECTION: string;
  QUESTIONS_UIUX_COLLECTION: string;
  QUESTIONS_CLOUD_COLLECTION: string;
  USERS_COLLECTION: string;
  TESTSESSIONS_COLLECTION: string;
  LEARNINGPROGRESS_COLLECTION: string;
  JWT_SECRET: string;
  PORT: string;
  NODE_ENV: string;
}

// Request/Response types for Express
export interface IAuthenticatedRequest extends Request {
  user: {
    _id: string;
    email: string;
    name: string;
  };
}

export interface IDiagnosticTestRequest extends IAuthenticatedRequest {
  params: {
    domain: Domain;
  };
  query: {
    limit?: string;
  };
}

export interface IDomainsRequest extends IAuthenticatedRequest {}

// Export all types as a namespace for easier importing
export namespace SocraticWingman {
  export type Question = IQuestion;
  export type QuestionDocument = IQuestionDocument;
  export type QuestionOption = IQuestionOption;
  export type QuestionFilters = IQuestionFilters;
  export type TestSession = ITestSession;
  export type TestSessionDocument = ITestSessionDocument;
  export type TestSessionQuestion = ITestSessionQuestion;
  export type DomainStats = IDomainStats;
  export type ApiResponse<T = any> = IApiResponse<T>;
  export type DiagnosticTestResponse = IDiagnosticTestResponse;
  export type DomainsResponse = IDomainsResponse;
  export type EnvironmentConfig = IEnvironmentConfig;
  export type AuthenticatedRequest = IAuthenticatedRequest;
}
