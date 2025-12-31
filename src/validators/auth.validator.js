const { body, param } = require('express-validator');

const authValidators = {
  // Register validation
  register: [
    body('email')
      .optional()
      .trim()
      // .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),

    body('phone')
      .optional()
      .trim()
      .matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),

    body('full_name')
      .trim()
      .notEmpty().withMessage('Full name is required')
      .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2-255 characters'),

    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/\d/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),

    body('user_type')
      .optional()
      .isIn(['customer', 'vendor', 'delivery_agent']).withMessage('Invalid user type')
  ],

  // Login validation
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),

    body('password')
      .notEmpty().withMessage('Password is required')
  ],

  // Refresh token validation
  refreshToken: [
    body('refreshToken')
      .notEmpty().withMessage('Refresh token is required')
  ],

  // Forgot password validation
  forgotPassword: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail()
  ],

  // Reset password validation
  resetPassword: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),

    body('token')
      .trim()
      .notEmpty().withMessage('OTP is required')
      .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
      .isNumeric().withMessage('OTP must be numeric'),

    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/\d/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character')
  ],

  // Change password validation
  changePassword: [
    body('currentPassword')
      .notEmpty().withMessage('Current password is required'),

    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/\d/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),

    body('confirmPassword')
      .notEmpty().withMessage('Confirm password is required')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ],

  // Verify email validation
  verifyEmail: [
    body('token')
      .trim()
      .notEmpty().withMessage('Verification token is required')
  ],

  // Verify phone validation
  verifyPhone: [
    body('token')
      .trim()
      .notEmpty().withMessage('Verification OTP is required')
      .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
      .isNumeric().withMessage('OTP must be numeric')
  ]
};

module.exports = authValidators;
