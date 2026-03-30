const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

/**
 * Student Controller
 * Member 2 - Student Module
 * Handles: Profile, Education, Skills, Resume, Dashboard
 */

// Get student profile
const getProfile = async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, s.phone, s.bio, s.education, 
              s.skills, s.resume_url, s.created_at, s.updated_at,
              u.email
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = ?`,
      [req.user.id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Parse JSON fields
    const student = students[0];
    if (student.education) student.education = JSON.parse(student.education);
    if (student.skills) student.skills = JSON.parse(student.skills);

    res.json({
      success: true,
      profile: student
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Update student profile
const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone, bio } = req.body;

    const [result] = await pool.query(
      `UPDATE students 
       SET first_name = COALESCE(?, first_name),
           last_name = COALESCE(?, last_name),
           phone = COALESCE(?, phone),
           bio = COALESCE(?, bio),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [first_name, last_name, phone, bio, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Update education
const updateEducation = async (req, res) => {
  try {
    const { education } = req.body; // Array of education objects

    if (!Array.isArray(education)) {
      return res.status(400).json({
        success: false,
        message: 'Education must be an array'
      });
    }

    const educationJSON = JSON.stringify(education);

    const [result] = await pool.query(
      `UPDATE students 
       SET education = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [educationJSON, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Education updated successfully'
    });
  } catch (error) {
    console.error('Update education error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating education',
      error: error.message
    });
  }
};

// Update skills
const updateSkills = async (req, res) => {
  try {
    const { skills } = req.body; // Array of skill strings

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: 'Skills must be an array'
      });
    }

    const skillsJSON = JSON.stringify(skills);

    const [result] = await pool.query(
      `UPDATE students 
       SET skills = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [skillsJSON, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Skills updated successfully'
    });
  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating skills',
      error: error.message
    });
  }
};

// Upload resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Get current resume to delete old file
    const [students] = await pool.query(
      'SELECT resume_url FROM students WHERE user_id = ?',
      [req.user.id]
    );

    if (students.length > 0 && students[0].resume_url) {
      const oldFilePath = path.join(__dirname, '..', students[0].resume_url);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const resumeUrl = `/uploads/${req.file.filename}`;

    const [result] = await pool.query(
      `UPDATE students 
       SET resume_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [resumeUrl, req.user.id]
    );

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resume_url: resumeUrl
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading resume',
      error: error.message
    });
  }
};

// Delete resume
const deleteResume = async (req, res) => {
  try {
    const [students] = await pool.query(
      'SELECT resume_url FROM students WHERE user_id = ?',
      [req.user.id]
    );

    if (students.length > 0 && students[0].resume_url) {
      const filePath = path.join(__dirname, '..', students[0].resume_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query(
      `UPDATE students 
       SET resume_url = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resume',
      error: error.message
    });
  }
};

/**
 * Get student dashboard with stats
 * GET /api/students/dashboard
 */
const getDashboard = async (req, res) => {
  try {
    // Get student profile
    const [students] = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, s.resume_url
       FROM students s WHERE s.user_id = ?`,
      [req.user.id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const studentId = students[0].id;

    // Get application stats
    const [appStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed,
        SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM applications WHERE student_id = ?
    `, [studentId]);

    // Get recent applications
    const [recentApplications] = await pool.query(`
      SELECT a.id, a.status, a.created_at, j.title as job_title, 
             e.company_name, j.location
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN employers e ON j.employer_id = e.id
      WHERE a.student_id = ?
      ORDER BY a.created_at DESC
      LIMIT 5
    `, [studentId]);

    // Get recommended jobs (active, approved, matching student's skills if possible)
    const [recommendedJobs] = await pool.query(`
      SELECT j.id, j.title, j.location, j.job_type, j.salary_min, j.salary_max,
             e.company_name, j.created_at
      FROM jobs j
      JOIN employers e ON j.employer_id = e.id
      WHERE j.status = 'active' AND j.is_approved = 1
        AND j.id NOT IN (SELECT job_id FROM applications WHERE student_id = ?)
      ORDER BY j.created_at DESC
      LIMIT 5
    `, [studentId]);

    res.json({
      success: true,
      dashboard: {
        profile: students[0],
        applications: appStats[0],
        recentApplications,
        recommendedJobs
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
  updateEducation,
  updateSkills,
  uploadResume,
  deleteResume,
  getDashboard
};
