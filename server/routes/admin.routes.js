const express = require('express');
const router = express.Router();
const {
  // User management
  getAllUsers,
  getAllStudents,
  getUserById,
  updateUserStatus,
  deleteUser,
  deleteStudentRecord,
  // Employer management
  getAllEmployers,
  verifyEmployer,
  deleteEmployerRecord,
  // Job management
  getAllJobs,
  getPendingJobReviews,
  reviewJobPosting,
  approveJob,
  deleteJob,
  // Application management
  getAllApplications,
  getPendingApplicationReviews,
  reviewApplication,
  // Admin management
  getAllAdmins,
  createAdmin,
  // Reports
  getDashboard,
  getReports
} = require('../controllers/admin.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

/**
 * Admin Routes
 * Member 4 - Admin Panel + System Integration
 */

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

// ===========================================
// Dashboard & Reports
// ===========================================

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard with statistics
// @access  Private (Admin)
router.get('/dashboard', getDashboard);

// @route   GET /api/admin/reports
// @desc    Get detailed reports
// @access  Private (Admin)
router.get('/reports', getReports);

// ===========================================
// User Management
// ===========================================

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private (Admin)
router.get('/users', getAllUsers);

// @route   GET /api/admin/students
// @desc    Get all students
// @access  Private (Admin)
router.get('/students', getAllStudents);

// @route   DELETE /api/admin/students/:userId
// @desc    Delete student record and all related data
// @access  Private (Admin)
router.delete('/students/:userId', deleteStudentRecord);

// @route   GET /api/admin/users/:id
// @desc    Get user by ID with full profile
// @access  Private (Admin)
router.get('/users/:id', getUserById);

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (block/unblock/activate)
// @access  Private (Admin)
router.put('/users/:id/status', updateUserStatus);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/users/:id', deleteUser);

// ===========================================
// Employer Management
// ===========================================

// @route   GET /api/admin/employers
// @desc    Get all employers with verification status
// @access  Private (Admin)
router.get('/employers', getAllEmployers);

// @route   PUT /api/admin/employers/:id/verify
// @desc    Verify/Unverify employer
// @access  Private (Admin)
router.put('/employers/:id/verify', verifyEmployer);

// @route   DELETE /api/admin/employers/:userId
// @desc    Delete employer record and all related data
// @access  Private (Admin)
router.delete('/employers/:userId', deleteEmployerRecord);

// ===========================================
// Job Management
// ===========================================

// @route   GET /api/admin/jobs
// @desc    Get all jobs with filters
// @access  Private (Admin)
router.get('/jobs', getAllJobs);

// @route   GET /api/admin/jobs/pending
// @desc    Get pending jobs for review
// @access  Private (Admin)
router.get('/jobs/pending', getPendingJobReviews);

// @route   POST /api/admin/jobs/:id/review
// @desc    Review job posting (accept/reject)
// @access  Private (Admin)
router.post('/jobs/:id/review', reviewJobPosting);

// @route   PUT /api/admin/jobs/:id/approve
// @desc    Approve/reject job
// @access  Private (Admin)
router.put('/jobs/:id/approve', approveJob);

// @route   DELETE /api/admin/jobs/:id
// @desc    Delete job (remove fake/inappropriate jobs)
// @access  Private (Admin)
router.delete('/jobs/:id', deleteJob);

// ===========================================
// Application Management
// ===========================================

// @route   GET /api/admin/applications
// @desc    Get all applications
// @access  Private (Admin)
router.get('/applications', getAllApplications);

// @route   GET /api/admin/applications/pending
// @desc    Get pending applications for review
// @access  Private (Admin)
router.get('/applications/pending', getPendingApplicationReviews);

// @route   POST /api/admin/applications/:id/review
// @desc    Review student application (accept/reject)
// @access  Private (Admin)
router.post('/applications/:id/review', reviewApplication);

// ===========================================
// Admin Management
// ===========================================

// @route   GET /api/admin/admins
// @desc    Get all admin accounts
// @access  Private (Admin)
router.get('/admins', getAllAdmins);

// @route   POST /api/admin/admins
// @desc    Create a new admin account
// @access  Private (Admin)
router.post('/admins', createAdmin);

module.exports = router;
