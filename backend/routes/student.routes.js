const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  updateEducation, 
  updateSkills,
  uploadResume,
  deleteResume,
  getDashboard
} = require('../controllers/student.controller');
const { authenticateToken, isStudent } = require('../middleware/auth.middleware');
const { uploadResume: uploadMiddleware } = require('../middleware/upload.middleware');

/**
 * Student Routes
 * Member 2 - Student Module
 */

// All routes require authentication and student role
router.use(authenticateToken);
router.use(isStudent);

// @route   GET /api/students/dashboard
// @desc    Get student dashboard with stats
// @access  Private (Student)
router.get('/dashboard', getDashboard);

// @route   GET /api/students/profile
// @desc    Get student profile
// @access  Private (Student)
router.get('/profile', getProfile);

// @route   PUT /api/students/profile
// @desc    Update student profile
// @access  Private (Student)
router.put('/profile', updateProfile);

// @route   PUT /api/students/education
// @desc    Update student education
// @access  Private (Student)
router.put('/education', updateEducation);

// @route   PUT /api/students/skills
// @desc    Update student skills
// @access  Private (Student)
router.put('/skills', updateSkills);

// @route   POST /api/students/resume
// @desc    Upload resume
// @access  Private (Student)
router.post('/resume', uploadMiddleware.single('resume'), uploadResume);

// @route   DELETE /api/students/resume
// @desc    Delete resume
// @access  Private (Student)
router.delete('/resume', deleteResume);

module.exports = router;
