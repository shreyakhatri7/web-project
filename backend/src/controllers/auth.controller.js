import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import prisma from '../config/database.js';

/**
 * Generate JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      // Student specific
      university,
      degree,
      major,
      graduationYear,
      // Employer specific
      companyName,
      companySize,
      industry,
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

    // Create user with profile based on role
    let userData = {
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      role: role || 'STUDENT',
      status: 'ACTIVE',
    };

    // Add role-specific profile
    if (!role || role === 'STUDENT') {
      userData.studentProfile = {
        create: {
          university: university || null,
          degree: degree || null,
          major: major || null,
          graduationYear: graduationYear ? parseInt(graduationYear) : null,
        },
      };
    } else if (role === 'EMPLOYER') {
      if (!companyName) {
        return res.status(400).json({
          success: false,
          message: 'Company name is required for employer registration.',
        });
      }
      
      userData.employerProfile = {
        create: {
          companyName,
          companySize: companySize || null,
          industry: industry || null,
        },
      };
    } else if (role === 'ADMIN') {
      userData.adminProfile = {
        create: {},
      };
    }

    // Create user
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        studentProfile: role === 'STUDENT' || !role ? {
          select: {
            university: true,
            degree: true,
            major: true,
            graduationYear: true,
          },
        } : false,
        employerProfile: role === 'EMPLOYER' ? {
          select: {
            companyName: true,
            companySize: true,
            industry: true,
          },
        } : false,
      },
    });

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with profile
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        studentProfile: true,
        employerProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please contact support.',
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate token
    const token = generateToken(user.id, user.role);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        studentProfile: {
          select: {
            university: true,
            degree: true,
            major: true,
            graduationYear: true,
            gpa: true,
            skills: true,
            bio: true,
            resume: true,
            portfolio: true,
            linkedIn: true,
            github: true,
            address: true,
            city: true,
            state: true,
            country: true,
            zipCode: true,
          },
        },
        employerProfile: {
          select: {
            companyName: true,
            companySize: true,
            industry: true,
            website: true,
            description: true,
            logo: true,
            contactPerson: true,
            position: true,
            address: true,
            city: true,
            state: true,
            country: true,
            zipCode: true,
            isVerified: true,
          },
        },
        adminProfile: {
          select: {
            department: true,
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user (client-side token removal, but we can track it here if needed)
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    // In a JWT-based system, logout is typically handled on the client side
    // by removing the token. However, we can log this action or implement
    // token blacklisting if needed in the future.
    
    res.status(200).json({
      success: true,
      message: 'Logout successful.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * POST /api/auth/change-password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
