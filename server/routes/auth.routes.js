const express = require('express');
const router = express.Router();
const { register, login, adminLogin, getMe, updatePassword } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * Auth Routes
 * Member 1 - Authentication & Core User Management
 */

// @route   POST /api/auth/register
// @desc    Register a new user (student or employer)
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user (any role)
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/admin/login
// @desc    Login admin user only
// @access  Public
router.post('/admin/login', adminLogin);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', authenticateToken, getMe);

// @route   PUT /api/auth/password
// @desc    Update password
// @access  Private
router.put('/password', authenticateToken, updatePassword);

module.exports = router;
