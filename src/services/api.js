import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('loggedInUser');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data.message);
    }
    
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data.message);
    }
    
    // Return the error with standardized format
    const apiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      data: error.response?.data || null,
    };
    
    return Promise.reject(apiError);
  }
);

export default api;