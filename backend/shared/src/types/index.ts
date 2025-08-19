import { z } from 'zod';

// User Types
export const UserSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar_url: z.string().optional(),
  preferences: z.object({
    domains: z.array(z.string()),
    experience_level: z.enum(['beginner', 'intermediate', 'advanced']),
    preferred_study_time: z.string(),
    timezone: z.string(),
  }).optional(),
  created_at: z.date(),
  last_login: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Session Types
export const SessionSchema = z.object({
  session_id: z.string(),
  user_id: z.string(),
  session_type: z.enum(['diagnostic', 'learning', 'practice', 'review']),
  domain: z.string(),
  started_at: z.date(),
  ended_at: z.date().optional(),
  summary: z.object({
    questions_answered: z.number(),
    correct_answers: z.number(),
    hints_used: z.number(),
    time_spent: z.number(),
    mastery_gains: z.record(z.number()),
  }).optional(),
  completion_score: z.number().optional(),
});

export type Session = z.infer<typeof SessionSchema>;

// Question Types
export const QuestionSchema = z.object({
  question_id: z.string(),
  domain: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()),
  title: z.string(),
  body: z.string(),
  testcases: z.array(z.object({
    input: z.string(),
    expected_output: z.string(),
    is_hidden: z.boolean().default(false),
  })),
  canonical_solution: z.string(),
  time_limit_seconds: z.number().default(300),
  memory_limit_mb: z.number().default(128),
  hints: z.array(z.object({
    level: z.number().min(1).max(5),
    content: z.string(),
    type: z.enum(['restate', 'edge_cases', 'data_structure', 'pseudocode', 'unit_tests']),
  })),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Question = z.infer<typeof QuestionSchema>;

// Answer Types
export const AnswerSchema = z.object({
  answer_id: z.string(),
  session_id: z.string(),
  question_id: z.string(),
  user_id: z.string(),
  code: z.string(),
  language: z.string(),
  submitted_at: z.date(),
  score: z.number(),
  verdict: z.enum(['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error']),
  execution_time: z.number(),
  memory_used: z.number(),
  test_results: z.array(z.object({
    test_case_id: z.string(),
    passed: z.boolean(),
    actual_output: z.string().optional(),
    error_message: z.string().optional(),
  })),
});

export type Answer = z.infer<typeof AnswerSchema>;

// SRS Types
export const SRSItemSchema = z.object({
  srs_id: z.string(),
  user_id: z.string(),
  question_id: z.string(),
  repetitions: z.number().default(0),
  ease_factor: z.number().default(2.5),
  interval_days: z.number().default(1),
  next_review_date: z.date(),
  quality_history: z.array(z.object({
    quality: z.number().min(0).max(5),
    reviewed_at: z.date(),
    hints_used: z.number(),
    time_taken: z.number(),
  })),
  created_at: z.date(),
  updated_at: z.date(),
});

export type SRSItem = z.infer<typeof SRSItemSchema>;

// Hint Usage Types
export const HintUsageSchema = z.object({
  usage_id: z.string(),
  user_id: z.string(),
  session_id: z.string(),
  question_id: z.string(),
  hint_level: z.number().min(1).max(5),
  timestamp: z.date(),
});

export type HintUsage = z.infer<typeof HintUsageSchema>;

// Mastery Vector Types
export const MasteryVectorSchema = z.object({
  user_id: z.string(),
  topic: z.string(),
  score: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  last_updated: z.date(),
  history: z.array(z.object({
    score: z.number(),
    timestamp: z.date(),
    source: z.enum(['diagnostic', 'practice', 'review']),
  })),
});

export type MasteryVector = z.infer<typeof MasteryVectorSchema>;

// Complex Moment Types
export const ComplexMomentSchema = z.object({
  moment_id: z.string(),
  user_id: z.string(),
  session_id: z.string(),
  question_id: z.string().optional(),
  description: z.string(),
  tags: z.array(z.string()),
  resolved: z.boolean().default(false),
  resolution_notes: z.string().optional(),
  created_at: z.date(),
  resolved_at: z.date().optional(),
});

export type ComplexMoment = z.infer<typeof ComplexMomentSchema>;

// API Response Types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
  meta: z.object({
    timestamp: z.date(),
    request_id: z.string(),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      total_pages: z.number(),
    }).optional(),
  }).optional(),
});

export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & { data?: T };

// Auth Types
export const AuthTokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  token_type: z.string().default('Bearer'),
});

export type AuthToken = z.infer<typeof AuthTokenSchema>;