import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Register new user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      if (response.success) {
        setUser(response.data.user);
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message, errors: err.response?.data?.errors };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      if (response.success) {
        setUser(response.data.user);
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setError(null);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      return { success: false };
    }
  };

  // Update user in context
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
