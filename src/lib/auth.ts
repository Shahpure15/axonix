import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from './api';
import { safeLocalStorage } from './storage';
import { User, AuthToken } from '@/types';
import { userStorage, UserData } from './userData';

/**
 * Authentication Store with Zustand
 * Now uses proper JSON file storage for user authentication
 */

interface AuthState {
  user: User | null;
  tokens: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true, // Start with true to prevent flash

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // Authenticate user with our JSON storage
          const userData = await userStorage.authenticateUser(email, password);
          
          if (!userData) {
            throw new Error('User not found. Please check your credentials or sign up.');
          }
          
          // Convert UserData to User format
          const user: User = {
            user_id: userData.id,
            email: userData.email,
            name: userData.name,
            created_at: new Date(userData.createdAt),
            last_login: userData.lastLogin ? new Date(userData.lastLogin) : new Date(),
          };
          
          // Create mock tokens for the session
          const tokens: AuthToken = {
            access_token: `token_${userData.id}_${Date.now()}`,
            refresh_token: `refresh_${userData.id}_${Date.now()}`,
            expires_in: 3600,
            token_type: 'Bearer',
          };
          
          // Store tokens in localStorage
          safeLocalStorage.setItem('access_token', tokens.access_token);
          safeLocalStorage.setItem('refresh_token', tokens.refresh_token);
          safeLocalStorage.setItem('currentUserId', userData.id);
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          // Re-throw with better error messages
          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error('Login failed. Please try again.');
          }
        }
      },

      signup: async (email: string, password: string, name?: string) => {
        set({ isLoading: true });
        try {
          // Register new user with our API
          const userData = await userStorage.registerUser(email, password, name || email.split('@')[0]);
          
          // Convert UserData to User format
          const user: User = {
            user_id: userData.id,
            email: userData.email,
            name: userData.name,
            created_at: new Date(userData.createdAt),
            last_login: new Date(),
          };
          
          // Create mock tokens for the session
          const tokens: AuthToken = {
            access_token: `token_${userData.id}_${Date.now()}`,
            refresh_token: `refresh_${userData.id}_${Date.now()}`,
            expires_in: 3600,
            token_type: 'Bearer',
          };
          
          // Store tokens in localStorage
          safeLocalStorage.setItem('access_token', tokens.access_token);
          safeLocalStorage.setItem('refresh_token', tokens.refresh_token);
          safeLocalStorage.setItem('currentUserId', userData.id);
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('✅ User registered successfully! Redirecting to onboarding...');
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          safeLocalStorage.removeItem('access_token');
          safeLocalStorage.removeItem('refresh_token');
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      refreshAuth: async () => {
        const currentUserId = safeLocalStorage.getItem('currentUserId');
        if (!currentUserId) return;

        try {
          // Get updated user data from our JSON storage
          const userData = await userStorage.getUser(currentUserId);
          
          if (!userData) {
            get().clearAuth();
            return;
          }
          
          // Convert UserData to User format
          const user: User = {
            user_id: userData.id,
            email: userData.email,
            name: userData.name,
            created_at: new Date(userData.createdAt),
            last_login: userData.lastLogin ? new Date(userData.lastLogin) : new Date(),
          };
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('✅ Auth refreshed with updated user data:', user);
        } catch (error) {
          console.error('Failed to refresh auth:', error);
          get().clearAuth();
          throw error;
        }
      },

      clearAuth: () => {
        safeLocalStorage.removeItem('access_token');
        safeLocalStorage.removeItem('refresh_token');
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Set loading to false after hydration is complete
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);

// Auth helper functions
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getStoredToken = (): string | null => {
  return safeLocalStorage.getItem('access_token');
};

export const requireAuth = () => {
  const { isAuthenticated, refreshAuth } = useAuthStore();
  
  if (!isAuthenticated) {
    const token = getStoredToken();
    if (token && !isTokenExpired(token)) {
      refreshAuth().catch(() => {
        window.location.href = '/auth/login';
      });
    } else {
      window.location.href = '/auth/login';
    }
  }
};
