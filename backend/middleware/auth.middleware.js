const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Verify JWT token and attach user to request
 * Used by: All team members
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token.' 
    });
  }
};

/**
 * Check if user is a student
 * Used by: Member 2 - Student Module
 */
const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Students only.' 
    });
  }
};

/**
 * Check if user is an employer
 * Used by: Member 3 - Employer Module
 */
const isEmployer = (req, res, next) => {
  if (req.user && req.user.role === 'employer') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Employers only.' 
    });
  }
};

/**
 * Check if user is an admin
 * Used by: Member 4 - Admin Module
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admins only.' 
    });
  }
};

/**
 * Check if user is either an employer or admin
 * Used for: Job management routes
 */
const isEmployerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'employer' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Employers or Admins only.' 
    });
  }
};

/**
 * Check if user account is active
 * Used by: All modules
 */
const isActiveUser = (req, res, next) => {
  if (req.user && req.user.status === 'active') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Account is inactive or blocked. Please contact support.' 
    });
  }
};

module.exports = { 
  authenticateToken, 
  isStudent, 
  isEmployer, 
  isAdmin, 
  isEmployerOrAdmin,
  isActiveUser 
};
