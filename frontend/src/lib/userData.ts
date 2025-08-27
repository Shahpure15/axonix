// Utility functions for managing user data via API routes
// This makes HTTP requests to our API endpoints that handle JSON file operations

export interface UserData {
  id: string;
  email: string;
  password: string; // Store hashed password in real app, plain for demo
  name: string;
  onboardingCompleted: boolean;
  onboarding_status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
  lastLogin?: string;
}

export interface UsersDatabase {
  users: UserData[];
}

export const userStorage = {
  // Register a new user
  registerUser: async (email: string, password: string, name: string): Promise<UserData> => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      console.log('User registered successfully:', data.user);
      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Save onboarding data - SAME TO SAME like signup
  saveOnboardingData: async (userId: string, email: string, name: string, domains: string[], experience_level: string, preferred_study_time: string, timezone: string): Promise<any> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          userId, 
          domains, 
          experience_level, 
          preferred_study_time, 
          timezone 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Onboarding save failed');
      }

      console.log('✅ Onboarding data saved successfully to MongoDB:', data);
      return data;
    } catch (error) {
      console.error('❌ Onboarding save error:', error);
      throw error;
    }
  },

  // Save diagnostic test data - SAME TO SAME like signup  
  saveDiagnosticTest: async (userId: string, email: string, domainId: string, domainName: string, completed: boolean, score?: number): Promise<any> => {
    try {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          email, 
          domainId, 
          domainName, 
          completed, 
          score 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Diagnostic test save failed');
      }

      console.log('✅ Diagnostic test data saved successfully to diagnostic_tests.json:', data);
      return data;
    } catch (error) {
      console.error('❌ Diagnostic test save error:', error);
      throw error;
    }
  },

  // Update user onboarding status - MongoDB backend handles this automatically
  updateUserOnboardingStatus: async (userId: string): Promise<any> => {
    try {
      // MongoDB backend already updates onboardingCompleted when saving onboarding data
      console.log('✅ User onboarding status updated in MongoDB (handled by backend)');
      return { success: true, message: 'Onboarding status updated' };
    } catch (error) {
      console.error('❌ Failed to update onboarding status:', error);
      throw error;
    }
  },

  // Get onboarding data for prefilling - SAME TO SAME like signup
  getOnboardingData: async (userId: string): Promise<any> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/api/onboarding`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No onboarding data found
        }
        throw new Error('Failed to get onboarding data');
      }

      const data = await response.json();
      console.log('✅ Onboarding data fetched for prefill:', data.data);
      return data.data;
    } catch (error) {
      console.error('❌ Failed to get onboarding data:', error);
      return null;
    }
  },

  // Authenticate user login
  authenticateUser: async (email: string, password: string): Promise<UserData | null> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          return null; // Invalid credentials
        }
        throw new Error(data.error || 'Login failed');
      }

      console.log('User authenticated successfully:', data.user);
      return data.user;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  },

  // Update user data after onboarding
  updateUserOnboarding: async (userId: string, onboardingData: {
    domains: string[];
    experience_level: string;
    preferred_study_time: string;
    timezone: string;
  }): Promise<UserData | null> => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, onboardingData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Onboarding update failed');
      }

      console.log('User onboarding updated successfully:', data.user);
      return data.user;
    } catch (error) {
      console.error('Onboarding update error:', error);
      throw error;
    }
  },

  // Get user by ID
  getUser: async (userId: string): Promise<UserData | null> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  // Get current user (from localStorage currentUserId)
  getCurrentUser: async (): Promise<UserData | null> => {
    if (typeof window === 'undefined') return null; // SSR check
    
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) return null;
    
    return await userStorage.getUser(currentUserId);
  },

  // Update diagnostic test status
  updateDiagnosticTest: async (userId: string, domainId: string, completed: boolean, score?: number): Promise<void> => {
    try {
      const response = await fetch('/api/diagnostic-test', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, domainId, completed, score }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Diagnostic test update failed');
      }

      console.log(`✅ Diagnostic test updated for user ${userId}, domain ${domainId}, completed: ${completed}`);
    } catch (error) {
      console.error('Diagnostic test update error:', error);
      throw error;
    }
  },

  // Get pending diagnostic tests for a user
  getPendingDiagnosticTests: async (userId: string): Promise<string[]> => {
    try {
      const response = await fetch(`/api/diagnostic?userId=${userId}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      const pendingTests = data.data.filter((test: any) => !test.completed);
      return pendingTests.map((test: any) => test.domainId);
    } catch (error) {
      console.error('Get pending tests error:', error);
      return [];
    }
  }
};

// Domain information
export const DOMAINS = [
  {
    id: 'cpp',
    name: 'C++ & Data Structures',
    description: 'Arrays, linked lists, trees, algorithms'
  },
  {
    id: 'system-design',
    name: 'System Design',
    description: 'Scalability, architecture, distributed systems'
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    description: 'Security principles, vulnerabilities, best practices'
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'CI/CD, containers, infrastructure as code'
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    description: 'Frontend/backend, APIs, databases'
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Development',
    description: 'iOS, Android, cross-platform development'
  }
];

export const getDomainById = (id: string) => DOMAINS.find(domain => domain.id === id);
