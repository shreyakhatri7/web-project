/**
 * API Service
 * Centralized API calls for all modules
 * Shared by: All Team Members
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const loginPath = user?.role === 'admin' ? '/admin/login' : '/auth';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = loginPath;
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Auth API - Member 1
// ==========================================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/password', data),
};

// ==========================================
// Student API - Member 2
// ==========================================
export const studentAPI = {
  getDashboard: () => api.get('/students/dashboard'),
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  updateEducation: (data) => api.put('/students/education', data),
  updateSkills: (data) => api.put('/students/skills', data),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/students/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteResume: () => api.delete('/students/resume'),
};

// ==========================================
// Jobs API - Member 2 (Public)
// ==========================================
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  getFilters: () => api.get('/jobs/filters'),
};

// ==========================================
// Applications API - Member 2
// ==========================================
export const applicationsAPI = {
  apply: (data) => api.post('/applications', data),
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  withdraw: (id) => api.put(`/applications/${id}/withdraw`),
  getStats: () => api.get('/applications/stats'),
};

// ==========================================
// Employer API - Member 3
// ==========================================
export const employerAPI = {
  // Dashboard
  getDashboard: () => api.get('/employer/dashboard'),
  
  // Profile
  getProfile: () => api.get('/employer/profile'),
  updateProfile: (data) => api.put('/employer/profile', data),
  
  // Jobs
  createJob: (data) => api.post('/employer/jobs', data),
  getMyJobs: (params) => api.get('/employer/jobs', { params }),
  getJobById: (id) => api.get(`/employer/jobs/${id}`),
  updateJob: (id, data) => api.put(`/employer/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/employer/jobs/${id}`),
  
  // Applications
  getJobApplications: (jobId, params) => api.get(`/employer/jobs/${jobId}/applications`, { params }),
  updateApplicationStatus: (id, data) => api.put(`/employer/applications/${id}/status`, data),
};

// ==========================================
// Admin API - Member 4
// ==========================================
export const adminAPI = {
  // Dashboard & Reports
  getDashboard: () => api.get('/admin/dashboard'),
  getReports: (params) => api.get('/admin/reports', { params }),
  
  // User Management
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getAllStudents: (params) => api.get('/admin/students', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  deleteStudentRecord: (userId) => api.delete(`/admin/students/${userId}`),
  
  // Employer Management
  getAllEmployers: (params) => api.get('/admin/employers', { params }),
  verifyEmployer: (id, is_verified) => api.put(`/admin/employers/${id}/verify`, { is_verified }),
  deleteEmployerRecord: (userId) => api.delete(`/admin/employers/${userId}`),
  
  // Job Management
  getAllJobs: (params) => api.get('/admin/jobs', { params }),
  getPendingJobs: () => api.get('/admin/jobs/pending'),
  reviewJob: (id, data) => api.post(`/admin/jobs/${id}/review`, data),
  approveJob: (id, data) => api.put(`/admin/jobs/${id}/approve`, data),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  
  // Application Management
  getAllApplications: (params) => api.get('/admin/applications', { params }),
  getPendingApplications: () => api.get('/admin/applications/pending'),
  reviewApplication: (id, data) => api.post(`/admin/applications/${id}/review`, data),

  // Admin Management
  getAdmins: () => api.get('/admin/admins'),
  createAdmin: (data) => api.post('/admin/admins', data),
};

export default api;
