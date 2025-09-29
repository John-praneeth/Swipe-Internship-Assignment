// Integration service to connect Redux store with backend API
import { store } from '../store/store';
import { setCurrentUser } from '../store/authSlice';
import { 
  authAPI, 
  candidatesAPI, 
  questionsAPI, 
  uploadAPI,
  setAuthToken,
  clearAuthToken 
} from './apiService';

// Initialize authentication from localStorage
export const initializeAuth = async () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    setAuthToken(token);
    try {
      const response = await authAPI.getCurrentUser();
      store.dispatch(setCurrentUser(response.data));
    } catch (error) {
      console.error('Failed to get current user:', error);
      // Clear invalid token
      clearAuthToken();
      localStorage.removeItem('auth_token');
    }
  }
};

// Authentication integration
export const authIntegration = {
  login: async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      store.dispatch(setCurrentUser(response.data.user));
      return response.data.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (userData: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }) => {
    try {
      const response = await authAPI.register(userData);
      store.dispatch(setCurrentUser(response.data.user));
      return response.data.user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
      store.dispatch(setCurrentUser(null));
      clearAuthToken();
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local state anyway
      store.dispatch(setCurrentUser(null));
      clearAuthToken();
    }
  }
};

// Interview data integration
export const interviewIntegration = {
  // Create or update candidate data
  syncCandidateData: async (candidateData: any) => {
    try {
      const state = store.getState();
      const userId = state.auth.currentUser?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Check if candidate already exists
      try {
        await candidatesAPI.getCandidateById(userId);
        // Update existing candidate
        const response = await candidatesAPI.updateCandidate(userId, candidateData);
        return response.data;
      } catch (error) {
        // Create new candidate
        const response = await candidatesAPI.createCandidate({
          ...candidateData,
          userId
        });
        return response.data;
      }
    } catch (error) {
      console.error('Failed to sync candidate data:', error);
      throw error;
    }
  },

  // Save interview answers
  saveAnswer: async (questionId: string, answer: string, questionText?: string) => {
    try {
      const state = store.getState();
      const userId = state.auth.currentUser?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await candidatesAPI.addAnswer(userId, {
        questionId,
        answer,
        questionText
      });
      return response.data;
    } catch (error) {
      console.error('Failed to save answer:', error);
      throw error;
    }
  },

  // Save chat messages
  saveChatMessage: async (message: string, isAI: boolean) => {
    try {
      const state = store.getState();
      const userId = state.auth.currentUser?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await candidatesAPI.addChatMessage(userId, {
        message,
        isAI,
        timestamp: new Date()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to save chat message:', error);
      throw error;
    }
  },

  // Get interview questions
  getQuestions: async () => {
    try {
      const response = await questionsAPI.getAllQuestions();
      return response.data;
    } catch (error) {
      console.error('Failed to get questions:', error);
      throw error;
    }
  },

  // Upload resume
  uploadResume: async (file: File) => {
    try {
      const response = await uploadAPI.uploadResume(file);
      
      // Update candidate data with resume info
      await interviewIntegration.syncCandidateData({
        resumeFilename: response.data.filename,
        resumeOriginalName: file.name
      });

      return response.data;
    } catch (error) {
      console.error('Failed to upload resume:', error);
      throw error;
    }
  },

  // Get all candidates (for interviewers)
  getAllCandidates: async () => {
    try {
      const response = await candidatesAPI.getAllCandidates();
      return response.data;
    } catch (error) {
      console.error('Failed to get candidates:', error);
      throw error;
    }
  },

  // Get candidate details (for interviewers)
  getCandidateDetails: async (candidateId: string) => {
    try {
      const response = await candidatesAPI.getCandidateById(candidateId);
      return response.data;
    } catch (error) {
      console.error('Failed to get candidate details:', error);
      throw error;
    }
  }
};

// Helper function to check backend connectivity
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:5001/health');
    return response.ok;
  } catch (error) {
    console.warn('Backend not available, falling back to localStorage:', error);
    return false;
  }
};

// Hybrid storage: Use backend if available, fallback to localStorage
export const hybridStorage = {
  isBackendAvailable: false,

  async initialize() {
    this.isBackendAvailable = await checkBackendConnection();
    if (this.isBackendAvailable) {
      console.log('✅ Backend connected - using database storage');
      await initializeAuth();
    } else {
      console.log('⚠️ Backend offline - using localStorage');
    }
  },

  async saveInterviewData(key: string, data: any) {
    if (this.isBackendAvailable) {
      // Use backend API
      switch (key) {
        case 'candidateData':
          return await interviewIntegration.syncCandidateData(data);
        default:
          localStorage.setItem(key, JSON.stringify(data));
      }
    } else {
      // Fallback to localStorage
      localStorage.setItem(key, JSON.stringify(data));
    }
  },

  getInterviewData(key: string) {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }
};

export default hybridStorage;
