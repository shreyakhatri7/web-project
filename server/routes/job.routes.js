const express = require('express');
const router = express.Router();
const { getAllJobs, getJobById, getJobFilters } = require('../controllers/job.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// @route   GET /api/jobs
// @desc    Get all jobs with search and filters
// @access  Public
router.get('/', getAllJobs);

// @route   GET /api/jobs/filters
// @desc    Get available filter options
// @access  Public
router.get('/filters', getJobFilters);

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public (but shows application status if authenticated)
router.get('/:id', (req, res, next) => {
  // Optional authentication - will set req.user if token is valid
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid, but route is public so continue without user
    }
  }
  next();
}, getJobById);

module.exports = router;
