import axios, { AxiosResponse } from 'axios';
import { ApiResponse, AuthToken } from '@/types';
import { safeLocalStorage } from './storage';

import { API_BASE_URL } from './env';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = safeLocalStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token, refresh_token: newRefreshToken } = response.data.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return axios.request(error.config);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'API request failed');
  }
  return response.data.data as T;
};

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<{ user: any; tokens: AuthToken }> => {
    const response = await apiClient.post('/auth/login', { email, password });
    return handleApiResponse(response);
  },

  signup: async (email: string, password: string, name?: string): Promise<{ user: any; tokens: AuthToken }> => {
    const response = await apiClient.post('/auth/register', { email, password, name });
    return handleApiResponse(response);
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  refreshToken: async (refreshToken: string): Promise<AuthToken> => {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    return handleApiResponse(response);
  },

  me: async (): Promise<any> => {
    const response = await apiClient.get('/auth/me');
    return handleApiResponse(response);
  },
};

// User API
export const userApi = {
  getProfile: async (): Promise<any> => {
    const response = await apiClient.get('/users/me');
    return handleApiResponse(response);
  },

  updateProfile: async (data: any): Promise<any> => {
    const response = await apiClient.put('/users/me', data);
    return handleApiResponse(response);
  },

  updatePreferences: async (preferences: any): Promise<any> => {
    const response = await apiClient.put('/users/me/preferences', preferences);
    return handleApiResponse(response);
  },
};

// Session API
export const sessionApi = {
  startSession: async (data: { domain: string; mode: string }): Promise<any> => {
    const response = await apiClient.post('/session/start', data);
    return handleApiResponse(response);
  },

  getSession: async (sessionId: string): Promise<any> => {
    const response = await apiClient.get(`/session/${sessionId}`);
    return handleApiResponse(response);
  },

  submitAnswer: async (sessionId: string, data: any): Promise<any> => {
    const response = await apiClient.post(`/session/${sessionId}/answer`, data);
    return handleApiResponse(response);
  },

  requestHint: async (sessionId: string, questionId: string, level: number): Promise<any> => {
    const response = await apiClient.post(`/session/${sessionId}/hint`, { questionId, level });
    return handleApiResponse(response);
  },

  endSession: async (sessionId: string): Promise<any> => {
    const response = await apiClient.post(`/session/${sessionId}/end`);
    return handleApiResponse(response);
  },

  getSessions: async (params?: any): Promise<any> => {
    const response = await apiClient.get('/session', { params });
    return handleApiResponse(response);
  },
};

// SRS API
export const srsApi = {
  getDueItems: async (): Promise<any> => {
    const response = await apiClient.get('/srs/due');
    return handleApiResponse(response);
  },

  gradeItem: async (srsId: string, quality: number, timeSpent: number): Promise<any> => {
    const response = await apiClient.post('/srs/grade', { srs_id: srsId, quality, time_spent: timeSpent });
    return handleApiResponse(response);
  },

  getSchedule: async (): Promise<any> => {
    const response = await apiClient.get('/srs/schedule');
    return handleApiResponse(response);
  },
};

// Content API
export const contentApi = {
  getQuestions: async (params?: any): Promise<any> => {
    const response = await apiClient.get('/content/questions', { params });
    return handleApiResponse(response);
  },

  getQuestion: async (questionId: string): Promise<any> => {
    const response = await apiClient.get(`/content/questions/${questionId}`);
    return handleApiResponse(response);
  },

  getLessons: async (params?: any): Promise<any> => {
    const response = await apiClient.get('/content/lessons', { params });
    return handleApiResponse(response);
  },
};

// Analytics API
export const analyticsApi = {
  getProgress: async (): Promise<any> => {
    const response = await apiClient.get('/analytics/progress');
    return handleApiResponse(response);
  },

  getMasteryVectors: async (): Promise<any> => {
    const response = await apiClient.get('/analytics/mastery');
    return handleApiResponse(response);
  },

  getSessionStats: async (params?: any): Promise<any> => {
    const response = await apiClient.get('/analytics/sessions', { params });
    return handleApiResponse(response);
  },
};

// Dashboard API
export const dashboardApi = {
  getDashboardData: async (): Promise<any> => {
    const response = await apiClient.get('/api/dashboard');
    return handleApiResponse(response);
  },

  startDiagnosticTest: async (domain: string): Promise<any> => {
    const response = await apiClient.post('/api/dashboard/diagnostic-test/start', { domain });
    return handleApiResponse(response);
  },

  completeDiagnosticTest: async (sessionId: string, score: number, percentage: number, totalTimeSpent: number): Promise<any> => {
    const response = await apiClient.post('/api/dashboard/diagnostic-test/complete', {
      sessionId,
      score,
      percentage,
      totalTimeSpent
    });
    return handleApiResponse(response);
  },
};

// Admin API
export const adminApi = {
  getSessions: async (params?: any): Promise<any> => {
    const response = await apiClient.get('/admin/sessions', { params });
    return handleApiResponse(response);
  },

  getUsers: async (params?: any): Promise<any> => {
    const response = await apiClient.get('/admin/users', { params });
    return handleApiResponse(response);
  },

  createQuestion: async (data: any): Promise<any> => {
    const response = await apiClient.post('/admin/questions', data);
    return handleApiResponse(response);
  },

  updateQuestion: async (questionId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/admin/questions/${questionId}`, data);
    return handleApiResponse(response);
  },
};

export default apiClient;