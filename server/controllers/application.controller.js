/**
 * Application Controller
 * Member 2 - Student Module (Apply, View, Withdraw)
 * Handles all student application operations
 */

const { pool } = require('../config/db');

/**
 * Apply for a job
 * POST /api/applications
 */
const applyForJob = async (req, res) => {
  try {
    const { job_id, cover_letter } = req.body;

    // Validate job_id
    if (!job_id) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Get student ID from user
    const [students] = await pool.query(
      'SELECT id, resume_url FROM students WHERE user_id = ?',
      [req.user.id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const student_id = students[0].id;
    const resume_url = students[0].resume_url;

    // Check if job exists and is active
    const [jobs] = await pool.query(
      'SELECT id, title FROM jobs WHERE id = ? AND status = "active" AND is_approved = 1',
      [job_id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or no longer accepting applications'
      });
    }

    // Check if already applied
    const [existingApplications] = await pool.query(
      'SELECT id FROM applications WHERE job_id = ? AND student_id = ?',
      [job_id, student_id]
    );

    if (existingApplications.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const [result] = await pool.query(
      `INSERT INTO applications (job_id, student_id, cover_letter, resume_url, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [job_id, student_id, cover_letter || null, resume_url]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: result.insertId,
        job_id,
        job_title: jobs[0].title,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
};

/**
 * Get all applications for current student
 * GET /api/applications
 */
const getMyApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Get student ID from user
    const [students] = await pool.query(
      'SELECT id FROM students WHERE user_id = ?',
      [req.user.id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const student_id = students[0].id;

    let query = `
      SELECT a.*, j.title as job_title, j.location as job_location,
             j.job_type, j.salary_min, j.salary_max,
             e.company_name, e.company_logo
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN employers e ON j.employer_id = e.id
      WHERE a.student_id = ?
    `;
    const params = [student_id];

    // Status filter
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

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM applications a 
      WHERE a.student_id = ?
    `;
    const countParams = [student_id];
    if (status) {
      countQuery += ` AND a.status = ?`;
      countParams.push(status);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

/**
 * Get single application by ID
 * GET /api/applications/:id
 */
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get student ID from user
    const [students] = await pool.query(
      'SELECT id FROM students WHERE user_id = ?',
      [req.user.id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const student_id = students[0].id;

    const [applications] = await pool.query(
      `SELECT a.*, j.title as job_title, j.description as job_description,
              j.location as job_location, j.job_type, j.salary_min, j.salary_max,
              j.requirements, j.responsibilities,
              e.company_name, e.company_logo, e.company_website
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN employers e ON j.employer_id = e.id
       WHERE a.id = ? AND a.student_id = ?`,
      [id, student_id]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const application = applications[0];
    if (application.requirements) application.requirements = JSON.parse(application.requirements);
    if (application.responsibilities) application.responsibilities = JSON.parse(application.responsibilities);

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

/**
 * Withdraw application
 * PUT /api/applications/:id/withdraw
 */
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Get student ID from user
    const [students] = await pool.query(
      'SELECT id FROM students WHERE user_id = ?',
      [req.user.id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const student_id = students[0].id;

    // Check if application exists and belongs to student
    const [applications] = await pool.query(
      'SELECT id, status FROM applications WHERE id = ? AND student_id = ?',
      [id, student_id]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if can be withdrawn (only pending or reviewed applications can be withdrawn)
    if (['accepted', 'rejected', 'withdrawn'].includes(applications[0].status)) {
      return res.status(400).json({
        success: false,
        message: 'This application cannot be withdrawn'
      });
    }

    // Update status to withdrawn
    await pool.query(
      `UPDATE applications 
       SET status = 'withdrawn', updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error withdrawing application',
      error: error.message
    });
  }
};

/**
 * Get application statistics for dashboard
 * GET /api/applications/stats
 */
const getApplicationStats = async (req, res) => {
  try {
    // Get student ID from user
    const [students] = await pool.query(
      'SELECT id FROM students WHERE user_id = ?',
      [req.user.id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const student_id = students[0].id;

    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed,
        SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'withdrawn' THEN 1 ELSE 0 END) as withdrawn
       FROM applications WHERE student_id = ?`,
      [student_id]
    );

    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application statistics',
      error: error.message
    });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicationById,
  withdrawApplication,
  getApplicationStats
};
