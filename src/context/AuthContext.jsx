import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/index.js';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = localStorage.getItem(AUTH_USER_KEY);

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?._id) {
            setUser(parsedUser);
          }
        } catch (parseError) {
          console.warn('Failed to parse stored auth user, clearing cache.');
          localStorage.removeItem(AUTH_USER_KEY);
        }
      }

      if (token) {
        // Verify token is still valid by fetching user profile
        const response = await authService.getProfile();
        if (response.success) {
          setUser(response.data.user);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user));
        } else {
          // Token is invalid, clear it
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      if (error?.status === 401) {
        clearAuthData();
      } else {
        // Keep existing session data so user isn't forced out on transient errors
        setError(error?.message || 'Unable to verify session. Some data may be stale.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('loggedInUser'); // Remove old localStorage data
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    setError(null);
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      if (response.success) {
        const { token, user: userData } = response.data;
        
        // Store token
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        setUser(userData);
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      if (response.success) {
        const { token, user: newUser } = response.data;
        
        // Store token
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
        setUser(newUser);
        
        return { success: true, user: newUser };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout (if user is authenticated)
      if (user) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if backend call fails
    } finally {
      clearAuthData();
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.updateProfile(updates);
      
      if (response.success) {
  setUser(response.data.user);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.changePassword(passwordData);
      
      if (response.success) {
        return { success: true };
      } else {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Password change failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;