/**
 * Employer Controller
 * Member 3 - Employer Module
 * Handles: Profile, Job Posting, Application Management
 */

const { pool } = require('../config/db');

/**
 * Get employer profile
 * GET /api/employer/profile
 */
const getProfile = async (req, res) => {
  try {
    const [employers] = await pool.query(
      `SELECT id, company_name, company_description, company_logo, company_website, 
              company_location, industry, company_size, contact_name, contact_phone, 
              is_verified, created_at, updated_at 
       FROM employers WHERE user_id = ?`,
      [req.user.id]
    );

    if (employers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    res.json({
      success: true,
      profile: employers[0]
    });
  } catch (error) {
    console.error('Get employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

/**
 * Update employer profile
 * PUT /api/employer/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { 
      company_name, company_description, company_website, 
      company_location, industry, company_size, 
      contact_name, contact_phone 
    } = req.body;

    const [result] = await pool.query(
      `UPDATE employers 
       SET company_name = COALESCE(?, company_name),
           company_description = COALESCE(?, company_description),
           company_website = COALESCE(?, company_website),
           company_location = COALESCE(?, company_location),
           industry = COALESCE(?, industry),
           company_size = COALESCE(?, company_size),
           contact_name = COALESCE(?, contact_name),
           contact_phone = COALESCE(?, contact_phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [company_name, company_description, company_website, company_location, 
       industry, company_size, contact_name, contact_phone, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

/**
 * Create a new job posting
 * POST /api/employer/jobs
 */
const createJob = async (req, res) => {
  try {
    const {
      title, description, location, job_type, experience_level,
      salary_min, salary_max, requirements, responsibilities,
      benefits, skills_required, deadline, vacancies
    } = req.body;

    // Get employer ID
    const [employers] = await pool.query(
      'SELECT id FROM employers WHERE user_id = ?',
      [req.user.id]
    );

    if (employers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    const employerId = employers[0].id;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO jobs (
        employer_id, title, description, location, job_type, experience_level,
        salary_min, salary_max, requirements, responsibilities, benefits,
        skills_required, deadline, vacancies, status, is_approved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', FALSE)`,
      [
        employerId, title, description, location || null,
        job_type || 'full-time', experience_level || 'entry',
        salary_min || null, salary_max || null,
        requirements ? JSON.stringify(requirements) : null,
        responsibilities ? JSON.stringify(responsibilities) : null,
        benefits ? JSON.stringify(benefits) : null,
        skills_required ? JSON.stringify(skills_required) : null,
        deadline || null, vacancies || 1
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Job created successfully. Pending admin approval.',
      job: {
        id: result.insertId,
        title,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message
    });
  }
};

/**
 * Get all jobs posted by employer
 * GET /api/employer/jobs
 */
const getMyJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Get employer ID
    const [employers] = await pool.query(
      'SELECT id FROM employers WHERE user_id = ?',
      [req.user.id]
    );

    if (employers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    const employerId = employers[0].id;

    let query = `
      SELECT j.*, 
             (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
      FROM jobs j
      WHERE j.employer_id = ?
    `;
    const params = [employerId];

    if (status) {
      query += ` AND j.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY j.created_at DESC`;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [jobs] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM jobs WHERE employer_id = ?';
    const countParams = [employerId];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

/**
 * Get single job by ID (employer's own job)
 * GET /api/employer/jobs/:id
 */
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get employer ID
    const [employers] = await pool.query(
      'SELECT id FROM employers WHERE user_id = ?',
      [req.user.id]
    );

    if (employers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    const [jobs] = await pool.query(
      `SELECT j.*, 
              (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
       FROM jobs j
       WHERE j.id = ? AND j.employer_id = ?`,
      [id, employers[0].id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const job = jobs[0];
    // Parse JSON fields
    if (job.requirements) job.requirements = JSON.parse(job.requirements);
    if (job.responsibilities) job.responsibilities = JSON.parse(job.responsibilities);
    if (job.benefits) job.benefits = JSON.parse(job.benefits);
    if (job.skills_required) job.skills_required = JSON.parse(job.skills_required);

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
};

/**
 * Update job
 * PUT /api/employer/jobs/:id
 */
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, location, job_type, experience_level,
      salary_min, salary_max, requirements, responsibilities,
      benefits, skills_required, deadline, vacancies, status
    } = req.body;

    // Get employer ID
    const [employers] = await pool.query(
      'SELECT id FROM employers WHERE user_id = ?',
      [req.user.id]
    );

    if (employers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    // Verify job belongs to employer
    const [existingJobs] = await pool.query(
      'SELECT id FROM jobs WHERE id = ? AND employer_id = ?',
      [id, employers[0].id]
    );

    if (existingJobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const [result] = await pool.query(
      `UPDATE jobs SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        location = COALESCE(?, location),
        job_type = COALESCE(?, job_type),
        experience_level = COALESCE(?, experience_level),
        salary_min = COALESCE(?, salary_min),
        salary_max = COALESCE(?, salary_max),
        requirements = COALESCE(?, requirements),
        responsibilities = COALESCE(?, responsibilities),
        benefits = COALESCE(?, benefits),
        skills_required = COALESCE(?, skills_required),
        deadline = COALESCE(?, deadline),
        vacancies = COALESCE(?, vacancies),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title, description, location, job_type, experience_level,
        salary_min, salary_max,
        requirements ? JSON.stringify(requirements) : null,
        responsibilities ? JSON.stringify(responsibilities) : null,
        benefits ? JSON.stringify(benefits) : null,
        skills_required ? JSON.stringify(skills_required) : null,
        deadline, vacancies, status, id
      ]
    );

    res.json({
      success: true,
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
};

/**
 * Delete job
 * DELETE /api/employer/jobs/:id
 */
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Get employer ID
    const [employers] = await pool.query(
      'SELECT id FROM employers WHERE user_id = ?',
      [req.user.id]
    );

    if (employers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    const [result] = await pool.query(
      'DELETE FROM jobs WHERE id = ? AND employer_id = ?',
      [id, employers[0].id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  }
};

/**
 * Get applications for a job
 * GET /api/employer/jobs/:id/applications
 */
const getJobApplications = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Get employer ID
    const [employers] = await pool.query(
      'SELECT id FROM employers WHERE user_id = ?',
      [req.user.id]
    );

    if (employers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    // Verify job belongs to employer
    const [jobs] = await pool.query(
      'SELECT id, title FROM jobs WHERE id = ? AND employer_id = ?',
      [id, employers[0].id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    let query = `
      SELECT a.*, s.first_name, s.last_name, s.phone, s.bio, s.education, 
             s.skills, s.resume_url as student_resume,
             u.email as student_email
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE a.job_id = ?
    `;
    const params = [id];

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY a.created_at DESC`;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [applications] = await pool.query(query, params);

    // Parse JSON fields
    applications.forEach(app => {
      if (app.education) app.education = JSON.parse(app.education);
      if (app.skills) app.skills = JSON.parse(app.skills);
    });

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM applications WHERE job_id = ?';
    const countParams = [id];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      job: jobs[0],
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

/**
 * Update application status (accept/reject/shortlist)
 * PUT /api/employer/applications/:id/status
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, employer_notes } = req.body;

    const validStatuses = ['reviewed', 'shortlisted', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: reviewed, shortlisted, accepted, or rejected'
      });
    }

    // Get employer ID
    const [employers] = await pool.query(
      'SELECT id FROM employers WHERE user_id = ?',
      [req.user.id]
    );

    if (employers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    // Verify application belongs to employer's job
    const [applications] = await pool.query(
      `SELECT a.id FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ? AND j.employer_id = ?`,
      [id, employers[0].id]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await pool.query(
      `UPDATE applications 
       SET status = ?, employer_notes = COALESCE(?, employer_notes), updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, employer_notes, id]
    );

    res.json({
      success: true,
      message: `Application ${status} successfully`
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
};

/**
 * Get dashboard stats
 * GET /api/employer/dashboard
 */
const getDashboard = async (req, res) => {
  try {
    // Get employer ID
    const [employers] = await pool.query(
      'SELECT id, company_name, is_verified FROM employers WHERE user_id = ?',
      [req.user.id]
    );

    if (employers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    const employerId = employers[0].id;

    // Get job stats
    const [jobStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_jobs,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_jobs,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_jobs
       FROM jobs WHERE employer_id = ?`,
      [employerId]
    );

    // Get application stats
    const [appStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN a.status = 'reviewed' THEN 1 ELSE 0 END) as reviewed,
        SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
        SUM(CASE WHEN a.status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) as rejected
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.employer_id = ?`,
      [employerId]
    );

    // Get recent applications
    const [recentApplications] = await pool.query(
      `SELECT a.*, j.title as job_title, s.first_name, s.last_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN students s ON a.student_id = s.id
       WHERE j.employer_id = ?
       ORDER BY a.created_at DESC
       LIMIT 5`,
      [employerId]
    );

    res.json({
      success: true,
      dashboard: {
        company: employers[0],
        jobs: jobStats[0],
        applications: appStats[0],
        recentApplications
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard',
      error: error.message
    });
  }
};

module.exports = {
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
};
