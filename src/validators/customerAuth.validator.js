const { body } = require('express-validator');

const customerAuthValidators = {
  /**
   * Validate request OTP
   */
  requestOTP: [
    body('phone')
      .trim()
      .notEmpty().withMessage('Phone number is required')
      .matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number. Must be 10 digits starting with 6-9')
  ],

  /**
   * Validate verify OTP
   */
  verifyOTP: [
    body('phone')
      .trim()
      .notEmpty().withMessage('Phone number is required')
      .matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number. Must be 10 digits starting with 6-9'),
    
    body('otp')
      .trim()
      .notEmpty().withMessage('OTP is required')
      .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
      .isNumeric().withMessage('OTP must contain only numbers')
  ],

  /**
   * Validate resend OTP
   */
  resendOTP: [
    body('phone')
      .trim()
      .notEmpty().withMessage('Phone number is required')
      .matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number. Must be 10 digits starting with 6-9')
  ],

  /**
   * Validate update profile
   */
  updateProfile: [
    body('full_name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 }).withMessage('Full name must be between 2-255 characters'),
    
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail()
  ]
};

module.exports = customerAuthValidators;
