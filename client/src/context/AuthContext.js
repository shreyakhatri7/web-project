/**
 * Auth Context
 * Centralized authentication state management
 * Supports: student, employer, admin roles
 * Shared by: All Team Members
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getMe();
        setUser(response.data.user);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      await authAPI.updatePassword({ currentPassword, newPassword });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Password update failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Helper functions for role checking
  const isStudent = () => user?.role === 'student';
  const isEmployer = () => user?.role === 'employer';
  const isAdmin = () => user?.role === 'admin';

  // Get dashboard path based on role
  const getDashboardPath = () => {
    if (!user) return '/auth';
    switch (user.role) {
      case 'student':
        return '/dashboard';
      case 'employer':
        return '/employer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  // Backward compatibility: expose student for existing components
  const student = user?.role === 'student' ? user : null;

  const value = {
    // New unified API
    user,
    setUser,
    loading,
    error,
    login,
    register,
    logout,
    updatePassword,
    isAuthenticated: !!user,
    isStudent,
    isEmployer,
    isAdmin,
    getDashboardPath,
    // Backward compatibility
    student,
    setStudent: setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
