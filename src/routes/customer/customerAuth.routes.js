const express = require('express');
const router = express.Router();
const customerAuthController = require('../../controllers/customerAuth.controller');
const customerAuthValidators = require('../../validators/customerAuth.validator');
const validate = require('../../middleware/validation/validate');
const { authenticate } = require('../../middleware/auth/authenticate');
const { loginLimiter } = require('../../middleware/security/rateLimiter');

/**
 * @route   POST /api/v1/auth/customer/request-otp
 * @desc    Request OTP for customer login/signup
 * @access  Public
 */
router.post(
  '/request-otp',
  loginLimiter, // Rate limit: 5 requests per 15 minutes
  customerAuthValidators.requestOTP,
  validate,
  customerAuthController.requestOTP
);

/**
 * @route   POST /api/v1/auth/customer/verify-otp
 * @desc    Verify OTP and login/signup customer
 * @access  Public
 */
router.post(
  '/verify-otp',
  loginLimiter, // Rate limit: 5 requests per 15 minutes
  customerAuthValidators.verifyOTP,
  validate,
  customerAuthController.verifyOTP
);

/**
 * @route   POST /api/v1/auth/customer/resend-otp
 * @desc    Resend OTP
 * @access  Public
 */
router.post(
  '/resend-otp',
  loginLimiter, // Rate limit: 5 requests per 15 minutes
  customerAuthValidators.resendOTP,
  validate,
  customerAuthController.resendOTP
);

/**
 * @route   PUT /api/v1/auth/customer/profile
 * @desc    Update customer profile
 * @access  Private (Customer only)
 */
router.put(
  '/profile',
  authenticate,
  customerAuthValidators.updateProfile,
  validate,
  customerAuthController.updateProfile
);

module.exports = router;
