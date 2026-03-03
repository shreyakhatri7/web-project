
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JWT Secret (from environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Helper function to execute queries with promises
const executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Helper function to get employer.id from user.id
const getEmployerIdFromUserId = async (userId) => {
    const result = await executeQuery('SELECT id FROM employers WHERE user_id = ?', [userId]);
    if (result.length === 0) {
        throw new Error('Employer profile not found');
    }
    return result[0].id;
};

// Get Employer Profile
const getEmployerProfile = async (req, res) => {
    try {
        const userId = req.user.userId;  // From unified auth middleware
        
        const query = `
            SELECT e.*, u.email, u.status
            FROM employers e
            JOIN users u ON e.user_id = u.id
            WHERE e.user_id = ?
        `;
        const employers = await executeQuery(query, [userId]);

        if (employers.length === 0) {
            return res.status(404).json({ message: 'Employer profile not found' });
        }

        const employer = employers[0];
        res.json({
            message: 'Profile retrieved successfully',
            employer
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Employer Profile
const updateEmployerProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            company_name, company_description, company_location, 
            industry, contact_name, contact_phone, company_website
        } = req.body;

        const updateQuery = `
            UPDATE employers 
            SET company_name = ?, company_description = ?, company_location = ?,
                industry = ?, contact_name = ?, contact_phone = ?, company_website = ?
            WHERE user_id = ?
        `;
        
        await executeQuery(updateQuery, [
            company_name, company_description, company_location,
            industry, contact_name, contact_phone, company_website, userId
        ]);

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Post a new job
const postJob = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // First get the employer record to get the employer.id
        const employerQuery = 'SELECT id FROM employers WHERE user_id = ?';
        const employers = await executeQuery(employerQuery, [userId]);
        
        if (employers.length === 0) {
            return res.status(404).json({ message: 'Employer profile not found' });
        }
        
        const employerId = employers[0].id;
        const {
            title, description, job_type, location,
            salary_min, salary_max, requirements, benefits, application_deadline
        } = req.body;

        if (!title || !description || !job_type) {
            return res.status(400).json({ message: 'Title, description, and job type are required' });
        }

        const insertQuery = `
            INSERT INTO jobs 
            (employer_id, title, description, job_type, location, salary_min, salary_max, requirements, benefits, application_deadline)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await executeQuery(insertQuery, [
            employerId, title, description, job_type, location || null,
            salary_min || null, salary_max || null, requirements || null, 
            benefits || null, application_deadline || null
        ]);

        res.status(201).json({
            message: 'Job posted successfully',
            jobId: result.insertId
        });
    } catch (error) {
        console.error('Post job error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all jobs by employer
const getEmployerJobs = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // First get the employer record to get the employer.id
        const employerQuery = 'SELECT id FROM employers WHERE user_id = ?';
        const employers = await executeQuery(employerQuery, [userId]);
        
        if (employers.length === 0) {
            return res.status(404).json({ message: 'Employer profile not found' });
        }
        
        const employerId = employers[0].id;
        
        const query = `
            SELECT j.*, 
                   COUNT(a.id) as application_count
            FROM jobs j
            LEFT JOIN applications a ON j.id = a.job_id
            WHERE j.employer_id = ?
            GROUP BY j.id
            ORDER BY j.created_at DESC
        `;
        
        const jobs = await executeQuery(query, [employerId]);
        res.json({ jobs });
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get single job details
const getJobDetails = async (req, res) => {
    try {
        const userId = req.user.userId;
        const employerId = await getEmployerIdFromUserId(userId);
        const jobId = req.params.jobId;

        const query = `
            SELECT j.*, 
                   COUNT(a.id) as application_count
            FROM jobs j
            LEFT JOIN applications a ON j.id = a.job_id
            WHERE j.id = ? AND j.employer_id = ?
            GROUP BY j.id
        `;
        
        const jobs = await executeQuery(query, [jobId, employerId]);

        if (jobs.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({ job: jobs[0] });
    } catch (error) {
        console.error('Get job details error:', error);
        if (error.message === 'Employer profile not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update job
const updateJob = async (req, res) => {
    try {
        const userId = req.user.userId;
        const employerId = await getEmployerIdFromUserId(userId);
        const jobId = req.params.jobId;
        const {
            title, description, job_type, location,
            salary_min, salary_max, requirements, benefits, 
            application_deadline, status
        } = req.body;

        // Verify job belongs to employer
        const jobCheck = await executeQuery('SELECT id FROM jobs WHERE id = ? AND employer_id = ?', [jobId, employerId]);
        if (jobCheck.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const updateQuery = `
            UPDATE jobs 
            SET title = ?, description = ?, job_type = ?, location = ?,
                salary_min = ?, salary_max = ?, requirements = ?, benefits = ?,
                application_deadline = ?, status = ?
            WHERE id = ? AND employer_id = ?
        `;
        
        await executeQuery(updateQuery, [
            title, description, job_type, location,
            salary_min, salary_max, requirements, benefits,
            application_deadline, status || 'active', jobId, employerId
        ]);

        res.json({ message: 'Job updated successfully' });
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete job
const deleteJob = async (req, res) => {
    try {
        const employerId = req.user.userId;
        const jobId = req.params.jobId;

        // Verify job belongs to employer
        const jobCheck = await executeQuery('SELECT id FROM jobs WHERE id = ? AND employer_id = ?', [jobId, employerId]);
        if (jobCheck.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        await executeQuery('DELETE FROM jobs WHERE id = ? AND employer_id = ?', [jobId, employerId]);
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get applicants for a job
const getJobApplicants = async (req, res) => {
    try {
        const employerId = req.user.userId;
        const jobId = req.params.jobId;

        // Verify job belongs to employer
        const jobCheck = await executeQuery('SELECT id FROM jobs WHERE id = ? AND employer_id = ?', [jobId, employerId]);
        if (jobCheck.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const query = `
            SELECT a.*, j.title as job_title
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.job_id = ?
            ORDER BY a.applied_at DESC
        `;
        
        const applicants = await executeQuery(query, [jobId]);
        res.json({ applicants });
    } catch (error) {
        console.error('Get applicants error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all applicants for employer's jobs
const getAllApplicants = async (req, res) => {
    try {
        const employerId = req.user.userId;

        const query = `
            SELECT a.*, j.title as job_title
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE j.employer_id = ?
            ORDER BY a.applied_at DESC
        `;
        
        const applicants = await executeQuery(query, [employerId]);
        res.json({ applicants });
    } catch (error) {
        console.error('Get all applicants error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
    try {
        const employerId = req.user.userId;
        const applicationId = req.params.applicationId;
        const { status } = req.body;

        if (!['pending', 'accepted', 'rejected', 'shortlisted'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Verify application belongs to employer's job
        const appCheck = await executeQuery(`
            SELECT a.id 
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.id = ? AND j.employer_id = ?
        `, [applicationId, employerId]);

        if (appCheck.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        await executeQuery(
            'UPDATE applications SET application_status = ? WHERE id = ?',
            [status, applicationId]
        );

        res.json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const employerId = req.user.userId;

        console.log('Employer ID:', employerId);

        const [totalJobs] = await executeQuery(
            'SELECT COUNT(*) as count FROM jobs WHERE employer_id = ?',
            [employerId]
        );
        console.log('Total Jobs:', totalJobs);

        const [activeJobs] = await executeQuery(
            'SELECT COUNT(*) as count FROM jobs WHERE employer_id = ? AND status = "active"',
            [employerId]
        );
        console.log('Active Jobs:', activeJobs);

        const [totalApplications] = await executeQuery(`
            SELECT COUNT(*) as count 
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE j.employer_id = ?
        `, [employerId]);
        console.log('Total Applications:', totalApplications);

        const [pendingApplications] = await executeQuery(`
            SELECT COUNT(*) as count 
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE j.employer_id = ? AND a.application_status = 'pending'
        `, [employerId]);
        console.log('Pending Applications:', pendingApplications);

        res.json({
            stats: {
                totalJobs: totalJobs.count,
                activeJobs: activeJobs.count,
                totalApplications: totalApplications.count,
                pendingApplications: pendingApplications.count
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
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
};