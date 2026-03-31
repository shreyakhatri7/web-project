/**
 * Auth Context
 * Centralized authentication state management
 * Supports: student, employer, admin roles
 * Shared by: All Team Members
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const clearStoredAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('employerToken');
    localStorage.removeItem('employerData');
  }, []);

  const readStoredUser = useCallback(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser);
    } catch (parseError) {
      localStorage.removeItem('user');
      return null;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const cachedUser = readStoredUser();
    if (cachedUser) {
      setUser(cachedUser);
    }

    try {
      const response = await authAPI.getMe();
      const currentUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(currentUser));
      setUser(currentUser);
      window.dispatchEvent(new Event('auth-change'));
    } catch (err) {
      clearStoredAuth();
      setUser(null);
    }

    setLoading(false);
  }, [clearStoredAuth, readStoredUser]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const syncAuthFromStorage = () => {
      setUser(readStoredUser());
    };

    window.addEventListener('storage', syncAuthFromStorage);
    window.addEventListener('auth-change', syncAuthFromStorage);

    return () => {
      window.removeEventListener('storage', syncAuthFromStorage);
      window.removeEventListener('auth-change', syncAuthFromStorage);
    };
  }, [readStoredUser]);

  const login = async (emailOrPayload, password, expectedRole) => {
    try {
      setError(null);

      const payload =
        typeof emailOrPayload === 'object' && emailOrPayload !== null
          ? { ...emailOrPayload }
          : { email: emailOrPayload, password };

      if (expectedRole) {
        payload.expectedRole = expectedRole;
      }

      const response = expectedRole === 'admin'
        ? await authAPI.adminLogin(payload)
        : await authAPI.login(payload);

      const { token, user: userData, redirectPath } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData?.role === 'employer') {
        localStorage.setItem('employerToken', token);
      }
      setUser(userData);
      window.dispatchEvent(new Event('auth-change'));
      return { success: true, user: userData, redirectPath };
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
      if (newUser?.role === 'employer') {
        localStorage.setItem('employerToken', token);
      }
      setUser(newUser);
      window.dispatchEvent(new Event('auth-change'));
      return { success: true, user: newUser };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
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
