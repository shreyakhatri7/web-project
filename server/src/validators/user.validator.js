import { body } from 'express-validator';

export const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('gpa')
    .optional()
    .isFloat({ min: 0, max: 4.0 })
    .withMessage('GPA must be between 0 and 4.0'),
  
  body('graduationYear')
    .optional()
    .isInt({ min: 1950, max: 2050 })
    .withMessage('Please provide a valid graduation year'),
  
  body('linkedIn')
    .optional()
    .isURL()
    .withMessage('Please provide a valid LinkedIn URL'),
  
  body('github')
    .optional()
    .isURL()
    .withMessage('Please provide a valid GitHub URL'),
  
  body('portfolio')
    .optional()
    .isURL()
    .withMessage('Please provide a valid portfolio URL'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
];

export const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    .withMessage('Status must be ACTIVE, INACTIVE, or SUSPENDED'),
];
