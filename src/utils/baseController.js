const { logger } = require('../config/logger');
const AuditService = require('../services/audit/audit.service');

class BaseController {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.logger = logger.child({ controller: serviceName });
  }

  /**
   * Wrap async route handlers with error handling
   */
  asyncHandler = (fn) => {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        this.logger.error(`Error in ${this.serviceName}:`, {
          error: error.message,
          stack: error.stack,
          path: req.path,
          method: req.method,
          userId: req.user?.id
        });
        next(error);
      }
    };
  };

  /**
   * Extract request metadata for audit logging
   */
  getRequestMetadata(req) {
    return {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || null,
      path: req.path,
      method: req.method
    };
  }

  /**
   * Log user activity
   */
  async logActivity(req, activityType, description, status = 'SUCCESS', metadata = {}) {
    const requestMeta = this.getRequestMetadata(req);
    
    await AuditService.logUserActivity({
      userId: requestMeta.userId,
      activityType,
      activityDescription: description,
      status,
      metadata: { ...metadata, path: requestMeta.path, method: requestMeta.method },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent
    });
  }

  /**
   * Send success response
   */
  sendSuccess(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Send error response
   */
  sendError(res, message = 'Error occurred', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors })
    });
  }

  /**
   * Send paginated response
   */
  sendPaginatedResponse(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit)
      }
    });
  }
}

module.exports = BaseController;
