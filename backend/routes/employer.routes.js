const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobApplications,
  updateApplicationStatus,
  getDashboard
} = require('../controllers/employer.controller');
const { authenticateToken, isEmployer } = require('../middleware/auth.middleware');

/**
 * Employer Routes
 * Member 3 - Employer Module
 */

// All routes require authentication and employer role
router.use(authenticateToken);
router.use(isEmployer);

// ===========================================
// Dashboard
// ===========================================

// @route   GET /api/employer/dashboard
// @desc    Get employer dashboard with stats
// @access  Private (Employer)
router.get('/dashboard', getDashboard);

// ===========================================
// Profile Management
// ===========================================

// @route   GET /api/employer/profile
// @desc    Get employer profile
// @access  Private (Employer)
router.get('/profile', getProfile);

// @route   PUT /api/employer/profile
// @desc    Update employer profile
// @access  Private (Employer)
router.put('/profile', updateProfile);

// ===========================================
// Job Management
// ===========================================

// @route   POST /api/employer/jobs
// @desc    Create a new job posting
// @access  Private (Employer)
router.post('/jobs', createJob);

// @route   GET /api/employer/jobs
// @desc    Get all jobs posted by employer
// @access  Private (Employer)
router.get('/jobs', getMyJobs);

// @route   GET /api/employer/jobs/:id
// @desc    Get single job by ID
// @access  Private (Employer)
router.get('/jobs/:id', getJobById);

// @route   PUT /api/employer/jobs/:id
// @desc    Update job
// @access  Private (Employer)
router.put('/jobs/:id', updateJob);

// @route   DELETE /api/employer/jobs/:id
// @desc    Delete job
// @access  Private (Employer)
router.delete('/jobs/:id', deleteJob);

// ===========================================
// Application Management
// ===========================================

// @route   GET /api/employer/jobs/:id/applications
// @desc    Get applications for a job
// @access  Private (Employer)
router.get('/jobs/:id/applications', getJobApplications);

// @route   PUT /api/employer/applications/:id/status
// @desc    Update application status (accept/reject/shortlist)
// @access  Private (Employer)
router.put('/applications/:id/status', updateApplicationStatus);

module.exports = router;
