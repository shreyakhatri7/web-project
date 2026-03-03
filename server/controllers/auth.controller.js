/**
 * Auth Controller
 * Member 1 - Authentication & Core User Management
 * Handles: Register, Login, Logout, Get Current User
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require('dotenv').config();

/**
 * Register a new user (Student or Employer)
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { email, password, role, ...profileData } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and role'
      });
    }

    // Validate role (only student and employer can self-register)
    if (!['student', 'employer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student or employer.'
      });
    }

    // Check if email already exists
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Start transaction
    await connection.beginTransaction();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert into users table
    const [userResult] = await connection.query(
      'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, role, 'active']
    );

    const userId = userResult.insertId;
    let profile = null;

    // Insert into role-specific table
    if (role === 'student') {
      const { first_name, last_name, phone, university, major, graduation_year, gpa, bio } = profileData;
      
      if (!first_name || !last_name) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'First name and last name are required for students'
        });
      }

      const [studentResult] = await connection.query(
        'INSERT INTO students (user_id, first_name, last_name, phone, university, major, graduation_year, gpa, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, first_name, last_name, phone || null, university || null, major || null, graduation_year || null, gpa || null, bio || null]
      );

      profile = {
        id: studentResult.insertId,
        user_id: userId,
        first_name,
        last_name,
        email,
        university,
        major,
        graduation_year
      };
    } else if (role === 'employer') {
      const { company_name, company_description, company_location, industry, contact_name, contact_phone } = profileData;
      
      if (!company_name) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Company name is required for employers'
        });
      }

      const [employerResult] = await connection.query(
        `INSERT INTO employers (user_id, company_name, company_description, company_location, industry, contact_name, contact_phone) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, company_name, company_description || null, company_location || null, industry || null, contact_name || null, contact_phone || null]
      );

      profile = {
        id: employerResult.insertId,
        user_id: userId,
        company_name,
        email
      };
    }

    // Commit transaction
    await connection.commit();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userId,  // Make sure this matches what the middleware expects
        id: userId, 
        email, 
        role,
        profileId: profile.id,
        status: 'active'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        email,
        role,
        profile
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Login user (any role)
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if user is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.'
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get profile based on role
    let profile = null;
    let profileId = null;

    if (user.role === 'student') {
      const [students] = await pool.query(
        'SELECT * FROM students WHERE user_id = ?',
        [user.id]
      );
      if (students.length > 0) {
        profile = students[0];
        profileId = profile.id;
        delete profile.user_id;
      }
    } else if (user.role === 'employer') {
      const [employers] = await pool.query(
        'SELECT * FROM employers WHERE user_id = ?',
        [user.id]
      );
      if (employers.length > 0) {
        profile = employers[0];
        profileId = profile.id;
        delete profile.user_id;
      }
    } else if (user.role === 'admin') {
      const [admins] = await pool.query(
        'SELECT * FROM admins WHERE user_id = ?',
        [user.id]
      );
      if (admins.length > 0) {
        profile = admins[0];
        profileId = profile.id;
        delete profile.user_id;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,  // Add userId to match middleware expectations
        id: user.id, 
        email: user.email, 
        role: user.role,
        profileId: profileId,
        status: user.status
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

/**
 * Get current logged in user
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const { id, role } = req.user;

    // Get user from users table
    const [users] = await pool.query(
      'SELECT id, email, role, status, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Get profile based on role
    let profile = null;

    if (role === 'student') {
      const [students] = await pool.query(
        `SELECT id, first_name, last_name, phone, bio, education, skills, resume_url, created_at, updated_at 
         FROM students WHERE user_id = ?`,
        [id]
      );
      if (students.length > 0) {
        profile = students[0];
        if (profile.education) profile.education = JSON.parse(profile.education);
        if (profile.skills) profile.skills = JSON.parse(profile.skills);
      }
    } else if (role === 'employer') {
      const [employers] = await pool.query(
        `SELECT id, company_name, company_description, company_logo, company_website, company_location, 
                industry, company_size, contact_name, contact_phone, is_verified, created_at, updated_at 
         FROM employers WHERE user_id = ?`,
        [id]
      );
      if (employers.length > 0) {
        profile = employers[0];
      }
    } else if (role === 'admin') {
      const [admins] = await pool.query(
        'SELECT id, first_name, last_name, phone, permissions, created_at, updated_at FROM admins WHERE user_id = ?',
        [id]
      );
      if (admins.length > 0) {
        profile = admins[0];
        if (profile.permissions) profile.permissions = JSON.parse(profile.permissions);
      }
    }

    res.json({
      success: true,
      user: {
        ...user,
        profile
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

/**
 * Update password
 * PUT /api/auth/password
 */
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    // Get current user
    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: error.message
    });
  }
};

module.exports = { register, login, getMe, updatePassword };
