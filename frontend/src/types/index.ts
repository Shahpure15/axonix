// Re-export shared types for frontend use
export * from '../../backend/shared/src/types';

// Frontend-specific types
export interface UserSession {
  user: User;
  tokens: AuthToken;
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