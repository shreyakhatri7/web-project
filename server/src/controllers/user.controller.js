import prisma from '../config/database.js';
import bcrypt from 'bcrypt';
import { config } from '../config/config.js';

/**
 * Get all users (Admin only)
 * GET /api/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, page = 1, limit = 10, search } = req.query;

    const where = {};
    
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          lastLogin: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Check permissions: user can view their own profile, admins can view any profile
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this profile.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
 * Update user profile
 * PUT /api/users/:id
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Check permissions
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this profile.',
      });
    }

    const {
      firstName,
      lastName,
      phone,
      avatar,
      // Student fields
      university,
      degree,
      major,
      graduationYear,
      gpa,
      skills,
      bio,
      resume,
      portfolio,
      linkedIn,
      github,
      // Employer fields
      companyName,
      companySize,
      industry,
      website,
      description,
      logo,
      contactPerson,
      position,
      // Common address fields
      address,
      city,
      state,
      country,
      zipCode,
    } = req.body;

    // Get user to check role
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        employerProfile: true,
        adminProfile: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Update user basic info
    const updateData = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(avatar !== undefined && { avatar }),
    };

    // Update role-specific profile
    if (existingUser.role === 'STUDENT' && existingUser.studentProfile) {
      updateData.studentProfile = {
        update: {
          ...(university !== undefined && { university }),
          ...(degree !== undefined && { degree }),
          ...(major !== undefined && { major }),
          ...(graduationYear !== undefined && { graduationYear: graduationYear ? parseInt(graduationYear) : null }),
          ...(gpa !== undefined && { gpa: gpa ? parseFloat(gpa) : null }),
          ...(skills !== undefined && { skills }),
          ...(bio !== undefined && { bio }),
          ...(resume !== undefined && { resume }),
          ...(portfolio !== undefined && { portfolio }),
          ...(linkedIn !== undefined && { linkedIn }),
          ...(github !== undefined && { github }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(country !== undefined && { country }),
          ...(zipCode !== undefined && { zipCode }),
        },
      };
    } else if (existingUser.role === 'EMPLOYER' && existingUser.employerProfile) {
      updateData.employerProfile = {
        update: {
          ...(companyName && { companyName }),
          ...(companySize !== undefined && { companySize }),
          ...(industry !== undefined && { industry }),
          ...(website !== undefined && { website }),
          ...(description !== undefined && { description }),
          ...(logo !== undefined && { logo }),
          ...(contactPerson !== undefined && { contactPerson }),
          ...(position !== undefined && { position }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(country !== undefined && { country }),
          ...(zipCode !== undefined && { zipCode }),
        },
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        updatedAt: true,
        studentProfile: true,
        employerProfile: true,
        adminProfile: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (Admin only or own account)
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Check permissions
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this account.',
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Delete user (cascade will handle related profiles)
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status (Admin only)
 * PATCH /api/users/:id/status
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = parseInt(id);

    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be ACTIVE, INACTIVE, or SUSPENDED.',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'User status updated successfully.',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};
