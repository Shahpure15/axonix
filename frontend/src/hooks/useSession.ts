import { create } from 'zustand';
import { sessionApi } from '@/lib/api';
import { Session, Question, HintUsage } from '@/types';

interface SessionState {
  currentSession: Session | null;
  currentQuestion: Question | null;
  hintsUsed: number[];
  timeStarted: number;
  isSubmitting: boolean;
  sessionHistory: Session[];
  
  // Actions
  startSession: (domain: string, mode: string) => Promise<void>;
  loadQuestion: (questionId: string) => Promise<void>;
  submitAnswer: (code: string, language: string) => Promise<any>;
  requestHint: (level: number) => Promise<string>;
  endSession: () => Promise<void>;
  clearSession: () => void;
  loadSessionHistory: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  currentQuestion: null,
  hintsUsed: [],
  timeStarted: 0,
  isSubmitting: false,
  sessionHistory: [],

  startSession: async (domain: string, mode: string) => {
    try {
      const session = await sessionApi.startSession({ domain, mode });
      set({
        currentSession: session,
        hintsUsed: [],
        timeStarted: Date.now(),
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  },

  loadQuestion: async (questionId: string) => {
    const { currentSession } = get();
    if (!currentSession) throw new Error('No active session');

    try {
      // This would typically be called automatically by the session service
      // when a new question is ready, but we can also manually load it
      const session = await sessionApi.getSession(currentSession.session_id);
      set({
        currentQuestion: session.currentQuestion,
        hintsUsed: [],
        timeStarted: Date.now(),
      });
    } catch (error) {
      console.error('Failed to load question:', error);
      throw error;
    }
  },

  submitAnswer: async (code: string, language: string) => {
    const { currentSession, currentQuestion } = get();
    if (!currentSession || !currentQuestion) {
      throw new Error('No active session or question');
    }

    set({ isSubmitting: true });
    try {
      const result = await sessionApi.submitAnswer(currentSession.session_id, {
        questionId: currentQuestion.question_id,
        code,
        language,
        timeSpent: Math.round((Date.now() - get().timeStarted) / 1000),
      });

      set({ isSubmitting: false });
      return result;
    } catch (error) {
      set({ isSubmitting: false });
      console.error('Failed to submit answer:', error);
      throw error;
    }
  },

  requestHint: async (level: number) => {
    const { currentSession, currentQuestion, hintsUsed } = get();
    if (!currentSession || !currentQuestion) {
      throw new Error('No active session or question');
    }

    // Check if user can request this hint level
    const maxUsedLevel = Math.max(0, ...hintsUsed);
    if (level > maxUsedLevel + 1) {
      throw new Error(`You must use hint level ${maxUsedLevel + 1} first`);
    }

    try {
      const hint = await sessionApi.requestHint(
        currentSession.session_id,
        currentQuestion.question_id,
        level
      );

      // Add this hint level to used hints
      if (!hintsUsed.includes(level)) {
        set({ hintsUsed: [...hintsUsed, level].sort() });
      }

      return hint.content;
    } catch (error) {
      console.error('Failed to request hint:', error);
      throw error;
    }
  },

  endSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return;

    try {
      await sessionApi.endSession(currentSession.session_id);
      set({
        currentSession: null,
        currentQuestion: null,
        hintsUsed: [],
        timeStarted: 0,
      });
    } catch (error) {
      console.error('Failed to end session:', error);
      throw error;
    }
  },

  clearSession: () => {
    set({
      currentSession: null,
      currentQuestion: null,
      hintsUsed: [],
      timeStarted: 0,
      isSubmitting: false,
    });
  },

  loadSessionHistory: async () => {
    try {
      const sessions = await sessionApi.getSessions({ limit: 50 });
      set({ sessionHistory: sessions });
    } catch (error) {
      console.error('Failed to load session history:', error);
      throw error;
    }
  },
}));

// Custom hook for session management
export const useSession = () => {
  const sessionStore = useSessionStore();
  
  return {
    ...sessionStore,
    isActive: !!sessionStore.currentSession,
    hasQuestion: !!sessionStore.currentQuestion,
    timeElapsed: sessionStore.timeStarted > 0 ? Date.now() - sessionStore.timeStarted : 0,
  };
};

// Hook for hint ladder management
export const useHintLadder = () => {
  const { hintsUsed, requestHint, currentQuestion } = useSessionStore();
  
  const getAvailableHintLevel = () => {
    if (hintsUsed.length === 0) return 1;
    return Math.max(...hintsUsed) + 1;
  };
  
  const canRequestHint = (level: number) => {
    const availableLevel = getAvailableHintLevel();
    return level <= availableLevel && level <= 5;
  };
  
  const getHintStatus = (level: number) => {
    if (hintsUsed.includes(level)) return 'used';
    if (canRequestHint(level)) return 'available';
    return 'locked';
  };
  
  return {
    hintsUsed,
    requestHint,
    getAvailableHintLevel,
    canRequestHint,
    getHintStatus,
    totalHintsUsed: hintsUsed.length,
    maxHintsAvailable: 5,
  };
};