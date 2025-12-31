const ResponseUtil = require('../../utils/response.util');
const { logger } = require('../../config/logger');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Request error', {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    message: err.message,
    name: err.name,
    stack: err.stack
  });

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return ResponseUtil.validationError(res, errors);
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return ResponseUtil.conflict(res, `${field} already exists`);
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return ResponseUtil.error(res, 'Referenced resource not found', 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ResponseUtil.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseUtil.unauthorized(res, 'Token expired');
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ResponseUtil.error(res, 'File size too large', 400);
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return ResponseUtil.error(res, 'Too many files', 400);
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return ResponseUtil.error(res, 'Unexpected file field', 400);
    }
    return ResponseUtil.error(res, 'File upload error', 400);
  }

  // Custom application errors
  if (err.statusCode) {
    return ResponseUtil.error(res, err.message, err.statusCode, {
      code: err.code || 'APPLICATION_ERROR'
    });
  }

  // Default server error
  // Default server error (do not leak internals)
  return ResponseUtil.error(
    res,
    'Internal server error',
    500,
    process.env.NODE_ENV === 'development' ? { code: 'INTERNAL_ERROR' } : undefined
  );
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  return ResponseUtil.notFound(res, `Route ${req.method} ${req.path} not found`);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
