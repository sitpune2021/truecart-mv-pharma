const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const authValidators = require('../../validators/auth.validator');
const validate = require('../../middleware/validation/validate');
const { authenticate } = require('../../middleware/auth/authenticate');
const { loginLimiter, passwordResetLimiter, registrationLimiter } = require('../../middleware/security/rateLimiter');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  registrationLimiter,
  authValidators.register,
  validate,
  authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  authValidators.login,
  validate,
  authController.login
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  authController.logout
);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh-token',
  authValidators.refreshToken,
  validate,
  authController.refreshToken
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset OTP
 * @access  Public
 */
router.post(
  '/forgot-password',
  passwordResetLimiter,
  authValidators.forgotPassword,
  validate,
  authController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post(
  '/reset-password',
  authValidators.resetPassword,
  validate,
  authController.resetPassword
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  authValidators.changePassword,
  validate,
  authController.changePassword
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  authController.getProfile
);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email address
 * @access  Private
 */
router.post(
  '/verify-email',
  authenticate,
  authValidators.verifyEmail,
  validate,
  authController.verifyEmail
);

/**
 * @route   POST /api/v1/auth/verify-phone
 * @desc    Verify phone number
 * @access  Private
 */
router.post(
  '/verify-phone',
  authenticate,
  authValidators.verifyPhone,
  validate,
  authController.verifyPhone
);

module.exports = router;
