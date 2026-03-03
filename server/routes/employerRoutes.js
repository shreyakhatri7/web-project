const express = require('express');
const router = express.Router();
const { authenticateToken, isEmployer } = require('../middleware/auth.middleware');
const {
    getEmployerProfile,
    updateEmployerProfile,
    postJob,
    getEmployerJobs,
    getJobDetails,
    updateJob,
    deleteJob,
    getJobApplicants,
    getAllApplicants,
    updateApplicationStatus,
    getDashboardStats
} = require('../controllers/employerController');

// Note: Login and Register now handled by unified auth system at /api/auth/

// Protected routes (authentication required)
// Profile routes
router.get('/profile', authenticateToken, isEmployer, getEmployerProfile);
router.put('/profile', authenticateToken, isEmployer, updateEmployerProfile);

// Dashboard route
router.get('/dashboard/stats', authenticateToken, isEmployer, getDashboardStats);

// Job management routes
router.post('/jobs', authenticateToken, isEmployer, postJob);
router.get('/jobs', authenticateToken, isEmployer, getEmployerJobs);
router.get('/jobs/:jobId', authenticateToken, isEmployer, getJobDetails);
router.put('/jobs/:jobId', authenticateToken, isEmployer, updateJob);
router.delete('/jobs/:jobId', authenticateToken, isEmployer, deleteJob);

// Applicant management routes
router.get('/jobs/:jobId/applicants', authenticateToken, isEmployer, getJobApplicants);
router.get('/applicants', authenticateToken, isEmployer, getAllApplicants);
router.put('/applications/:applicationId/status', authenticateToken, isEmployer, updateApplicationStatus);

module.exports = router;