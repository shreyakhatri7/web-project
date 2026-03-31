/**
 * Admin Controller
 * Member 4 - Admin Panel + System Integration
 * Handles: User Management, Job Management, Reports, System Control
 */

const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const parseJsonSafe = (value) => {
  if (!value) {
    return null;
  }

  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return null;
  }
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || null;
};

const logAuditAction = async (connection, { adminUserId, action, entityType, entityId = null, details = {}, ipAddress = null }) => {
  await connection.query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [adminUserId, action, entityType, entityId, JSON.stringify(details || {}), ipAddress]
  );
};

const createNotification = async (connection, { userId, title, message, type = 'info', metadata = {} }) => {
  await connection.query(
    `INSERT INTO notifications (user_id, title, message, type, metadata)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, title, message, type, JSON.stringify(metadata || {})]
  );
};

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
 * Get all students
 * GET /api/admin/students
 */
const getAllStudents = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT s.id as student_id, s.user_id, s.first_name, s.last_name, s.phone,
             s.university, s.major, s.graduation_year, s.created_at,
             u.email, u.status
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE 1 = 1
    `;
    const params = [];

    if (search) {
      query += ` AND (u.email LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR s.university LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status) {
      query += ` AND u.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY s.created_at DESC`;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), offset);

    const [students] = await pool.query(query, params);

    let countQuery = `
      SELECT COUNT(*) as total
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE 1 = 1
    `;
    const countParams = [];

    if (search) {
      countQuery += ` AND (u.email LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR s.university LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (status) {
      countQuery += ` AND u.status = ?`;
      countParams.push(status);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      students,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message,
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
        profile.education = parseJsonSafe(profile.education);
        profile.skills = parseJsonSafe(profile.skills);
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
        profile.permissions = parseJsonSafe(profile.permissions);
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
  const connection = await pool.getConnection();

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

    const [users] = await connection.query(
      'SELECT id, email, role, status FROM users WHERE id = ? LIMIT 1',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await logAuditAction(connection, {
      adminUserId: req.user.id,
      action: 'user_status_updated',
      entityType: 'user',
      entityId: parseInt(id, 10),
      details: {
        targetEmail: users[0].email,
        targetRole: users[0].role,
        previousStatus: users[0].status,
        newStatus: status,
        message: `Admin updated status for ${users[0].email} to ${status}`,
      },
      ipAddress: getClientIp(req),
    });

    await connection.commit();

    res.json({
      success: true,
      message: `User ${status === 'blocked' ? 'blocked' : status === 'active' ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const [users] = await connection.query(
      'SELECT id, email, role FROM users WHERE id = ? LIMIT 1',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await connection.beginTransaction();

    await connection.query('DELETE FROM notifications WHERE user_id = ?', [id]);
    await connection.query('DELETE FROM activity_logs WHERE user_id = ?', [id]);

    const [result] = await connection.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await logAuditAction(connection, {
      adminUserId: req.user.id,
      action: 'user_deleted',
      entityType: users[0].role,
      entityId: parseInt(id, 10),
      details: {
        targetEmail: users[0].email,
        targetRole: users[0].role,
        message: `Admin deleted user ${users[0].email} (${users[0].role})`,
      },
      ipAddress: getClientIp(req),
    });

    await connection.commit();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Delete student record completely
 * DELETE /api/admin/students/:userId
 */
const deleteStudentRecord = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { userId } = req.params;

    await connection.beginTransaction();

    const [students] = await connection.query(
      `SELECT u.id as user_id, u.email, s.id as student_id,
              CONCAT(s.first_name, ' ', s.last_name) as full_name
       FROM users u
       JOIN students s ON s.user_id = u.id
       WHERE u.id = ? AND u.role = 'student'
       LIMIT 1 FOR UPDATE`,
      [userId]
    );

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    const target = students[0];

    await connection.query('DELETE FROM notifications WHERE user_id = ?', [target.user_id]);
    await connection.query('DELETE FROM activity_logs WHERE user_id = ?', [target.user_id]);

    await connection.query('DELETE FROM users WHERE id = ? AND role = "student"', [target.user_id]);

    await logAuditAction(connection, {
      adminUserId: req.user.id,
      action: 'student_record_deleted',
      entityType: 'student',
      entityId: target.student_id,
      details: {
        targetUserId: target.user_id,
        targetEmail: target.email,
        targetName: target.full_name,
        message: `Admin deleted student record for ${target.email}`,
      },
      ipAddress: getClientIp(req),
    });

    await connection.commit();

    res.json({
      success: true,
      message: 'Student record and associated data deleted successfully',
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete student record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student record',
      error: error.message,
    });
  } finally {
    connection.release();
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
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const [employers] = await connection.query(
      `SELECT e.id, e.company_name, u.email
       FROM employers e
       JOIN users u ON e.user_id = u.id
       WHERE e.id = ?
       LIMIT 1`,
      [id]
    );

    if (employers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      'UPDATE employers SET is_verified = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [is_verified ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    const employer = employers[0];
    await logAuditAction(connection, {
      adminUserId: req.user.id,
      action: is_verified ? 'employer_verified' : 'employer_unverified',
      entityType: 'employer',
      entityId: parseInt(id, 10),
      details: {
        targetEmail: employer.email,
        companyName: employer.company_name,
        isVerified: !!is_verified,
        message: `Admin ${is_verified ? 'verified' : 'unverified'} employer ${employer.company_name}`,
      },
      ipAddress: getClientIp(req),
    });

    await connection.commit();

    res.json({
      success: true,
      message: `Employer ${is_verified ? 'verified' : 'unverified'} successfully`
    });
  } catch (error) {
    await connection.rollback();
    console.error('Verify employer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employer verification',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Delete employer record completely
 * DELETE /api/admin/employers/:userId
 */
const deleteEmployerRecord = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { userId } = req.params;

    await connection.beginTransaction();

    const [employers] = await connection.query(
      `SELECT u.id as user_id, u.email, e.id as employer_id, e.company_name
       FROM users u
       JOIN employers e ON e.user_id = u.id
       WHERE u.id = ? AND u.role = 'employer'
       LIMIT 1 FOR UPDATE`,
      [userId]
    );

    if (employers.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Employer record not found',
      });
    }

    const target = employers[0];

    await connection.query('DELETE FROM notifications WHERE user_id = ?', [target.user_id]);
    await connection.query('DELETE FROM activity_logs WHERE user_id = ?', [target.user_id]);
    await connection.query('DELETE FROM users WHERE id = ? AND role = "employer"', [target.user_id]);

    await logAuditAction(connection, {
      adminUserId: req.user.id,
      action: 'employer_record_deleted',
      entityType: 'employer',
      entityId: target.employer_id,
      details: {
        targetUserId: target.user_id,
        targetEmail: target.email,
        companyName: target.company_name,
        message: `Admin deleted employer record for ${target.company_name}`,
      },
      ipAddress: getClientIp(req),
    });

    await connection.commit();

    res.json({
      success: true,
      message: 'Employer record and associated data deleted successfully',
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete employer record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employer record',
      error: error.message,
    });
  } finally {
    connection.release();
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
    jobs.forEach((job) => {
      job.requirements = parseJsonSafe(job.requirements);
      job.responsibilities = parseJsonSafe(job.responsibilities);
      job.benefits = parseJsonSafe(job.benefits);
      job.skills_required = parseJsonSafe(job.skills_required);
    });

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
    if (employer_id) {
      countQuery += ' AND j.employer_id = ?';
      countParams.push(employer_id);
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
 * Get pending job reviews
 * GET /api/admin/jobs/pending
 */
const getPendingJobReviews = async (req, res) => {
  try {
    const [jobs] = await pool.query(
      `SELECT j.*, e.company_name, e.company_location, u.email as employer_email,
              e.user_id as employer_user_id
       FROM jobs j
       JOIN employers e ON j.employer_id = e.id
       JOIN users u ON e.user_id = u.id
       WHERE (j.status IN ('pending', 'pending_review') OR j.is_approved = 0)
       ORDER BY j.created_at DESC`
    );

    jobs.forEach((job) => {
      job.requirements = parseJsonSafe(job.requirements);
      job.responsibilities = parseJsonSafe(job.responsibilities);
      job.benefits = parseJsonSafe(job.benefits);
      job.skills_required = parseJsonSafe(job.skills_required);
    });

    res.json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error('Get pending jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending jobs',
      error: error.message,
    });
  }
};

/**
 * Review job posting (accept/reject)
 * POST /api/admin/jobs/:id/review
 */
const reviewJobPosting = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { decision, reason } = req.body;
    const normalizedDecision = (decision || '').toLowerCase();

    if (!['accept', 'reject'].includes(normalizedDecision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be either accept or reject',
      });
    }

    await connection.beginTransaction();

    const [jobs] = await connection.query(
      `SELECT j.id, j.title, j.status, j.is_approved, j.employer_id,
              e.company_name, e.user_id as employer_user_id
       FROM jobs j
       JOIN employers e ON j.employer_id = e.id
       WHERE j.id = ?
       LIMIT 1 FOR UPDATE`,
      [id]
    );

    if (jobs.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    const job = jobs[0];
    const isPending = ['pending', 'pending_review'].includes(job.status) || Number(job.is_approved) === 0;
    if (!isPending) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Job has already been reviewed',
      });
    }

    if (normalizedDecision === 'accept') {
      await connection.query(
        `UPDATE jobs
         SET status = 'active', is_approved = 1, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [id]
      );

      await createNotification(connection, {
        userId: job.employer_user_id,
        title: 'Job posting approved',
        message: `Your job posting \"${job.title}\" was approved and is now visible to students.`,
        type: 'success',
        metadata: { jobId: job.id, decision: 'accept' },
      });

      await logAuditAction(connection, {
        adminUserId: req.user.id,
        action: 'job_review_accepted',
        entityType: 'job',
        entityId: job.id,
        details: {
          companyName: job.company_name,
          jobTitle: job.title,
          message: `Admin approved job \"${job.title}\" from ${job.company_name}`,
        },
        ipAddress: getClientIp(req),
      });

      await connection.commit();

      return res.json({
        success: true,
        message: 'Job approved and published successfully',
      });
    }

    await connection.query('DELETE FROM jobs WHERE id = ?', [id]);

    await createNotification(connection, {
      userId: job.employer_user_id,
      title: 'Job posting rejected',
      message: `Your job posting \"${job.title}\" was rejected.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'warning',
      metadata: { jobId: job.id, decision: 'reject', reason: reason || null },
    });

    await logAuditAction(connection, {
      adminUserId: req.user.id,
      action: 'job_review_rejected',
      entityType: 'job',
      entityId: job.id,
      details: {
        companyName: job.company_name,
        jobTitle: job.title,
        reason: reason || null,
        message: `Admin rejected and deleted job \"${job.title}\" from ${job.company_name}`,
      },
      ipAddress: getClientIp(req),
    });

    await connection.commit();

    res.json({
      success: true,
      message: 'Job rejected and deleted successfully',
    });
  } catch (error) {
    await connection.rollback();
    console.error('Review job posting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reviewing job posting',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

/**
 * Approve/reject job
 * PUT /api/admin/jobs/:id/approve
 */
const approveJob = async (req, res) => {
  const decision = req.body.decision || (req.body.is_approved ? 'accept' : 'reject');
  req.body = {
    ...req.body,
    decision,
  };

  return reviewJobPosting(req, res);
};

/**
 * Delete job (remove fake/inappropriate jobs)
 * DELETE /api/admin/jobs/:id
 */
const deleteJob = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [jobs] = await connection.query(
      `SELECT j.id, j.title, e.company_name, e.user_id as employer_user_id
       FROM jobs j
       JOIN employers e ON j.employer_id = e.id
       WHERE j.id = ?
       LIMIT 1 FOR UPDATE`,
      [id]
    );

    if (jobs.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const job = jobs[0];

    const [result] = await connection.query('DELETE FROM jobs WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await createNotification(connection, {
      userId: job.employer_user_id,
      title: 'Job posting removed by admin',
      message: `Your job posting \"${job.title}\" was removed by an administrator.`,
      type: 'warning',
      metadata: { jobId: job.id },
    });

    await logAuditAction(connection, {
      adminUserId: req.user.id,
      action: 'job_deleted',
      entityType: 'job',
      entityId: job.id,
      details: {
        jobTitle: job.title,
        companyName: job.company_name,
        message: `Admin deleted job \"${job.title}\" from ${job.company_name}`,
      },
      ipAddress: getClientIp(req),
    });

    await connection.commit();

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  } finally {
    connection.release();
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
              s.first_name, s.last_name, s.phone, s.university, s.major,
              s.education, s.skills,
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
    applications.forEach((application) => {
      application.education = parseJsonSafe(application.education);
      application.skills = parseJsonSafe(application.skills);
    });

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

/**
 * Get pending application reviews
 * GET /api/admin/applications/pending
 */
const getPendingApplicationReviews = async (req, res) => {
  try {
    const [applications] = await pool.query(
      `SELECT a.id, a.job_id, a.student_id, a.cover_letter, a.resume_url, a.status, a.created_at,
              j.title as job_title, j.location as job_location, j.job_type,
              e.company_name, e.user_id as employer_user_id,
              s.first_name, s.last_name, s.phone, s.university, s.major,
              s.education, s.skills, s.resume_url as student_resume_url,
              su.email as student_email, s.user_id as student_user_id
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN employers e ON j.employer_id = e.id
       JOIN students s ON a.student_id = s.id
       JOIN users su ON s.user_id = su.id
       WHERE a.status IN ('pending', 'pending_review')
       ORDER BY a.created_at DESC`
    );

    applications.forEach((application) => {
      application.education = parseJsonSafe(application.education);
      application.skills = parseJsonSafe(application.skills);
    });

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error('Get pending applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending applications',
      error: error.message,
    });
  }
};

/**
 * Review student application (accept/reject)
 * POST /api/admin/applications/:id/review
 */
const reviewApplication = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { decision, reason } = req.body;
    const normalizedDecision = (decision || '').toLowerCase();

    if (!['accept', 'reject'].includes(normalizedDecision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be either accept or reject',
      });
    }

    await connection.beginTransaction();

    const [applications] = await connection.query(
      `SELECT a.id, a.status, a.job_id,
              j.title as job_title,
              e.company_name,
              e.user_id as employer_user_id,
              s.user_id as student_user_id,
              su.email as student_email,
              CONCAT(s.first_name, ' ', s.last_name) as student_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN employers e ON j.employer_id = e.id
       JOIN students s ON a.student_id = s.id
       JOIN users su ON s.user_id = su.id
       WHERE a.id = ?
       LIMIT 1 FOR UPDATE`,
      [id]
    );

    if (applications.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const application = applications[0];
    const isPending = ['pending', 'pending_review'].includes(application.status);

    if (!isPending) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Application has already been reviewed',
      });
    }

    if (normalizedDecision === 'accept') {
      await connection.query(
        `UPDATE applications
         SET status = 'approved', updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [id]
      );

      await createNotification(connection, {
        userId: application.student_user_id,
        title: 'Application approved',
        message: `Your application for \"${application.job_title}\" has been approved and forwarded to the employer.`,
        type: 'success',
        metadata: { applicationId: application.id, jobId: application.job_id, decision: 'accept' },
      });

      await createNotification(connection, {
        userId: application.employer_user_id,
        title: 'New approved application',
        message: `A new approved application is now visible for job \"${application.job_title}\".`,
        type: 'info',
        metadata: { applicationId: application.id, jobId: application.job_id },
      });

      await logAuditAction(connection, {
        adminUserId: req.user.id,
        action: 'application_review_accepted',
        entityType: 'application',
        entityId: application.id,
        details: {
          jobTitle: application.job_title,
          companyName: application.company_name,
          studentEmail: application.student_email,
          message: `Admin approved application ${application.id} for \"${application.job_title}\"`,
        },
        ipAddress: getClientIp(req),
      });

      await connection.commit();

      return res.json({
        success: true,
        message: 'Application approved and forwarded to employer',
      });
    }

    await connection.query('DELETE FROM applications WHERE id = ?', [id]);

    await createNotification(connection, {
      userId: application.student_user_id,
      title: 'Application rejected',
      message: `Your application for \"${application.job_title}\" was rejected by admin review.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'warning',
      metadata: { applicationId: application.id, jobId: application.job_id, decision: 'reject', reason: reason || null },
    });

    await logAuditAction(connection, {
      adminUserId: req.user.id,
      action: 'application_review_rejected',
      entityType: 'application',
      entityId: application.id,
      details: {
        jobTitle: application.job_title,
        companyName: application.company_name,
        studentEmail: application.student_email,
        reason: reason || null,
        message: `Admin rejected and deleted application ${application.id} for \"${application.job_title}\"`,
      },
      ipAddress: getClientIp(req),
    });

    await connection.commit();

    res.json({
      success: true,
      message: 'Application rejected and deleted successfully',
    });
  } catch (error) {
    await connection.rollback();
    console.error('Review application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reviewing application',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ==========================================
// ADMIN MANAGEMENT
// ==========================================

/**
 * Get all admin accounts
 * GET /api/admin/admins
 */
const getAllAdmins = async (req, res) => {
  try {
    const [admins] = await pool.query(
      `SELECT a.id, a.user_id, a.first_name, a.last_name, a.phone, a.permissions, a.created_at, a.updated_at,
              u.email, u.status
       FROM admins a
       JOIN users u ON a.user_id = u.id
       WHERE u.role = 'admin'
       ORDER BY a.created_at DESC`
    );

    const normalizedAdmins = admins.map((admin) => ({
      ...admin,
      permissions: parseJsonSafe(admin.permissions) || [],
    }));

    res.json({
      success: true,
      admins: normalizedAdmins,
      total: normalizedAdmins.length,
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin accounts',
      error: error.message,
    });
  }
};

/**
 * Create a new admin account
 * POST /api/admin/admins
 */
const createAdmin = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      permissions,
    } = req.body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedFirstName = (first_name || '').trim();
    const normalizedLastName = (last_name || '').trim();
    const normalizedPhone = (phone || '').trim() || null;

    if (!normalizedEmail || !password || !normalizedFirstName || !normalizedLastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const parsedPermissions = Array.isArray(permissions)
      ? permissions.map((item) => String(item).trim()).filter(Boolean)
      : typeof permissions === 'string'
        ? permissions.split(',').map((item) => item.trim()).filter(Boolean)
        : ['manage_users', 'manage_jobs', 'manage_employers', 'view_reports'];

    await connection.beginTransaction();

    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await connection.query(
      'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
      [normalizedEmail, hashedPassword, 'admin', 'active']
    );

    const userId = userResult.insertId;

    const [adminResult] = await connection.query(
      `INSERT INTO admins (user_id, first_name, last_name, phone, permissions)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, normalizedFirstName, normalizedLastName, normalizedPhone, JSON.stringify(parsedPermissions)]
    );

    await logAuditAction(connection, {
      adminUserId: req.user.id,
      action: 'admin_created',
      entityType: 'admin',
      entityId: adminResult.insertId,
      details: {
        targetUserId: userId,
        targetEmail: normalizedEmail,
        targetName: `${normalizedFirstName} ${normalizedLastName}`,
        permissions: parsedPermissions,
        message: `Admin created new admin account for ${normalizedEmail}`,
      },
      ipAddress: getClientIp(req),
    });

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        id: adminResult.insertId,
        user_id: userId,
        email: normalizedEmail,
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
        phone: normalizedPhone,
        permissions: parsedPermissions,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin account',
      error: error.message,
    });
  } finally {
    connection.release();
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
        SUM(CASE WHEN status IN ('pending', 'pending_review') OR is_approved = 0 THEN 1 ELSE 0 END) as pending_approval,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_jobs
      FROM jobs
    `);

    // Application stats
    const [appStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status IN ('pending', 'pending_review') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
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
      SELECT COUNT(*) as count
      FROM jobs
      WHERE status IN ('pending', 'pending_review') OR is_approved = 0
    `);

    const [unverifiedEmployers] = await pool.query(`
      SELECT COUNT(*) as count FROM employers WHERE is_verified = 0
    `);

    const stats = {
      total_users: Number(userStats[0]?.total_users || 0),
      total_students: Number(userStats[0]?.students || 0),
      total_employers: Number(employerStats[0]?.total_employers || 0),
      pending_employers: Number(unverifiedEmployers[0]?.count || 0),
      total_jobs: Number(jobStats[0]?.total_jobs || 0),
      pending_jobs: Number(pendingJobs[0]?.count || 0),
      total_applications: Number(appStats[0]?.total_applications || 0),
      active_jobs: Number(jobStats[0]?.active_jobs || 0)
    };

    const [activityLogs] = await pool.query(
      `SELECT al.action, al.entity_type, al.entity_id, al.details, al.created_at,
              u.email as admin_email
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 10`
    );

    let recentActivity = activityLogs.map((log) => {
      const details = parseJsonSafe(log.details) || {};
      const defaultDescription = `${(log.action || 'activity').replace(/_/g, ' ')} (${log.entity_type || 'system'})`;
      return {
        action: log.action,
        description: details.message || defaultDescription,
        created_at: log.created_at,
        admin_email: log.admin_email || null,
      };
    });

    if (recentActivity.length === 0) {
      const userActivity = recentUsers.map((user) => ({
        action: 'user_registered',
        description: `${user.email} joined as ${user.role}`,
        created_at: user.created_at
      }));

      const jobActivity = recentJobs.map((job) => ({
        action: job.is_approved ? 'job_approved' : 'job_posted',
        description: `${job.company_name} posted ${job.title}`,
        created_at: job.created_at
      }));

      recentActivity = [...userActivity, ...jobActivity]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
    }

    res.json({
      success: true,
      stats,
      recent_activity: recentActivity,
      dashboard: {
        stats,
        recent_activity: recentActivity,
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
};
