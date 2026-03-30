import api from './api';

// Authentication Services
export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// User Services
export const userService = {
  // Get all users (Admin only)
  getAllUsers: async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    if (response.data.success) {
      // Update stored user if updating own profile
      const storedUser = authService.getStoredUser();
      if (storedUser && storedUser.id === userId) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
    }
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Update user status (Admin only)
  updateUserStatus: async (userId, status) => {
    const response = await api.patch(`/users/${userId}/status`, { status });
    return response.data;
  },
};

export default {
  auth: authService,
  user: userService,
};
