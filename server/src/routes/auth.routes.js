import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
} from '../validators/auth.validator.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);
router.post('/change-password', authenticate, changePasswordValidation, validate, changePassword);

export default router;
