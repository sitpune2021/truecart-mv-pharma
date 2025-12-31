const rateLimit = require('express-rate-limit');
const { RATE_LIMIT } = require('../../config/constants');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    error: {
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for super admin
    return req.user && req.user.user_type === 'super_admin';
  }
});

/**
 * Strict rate limiter for login attempts
 */
const loginLimiter = rateLimit({
  windowMs: RATE_LIMIT.LOGIN_WINDOW_MS,
  max: RATE_LIMIT.LOGIN_MAX_ATTEMPTS,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
    error: {
      code: 'LOGIN_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Rate limiter for password reset
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 attempts
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later',
    error: {
      code: 'PASSWORD_RESET_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for registration
 */
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour per IP
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later',
    error: {
      code: 'REGISTRATION_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for file uploads
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads
  message: {
    success: false,
    message: 'Too many file uploads, please try again later',
    error: {
      code: 'UPLOAD_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  loginLimiter,
  passwordResetLimiter,
  registrationLimiter,
  uploadLimiter
};
