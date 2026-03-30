/**
 * Admin Controller
 * Member 4 - Admin Panel + System Integration
 * Handles: User Management, Job Management, Reports, System Control
 */

const { pool } = require('../config/db');

// ==========================================
// USER MANAGEMENT
// ==========================================

/**
 * Get all users with filters
 * GET /api/admin/users
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT u.id, u.email, u.role, u.status, u.created_at, u.updated_at,
             CASE 
               WHEN u.role = 'student' THEN (SELECT CONCAT(first_name, ' ', last_name) FROM students WHERE user_id = u.id)
               WHEN u.role = 'employer' THEN (SELECT company_name FROM employers WHERE user_id = u.id)
               WHEN u.role = 'admin' THEN (SELECT CONCAT(first_name, ' ', last_name) FROM admins WHERE user_id = u.id)
             END as display_name
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      query += ` AND u.role = ?`;
      params.push(role);
    }

    if (status) {
      query += ` AND u.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND u.email LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC`;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [users] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (search) {
      countQuery += ' AND email LIKE ?';
      countParams.push(`%${search}%`);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * Get user by ID with full profile
 * GET /api/admin/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      'SELECT id, email, role, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    let profile = null;

    if (user.role === 'student') {
      const [students] = await pool.query(
        'SELECT * FROM students WHERE user_id = ?',
        [id]
      );
      if (students.length > 0) {
        profile = students[0];
        if (profile.education) profile.education = JSON.parse(profile.education);
        if (profile.skills) profile.skills = JSON.parse(profile.skills);
      }
    } else if (user.role === 'employer') {
      const [employers] = await pool.query(
        'SELECT * FROM employers WHERE user_id = ?',
        [id]
      );
      if (employers.length > 0) {
        profile = employers[0];
      }
    } else if (user.role === 'admin') {
      const [admins] = await pool.query(
        'SELECT * FROM admins WHERE user_id = ?',
        [id]
      );
      if (admins.length > 0) {
        profile = admins[0];
        if (profile.permissions) profile.permissions = JSON.parse(profile.permissions);
      }
    }

    res.json({
      success: true,
      user: { ...user, profile }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

/**
 * Update user status (block/unblock/activate)
 * PUT /api/admin/users/:id/status
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'inactive', 'blocked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: active, inactive, or blocked'
      });
    }

    // Prevent admin from blocking themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own status'
      });
    }

    const [result] = await pool.query(
      'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${status === 'blocked' ? 'blocked' : status === 'active' ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// ==========================================
// EMPLOYER MANAGEMENT
// ==========================================

/**
 * Get all employers with verification status
 * GET /api/admin/employers
 */
const getAllEmployers = async (req, res) => {
  try {
    const { is_verified, search, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT e.*, u.email, u.status as user_status,
             (SELECT COUNT(*) FROM jobs WHERE employer_id = e.id) as job_count
      FROM employers e
      JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (is_verified !== undefined) {
      query += ` AND e.is_verified = ?`;
      params.push(is_verified === 'true' ? 1 : 0);
    }

    if (search) {
      query += ` AND (e.company_name LIKE ? OR u.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY e.created_at DESC`;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [employers] = await pool.query(query, params);

    // Get count
    let countQuery = `
      SELECT COUNT(*) as total FROM employers e
      JOIN users u ON e.user_id = u.id WHERE 1=1
    `;
    const countParams = [];
    if (is_verified !== undefined) {
      countQuery += ' AND e.is_verified = ?';
      countParams.push(is_verified === 'true' ? 1 : 0);
    }
    if (search) {
      countQuery += ' AND (e.company_name LIKE ? OR u.email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      employers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all employers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employers',
      error: error.message
    });
  }
};

/**
 * Verify/Unverify employer
 * PUT /api/admin/employers/:id/verify
 */
const verifyEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const [result] = await pool.query(
      'UPDATE employers SET is_verified = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [is_verified ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    res.json({
      success: true,
      message: `Employer ${is_verified ? 'verified' : 'unverified'} successfully`
    });
  } catch (error) {
    console.error('Verify employer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employer verification',
      error: error.message
    });
  }
};

// ==========================================
// JOB MANAGEMENT
// ==========================================

/**
 * Get all jobs with filters
 * GET /api/admin/jobs
 */
const getAllJobs = async (req, res) => {
  try {
    const { status, is_approved, employer_id, search, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT j.*, e.company_name, e.is_verified as employer_verified, u.email as employer_email,
             (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
      FROM jobs j
      JOIN employers e ON j.employer_id = e.id
      JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND j.status = ?`;
      params.push(status);
    }

    if (is_approved !== undefined) {
      query += ` AND j.is_approved = ?`;
      params.push(is_approved === 'true' ? 1 : 0);
    }

    if (employer_id) {
      query += ` AND j.employer_id = ?`;
      params.push(employer_id);
    }

    if (search) {
      query += ` AND (j.title LIKE ? OR e.company_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY j.created_at DESC`;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [jobs] = await pool.query(query, params);

    // Get count
    let countQuery = `
      SELECT COUNT(*) as total FROM jobs j
      JOIN employers e ON j.employer_id = e.id WHERE 1=1
    `;
    const countParams = [];
    if (status) {
      countQuery += ' AND j.status = ?';
      countParams.push(status);
    }
    if (is_approved !== undefined) {
      countQuery += ' AND j.is_approved = ?';
      countParams.push(is_approved === 'true' ? 1 : 0);
    }
    if (search) {
      countQuery += ' AND (j.title LIKE ? OR e.company_name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
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
    console.error('Get all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

/**
 * Approve/reject job
 * PUT /api/admin/jobs/:id/approve
 */
const approveJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved, status } = req.body;

    const updates = [];
    const params = [];

    if (is_approved !== undefined) {
      updates.push('is_approved = ?');
      params.push(is_approved ? 1 : 0);
    }

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const [result] = await pool.query(
      `UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: `Job ${is_approved ? 'approved' : 'updated'} successfully`
    });
  } catch (error) {
    console.error('Approve job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
};

/**
 * Delete job (remove fake/inappropriate jobs)
 * DELETE /api/admin/jobs/:id
 */
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM jobs WHERE id = ?',
      [id]
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

// ==========================================
// APPLICATION MANAGEMENT
// ==========================================

/**
 * Get all applications
 * GET /api/admin/applications
 */
const getAllApplications = async (req, res) => {
  try {
    const { status, job_id, student_id, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT a.*, 
             j.title as job_title, j.location as job_location,
             e.company_name,
             s.first_name, s.last_name,
             u.email as student_email
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN employers e ON j.employer_id = e.id
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    if (job_id) {
      query += ` AND a.job_id = ?`;
      params.push(job_id);
    }

    if (student_id) {
      query += ` AND a.student_id = ?`;
      params.push(student_id);
    }

    query += ` ORDER BY a.created_at DESC`;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [applications] = await pool.query(query, params);

    // Get count
    let countQuery = 'SELECT COUNT(*) as total FROM applications a WHERE 1=1';
    const countParams = [];
    if (status) {
      countQuery += ' AND a.status = ?';
      countParams.push(status);
    }
    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// ==========================================
// REPORTS & STATISTICS
// ==========================================

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard
 */
const getDashboard = async (req, res) => {
  try {
    // User stats
    const [userStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students,
        SUM(CASE WHEN role = 'employer' THEN 1 ELSE 0 END) as employers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked_users
      FROM users
    `);

    // Job stats
    const [jobStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'active' AND is_approved = 1 THEN 1 ELSE 0 END) as active_jobs,
        SUM(CASE WHEN status = 'pending' OR is_approved = 0 THEN 1 ELSE 0 END) as pending_approval,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_jobs
      FROM jobs
    `);

    // Application stats
    const [appStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM applications
    `);

    // Employer stats
    const [employerStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_employers,
        SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN is_verified = 0 THEN 1 ELSE 0 END) as unverified
      FROM employers
    `);

    // Recent activity
    const [recentUsers] = await pool.query(`
      SELECT id, email, role, status, created_at 
      FROM users ORDER BY created_at DESC LIMIT 5
    `);

    const [recentJobs] = await pool.query(`
      SELECT j.id, j.title, j.status, j.is_approved, j.created_at, e.company_name
      FROM jobs j
      JOIN employers e ON j.employer_id = e.id
      ORDER BY j.created_at DESC LIMIT 5
    `);

    // Pending items that need attention
    const [pendingJobs] = await pool.query(`
      SELECT COUNT(*) as count FROM jobs WHERE is_approved = 0
    `);

    const [unverifiedEmployers] = await pool.query(`
      SELECT COUNT(*) as count FROM employers WHERE is_verified = 0
    `);

    res.json({
      success: true,
      dashboard: {
        users: userStats[0],
        jobs: jobStats[0],
        applications: appStats[0],
        employers: employerStats[0],
        recentUsers,
        recentJobs,
        pendingActions: {
          jobsToApprove: pendingJobs[0].count,
          employersToVerify: unverifiedEmployers[0].count
        }
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

/**
 * Get detailed reports
 * GET /api/admin/reports
 */
const getReports = async (req, res) => {
  try {
    const { type = 'overview', start_date, end_date } = req.query;

    let dateFilter = '';
    const dateParams = [];
    
    if (start_date && end_date) {
      dateFilter = ' AND created_at BETWEEN ? AND ?';
      dateParams.push(start_date, end_date);
    }

    let report = {};

    if (type === 'overview' || type === 'users') {
      // User registration over time
      const [usersByMonth] = await pool.query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as count,
          role
        FROM users
        WHERE 1=1 ${dateFilter}
        GROUP BY DATE_FORMAT(created_at, '%Y-%m'), role
        ORDER BY month DESC
        LIMIT 12
      `, dateParams);
      report.usersByMonth = usersByMonth;
    }

    if (type === 'overview' || type === 'jobs') {
      // Jobs by type
      const [jobsByType] = await pool.query(`
        SELECT job_type, COUNT(*) as count
        FROM jobs
        WHERE 1=1 ${dateFilter}
        GROUP BY job_type
      `, dateParams);
      report.jobsByType = jobsByType;

      // Jobs by industry
      const [jobsByIndustry] = await pool.query(`
        SELECT e.industry, COUNT(*) as count
        FROM jobs j
        JOIN employers e ON j.employer_id = e.id
        WHERE e.industry IS NOT NULL ${dateFilter.replace('created_at', 'j.created_at')}
        GROUP BY e.industry
        ORDER BY count DESC
        LIMIT 10
      `, dateParams);
      report.jobsByIndustry = jobsByIndustry;
    }

    if (type === 'overview' || type === 'applications') {
      // Application status distribution
      const [applicationsByStatus] = await pool.query(`
        SELECT status, COUNT(*) as count
        FROM applications
        WHERE 1=1 ${dateFilter}
        GROUP BY status
      `, dateParams);
      report.applicationsByStatus = applicationsByStatus;
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

module.exports = {
  // User management
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  // Employer management
  getAllEmployers,
  verifyEmployer,
  // Job management
  getAllJobs,
  approveJob,
  deleteJob,
  // Application management
  getAllApplications,
  // Reports
  getDashboard,
  getReports
};
