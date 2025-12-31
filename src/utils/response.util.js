const { HTTP_STATUS, MESSAGES } = require('../config/constants');

class ResponseUtil {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @param {String} message - Success message
   * @param {Number} statusCode - HTTP status code
   * @param {Object} meta - Additional metadata (pagination, etc.)
   */
  static success(res, data = null, message = MESSAGES.SUCCESS, statusCode = HTTP_STATUS.OK, meta = null) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   * @param {Number} statusCode - HTTP status code
   * @param {Object} error - Error details
   */
  static error(res, message = MESSAGES.SERVER_ERROR, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, error = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (error) {
      response.error = error;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {Array} errors - Validation errors
   */
  static validationError(res, errors) {
    return this.error(
      res,
      MESSAGES.VALIDATION_ERROR,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      {
        code: 'VALIDATION_ERROR',
        details: errors
      }
    );
  }

  /**
   * Send unauthorized response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static unauthorized(res, message = MESSAGES.UNAUTHORIZED) {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED, {
      code: 'UNAUTHORIZED'
    });
  }

  /**
   * Send forbidden response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static forbidden(res, message = MESSAGES.FORBIDDEN) {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN, {
      code: 'FORBIDDEN'
    });
  }

  /**
   * Send not found response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static notFound(res, message = MESSAGES.NOT_FOUND) {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND, {
      code: 'NOT_FOUND'
    });
  }

  /**
   * Send conflict response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static conflict(res, message) {
    return this.error(res, message, HTTP_STATUS.CONFLICT, {
      code: 'CONFLICT'
    });
  }

  /**
   * Send created response
   * @param {Object} res - Express response object
   * @param {Object} data - Created resource data
   * @param {String} message - Success message
   */
  static created(res, data, message = MESSAGES.CREATED) {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  /**
   * Send paginated response
   * @param {Object} res - Express response object
   * @param {Array} data - Data array
   * @param {Number} page - Current page
   * @param {Number} limit - Items per page
   * @param {Number} total - Total items
   * @param {String} message - Success message
   */
  static paginated(res, data, page, limit, total, message = MESSAGES.SUCCESS) {
    const totalPages = Math.ceil(total / limit);
    
    return this.success(res, data, message, HTTP_STATUS.OK, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  }
}

module.exports = ResponseUtil;
