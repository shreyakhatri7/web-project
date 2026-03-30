import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  updateUserValidation,
  updateStatusValidation,
} from '../validators/user.validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users (Admin only)
router.get('/', authorize('ADMIN'), getAllUsers);

// Get user by ID (Admin or own profile)
router.get('/:id', getUserById);

// Update user profile (Admin or own profile)
router.put('/:id', updateUserValidation, validate, updateUser);

// Delete user (Admin only or own account)
router.delete('/:id', deleteUser);

// Update user status (Admin only)
router.patch('/:id/status', authorize('ADMIN'), updateStatusValidation, validate, updateUserStatus);

export default router;
