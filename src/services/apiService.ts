// API Service for connecting frontend to backend
const API_BASE_URL = 'http://localhost:5001/api';

// JWT token management
let authToken: string | null = localStorage.getItem('auth_token');

// HTTP client with token handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (authToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${authToken}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        // Handle specific HTTP status codes
        const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
        
        if (response.status === 401) {
          // Token expired or invalid - clear auth
          authToken = null;
          localStorage.removeItem('auth_token');
          throw new Error('Authentication expired. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Insufficient permissions.');
        } else if (response.status === 404) {
          throw new Error('Resource not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      
      // Network error handling
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
      
      throw error;
    }
  }

  // GET request
  async get(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint: string, data?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put(endpoint: string, data?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // File upload request
  async uploadFile(endpoint: string, formData: FormData): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      method: 'POST',
      body: formData,
      headers: {},
    };

    // Add authorization header if token exists
    if (authToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${authToken}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`File upload failed: ${endpoint}`, error);
      throw error;
    }
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      authToken = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
    }
    return response;
  },

  register: async (userData: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.data.token) {
      authToken = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
    }
    return response;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    authToken = null;
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },
};

// Users API
export const usersAPI = {
  getAllUsers: async () => {
    return apiClient.get('/users');
  },

  createUser: async (userData: any) => {
    return apiClient.post('/users', userData);
  },

  updateUser: async (id: string, userData: any) => {
    return apiClient.put(`/users/${id}`, userData);
  },

  deleteUser: async (id: string) => {
    return apiClient.delete(`/users/${id}`);
  },
};

// Candidates API
export const candidatesAPI = {
  getAllCandidates: async () => {
    return apiClient.get('/candidates');
  },

  createCandidate: async (candidateData: any) => {
    return apiClient.post('/candidates', candidateData);
  },

  getCandidateById: async (id: string) => {
    return apiClient.get(`/candidates/${id}`);
  },

  updateCandidate: async (id: string, candidateData: any) => {
    return apiClient.put(`/candidates/${id}`, candidateData);
  },

  deleteCandidate: async (id: string) => {
    return apiClient.delete(`/candidates/${id}`);
  },

  addAnswer: async (candidateId: string, answerData: any) => {
    return apiClient.post(`/candidates/${candidateId}/answers`, answerData);
  },

  addChatMessage: async (candidateId: string, messageData: any) => {
    return apiClient.post(`/candidates/${candidateId}/messages`, messageData);
  },
};

// Questions API
export const questionsAPI = {
  getAllQuestions: async () => {
    return apiClient.get('/questions');
  },

  createQuestion: async (questionData: any) => {
    return apiClient.post('/questions', questionData);
  },

  updateQuestion: async (id: string, questionData: any) => {
    return apiClient.put(`/questions/${id}`, questionData);
  },

  deleteQuestion: async (id: string) => {
    return apiClient.delete(`/questions/${id}`);
  },
};

// File Upload API
export const uploadAPI = {
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return apiClient.uploadFile('/upload/resume', formData);
  },

  deleteFile: async (filename: string) => {
    return apiClient.delete(`/upload/${filename}`);
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return fetch(`http://localhost:5001/health`).then(res => res.json());
  },
};

// Set auth token (for when user logs in)
export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('auth_token', token);
};

// Clear auth token (for when user logs out)
export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('auth_token');
};

export default apiClient;
