const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getApplicationById,
  withdrawApplication,
  getApplicationStats
} = require('../controllers/application.controller');
const { authenticateToken, isStudent } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);
router.use(isStudent);

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (Student)
router.post('/', applyForJob);

// @route   GET /api/applications
// @desc    Get all applications for current student
// @access  Private (Student)
router.get('/', getMyApplications);

// @route   GET /api/applications/stats
// @desc    Get application statistics
// @access  Private (Student)
router.get('/stats', getApplicationStats);

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private (Student)
router.get('/:id', getApplicationById);

// @route   PUT /api/applications/:id/withdraw
// @desc    Withdraw application
// @access  Private (Student)
router.put('/:id/withdraw', withdrawApplication);

module.exports = router;
