import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeLocalStorage } from './storage';
import { User, AuthToken } from '@/types';

/**
 * Authentication Store with Zustand
 * Connects directly to backend API at http://localhost:5000
 */

const API_BASE_URL = 'http://localhost:5000';

interface AuthState {
  user: User | null;
  tokens: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
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
        // Don't set global loading during login attempts - let the form handle its own loading state
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

          if (!data.success) {
            throw new Error(data.message || 'Login failed');
          }

          // Store JWT token in localStorage
          safeLocalStorage.setItem('access_token', data.token);
          
          // Store user ID for backward compatibility with file storage  
          safeLocalStorage.setItem('currentUserId', data.user._id || data.user.userId);

          // Create user object from response
          const user: User = {
            user_id: data.user.id || data.user._id || data.user.userId,
            email: data.user.email,
            name: data.user.name || data.user.email.split('@')[0],
            created_at: new Date(),
            last_login: new Date(),
          };

          // Create tokens object
          const tokens: AuthToken = {
            access_token: data.token,
            refresh_token: '', // Backend doesn't provide refresh token yet
            expires_in: 3600,
            token_type: 'Bearer',
          };

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Don't set global loading false on login error - form handles this
          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error('Login failed. Please try again.');
          }
        }
      },

      signup: async (email: string, password: string, name: string) => {
        // Don't set global loading during signup attempts - let the form handle its own loading state
        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
          }

          if (!data.success) {
            throw new Error(data.message || 'Registration failed');
          }

          // Store JWT token in localStorage
          safeLocalStorage.setItem('access_token', data.token);
          
          // Store user ID for backward compatibility with file storage
          safeLocalStorage.setItem('currentUserId', data.user.id || data.user._id || data.user.userId);

          // Create user object from response
          const user: User = {
            user_id: data.user.id || data.user._id || data.user.userId,
            email: data.user.email,
            name: data.user.name || name || data.user.email.split('@')[0],
            created_at: new Date(),
            last_login: new Date(),
          };

          // Create tokens object
          const tokens: AuthToken = {
            access_token: data.token,
            refresh_token: '', // Backend doesn't provide refresh token yet
            expires_in: 3600,
            token_type: 'Bearer',
          };

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('✅ User registered successfully! Auth state set:', {
            userId: user.user_id,
            email: user.email,
            isAuthenticated: true
          });
        } catch (error) {
          // Don't set global loading false on signup error - form handles this
          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error('Registration failed. Please try again.');
          }
        }
      },

      logout: () => {
        console.log('🔄 Logout called, clearing auth state...');
        
        // Clear localStorage
        safeLocalStorage.removeItem('access_token');
        safeLocalStorage.removeItem('currentUserId');
        
        // Clear Zustand state
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        console.log('✅ Auth state cleared successfully');
      },

      refreshAuth: async () => {
        const token = safeLocalStorage.getItem('access_token');
        
        if (!token) {
          get().logout();
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            // Token is invalid, logout
            get().logout();
            return;
          }

          const data = await response.json();

          if (!data.success) {
            get().logout();
            return;
          }

          // Update user state with fresh data from backend
          const user: User = {
            user_id: data.user.id || data.user._id || data.user.userId,
            email: data.user.email,
            name: data.user.name || data.user.email.split('@')[0],
            created_at: new Date(data.user.createdAt || Date.now()),
            last_login: new Date(),
          };

          // Store user ID for backward compatibility with file storage
          safeLocalStorage.setItem('currentUserId', user.user_id);

          const tokens: AuthToken = {
            access_token: token,
            refresh_token: '',
            expires_in: 3600,
            token_type: 'Bearer',
          };

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('✅ Auth refreshed with updated user data:', user);
        } catch (error) {
          console.error('Failed to refresh auth:', error);
          get().logout();
        }
      },

      clearAuth: () => {
        safeLocalStorage.removeItem('access_token');
        safeLocalStorage.removeItem('currentUserId');
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
          
          // If user appears to be authenticated but we have a token, refresh auth
          const token = safeLocalStorage.getItem('access_token');
          if (token && state.isAuthenticated) {
            // Refresh auth in the background to validate token
            setTimeout(() => {
              const { refreshAuth } = useAuthStore.getState();
              refreshAuth().catch(() => {
                // Token is invalid, user will be logged out
                console.log('Token validation failed during rehydration');
              });
            }, 100);
          }
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
