// Core types - defined locally to avoid path resolution issues
export interface User {
  user_id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  preferences?: {
    domains: string[];
    experience_level: 'beginner' | 'intermediate' | 'advanced';
    preferred_study_time: string;
    timezone: string;
  };
  created_at: Date;
  last_login?: Date;
}

export interface Session {
  session_id: string;
  user_id: string;
  session_type: 'diagnostic' | 'learning' | 'practice' | 'review';
  domain: string;
  started_at: Date;
  ended_at?: Date;
  summary?: {
    questions_answered: number;
    correct_answers: number;
    hints_used: number;
    time_spent: number;
    mastery_gains: Record<string, number>;
  };
  completion_score?: number;
}

export interface Question {
  question_id: string;
  domain: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  title: string;
  body: string;
  testcases: Array<{
    input: string;
    expected_output: string;
    is_hidden: boolean;
  }>;
  hint_ladder: {
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
  };
  metadata: {
    estimated_time: number;
    mastery_concepts: string[];
    prerequisites: string[];
  };
}

export interface HintUsage {
  questionId: string;
  hintLevel: number;
  timestamp: Date;
}

export interface MasteryVector {
  concept: string;
  mastery_level: number;
  confidence: number;
  last_updated: Date;
}

export interface SRSItem {
  item_id: string;
  concept: string;
  due_date: Date;
  interval: number;
  ease_factor: number;
  repetitions: number;
}

// Frontend-specific types
export interface UserSession {
  user: User;
  tokens: any; // Will define properly later
  isAuthenticated: boolean;
}

export interface SessionState {
  currentSession: Session | null;
  currentQuestion: Question | null;
  hintsUsed: number[];
  timeStarted: number;
  isSubmitting: boolean;
}

export interface LearningProgress {
  masteryVectors: MasteryVector[];
  completedSessions: Session[];
  dueItems: SRSItem[];
  streakDays: number;
  totalHoursLearned: number;
}

export interface HintLadder {
  level1: string; // Restate + I/O examples
  level2: string; // Edge cases & constraints
  level3: string; // Data structure / pattern suggestion
  level4: string; // Pseudocode outline
  level5: string; // Unit tests to write
}

export interface CodeSubmission {
  code: string;
  language: string;
  questionId: string;
  sessionId: string;
}

export interface ScoreResult {
  verdict: 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error' | 'compilation_error';
  score: number;
  executionTime: number;
  memoryUsed: number;
  testResults: TestResult[];
  feedback?: string;
  nextHintSuggestion?: number;
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput?: string;
  expectedOutput: string;
  errorMessage?: string;
}

// User types for frontend
export interface User {
  user_id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  preferences?: UserPreferences;
  created_at: Date;
  last_login?: Date;
}

export interface UserPreferences {
  domains: string[];
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  preferred_study_time: string;
  timezone: string;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: Date;
    request_id: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
}