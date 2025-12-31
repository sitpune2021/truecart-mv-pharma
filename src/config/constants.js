require('dotenv').config();

module.exports = {
  // User Types
  USER_TYPES: {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    VENDOR: 'vendor',
    CUSTOMER: 'customer',
    DELIVERY_AGENT: 'delivery_agent'
  },

  // JWT Configuration
  JWT: {
    ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
    REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
    SECRET: process.env.JWT_SECRET,
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
  },

  // Bcrypt
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    LOGIN_WINDOW_MS: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 900000,
    LOGIN_MAX_ATTEMPTS: parseInt(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS) || 5
  },

  // Session
  MAX_CONCURRENT_SESSIONS: parseInt(process.env.MAX_CONCURRENT_SESSIONS) || 3,

  // Password Reset
  PASSWORD_RESET: {
    OTP_LENGTH: 6,
    OTP_EXPIRY_MINUTES: 15
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: parseInt(process.env.DEFAULT_PAGE_SIZE) || 20,
    MAX_LIMIT: parseInt(process.env.MAX_PAGE_SIZE) || 100
  },

  // Order Assignment
  ORDER_ASSIGNMENT: {
    TIMEOUT_MINUTES: parseInt(process.env.ORDER_ASSIGNMENT_TIMEOUT_MINUTES) || 30,
    MAX_DISTANCE_KM: parseInt(process.env.MAX_VENDOR_DISTANCE_KM) || 3,
    MAX_VENDORS_TO_TRY: parseInt(process.env.MAX_VENDORS_TO_TRY) || 5
  },

  // Commission
  COMMISSION: {
    DEFAULT_PERCENTAGE: parseFloat(process.env.DEFAULT_COMMISSION_PERCENTAGE) || 10,
    PAYMENT_GATEWAY_FEE: parseFloat(process.env.PAYMENT_GATEWAY_FEE_PERCENTAGE) || 2,
    PLATFORM_SERVICE_FEE: parseFloat(process.env.PLATFORM_SERVICE_FEE) || 5,
    DELIVERY_COMMISSION: parseFloat(process.env.DELIVERY_COMMISSION_PERCENTAGE) || 15
  },

  // Delivery
  DELIVERY: {
    DEFAULT_CHARGE: parseFloat(process.env.DEFAULT_DELIVERY_CHARGE) || 30,
    FREE_THRESHOLD: parseFloat(process.env.FREE_DELIVERY_THRESHOLD) || 500
  },

  // Stock Allocation
  STOCK_ALLOCATION: {
    DEFAULT_ONLINE_PERCENTAGE: parseInt(process.env.DEFAULT_ONLINE_STOCK_PERCENTAGE) || 60,
    DEFAULT_OFFLINE_PERCENTAGE: parseInt(process.env.DEFAULT_OFFLINE_STOCK_PERCENTAGE) || 40
  },

  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB) || 10,
    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  },

  // Response Messages
  MESSAGES: {
    SUCCESS: 'Operation successful',
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Internal server error'
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
  }
};
