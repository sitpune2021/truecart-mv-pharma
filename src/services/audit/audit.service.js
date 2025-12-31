const { AuditLog, UserActivityLog, DataChangeHistory } = require('../../database/models');
const { v4: uuidv4 } = require('uuid');

class AuditService {
  /**
   * Log a data change to audit_logs table
   * @param {Object} params - Audit log parameters
   * @param {string} params.tableName - Name of the table
   * @param {string} params.recordId - ID of the record
   * @param {string} params.action - Action performed (INSERT, UPDATE, DELETE, RESTORE)
   * @param {Object} params.oldValues - Old values before change
   * @param {Object} params.newValues - New values after change
   * @param {string} params.changedBy - User ID who made the change
   * @param {string} params.ipAddress - IP address of the request
   * @param {string} params.userAgent - User agent string
   * @param {string} params.requestId - Request ID for tracking
   * @param {Object} params.metadata - Additional metadata
   */
  static async logDataChange({
    tableName,
    recordId,
    action,
    oldValues = null,
    newValues = null,
    changedBy = null,
    ipAddress = null,
    userAgent = null,
    requestId = null,
    metadata = null
  }) {
    try {
      // Calculate changed fields
      const changedFields = [];
      if (oldValues && newValues) {
        Object.keys(newValues).forEach(key => {
          if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
            changedFields.push(key);
          }
        });
      }

      const auditLog = await AuditLog.create({
        table_name: tableName,
        record_id: String(recordId),
        action: action.toUpperCase(),
        old_values: oldValues,
        new_values: newValues,
        changed_fields: changedFields.length > 0 ? changedFields : null,
        changed_by: changedBy,
        changed_at: new Date(),
        ip_address: ipAddress,
        user_agent: userAgent,
        request_id: requestId || uuidv4(),
        metadata
      });

      return auditLog;
    } catch (error) {
      console.error('Error logging data change:', error);
      // Don't throw error to prevent breaking the main operation
      return null;
    }
  }

  /**
   * Log user activity
   * @param {Object} params - Activity log parameters
   * @param {string} params.userId - User ID
   * @param {string} params.activityType - Type of activity
   * @param {string} params.activityDescription - Description of activity
   * @param {string} params.status - Status (SUCCESS, FAILED, BLOCKED)
   * @param {Object} params.metadata - Additional metadata
   * @param {string} params.ipAddress - IP address
   * @param {string} params.userAgent - User agent
   * @param {string} params.location - Location
   * @param {Object} params.deviceInfo - Device information
   * @param {string} params.requestId - Request ID
   */
  static async logUserActivity({
    userId = null,
    activityType,
    activityDescription = null,
    status = 'SUCCESS',
    metadata = null,
    ipAddress = null,
    userAgent = null,
    location = null,
    deviceInfo = null,
    requestId = null
  }) {
    try {
      const activityLog = await UserActivityLog.create({
        user_id: userId,
        activity_type: activityType,
        activity_description: activityDescription,
        status: status.toUpperCase(),
        metadata,
        ip_address: ipAddress,
        user_agent: userAgent,
        location,
        device_info: deviceInfo,
        request_id: requestId || uuidv4(),
        created_at: new Date()
      });

      return activityLog;
    } catch (error) {
      console.error('Error logging user activity:', error);
      return null;
    }
  }

  /**
   * Log field-level changes
   * @param {Object} params - Field change parameters
   * @param {string} params.tableName - Table name
   * @param {string} params.recordId - Record ID
   * @param {string} params.fieldName - Field name
   * @param {string} params.oldValue - Old value
   * @param {string} params.newValue - New value
   * @param {string} params.changedBy - User ID who made the change
   * @param {string} params.changeReason - Reason for change
   */
  static async logFieldChange({
    tableName,
    recordId,
    fieldName,
    oldValue,
    newValue,
    changedBy = null,
    changeReason = null
  }) {
    try {
      const fieldChange = await DataChangeHistory.create({
        table_name: tableName,
        record_id: String(recordId),
        field_name: fieldName,
        old_value: oldValue ? String(oldValue) : null,
        new_value: newValue ? String(newValue) : null,
        changed_by: changedBy,
        changed_at: new Date(),
        change_reason: changeReason
      });

      return fieldChange;
    } catch (error) {
      console.error('Error logging field change:', error);
      return null;
    }
  }

  /**
   * Get audit logs for a specific record
   * @param {string} tableName - Table name
   * @param {string} recordId - Record ID
   * @param {Object} options - Query options
   */
  static async getAuditLogs(tableName, recordId, options = {}) {
    try {
      const { limit = 50, offset = 0, action = null } = options;

      const where = {
        table_name: tableName,
        record_id: String(recordId)
      };

      if (action) {
        where.action = action.toUpperCase();
      }

      const logs = await AuditLog.findAll({
        where,
        limit,
        offset,
        order: [['changed_at', 'DESC']],
        include: [{
          association: 'changedByUser',
          attributes: ['id', 'full_name', 'email']
        }]
      });

      return logs;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Get user activity logs
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   */
  static async getUserActivityLogs(userId, options = {}) {
    try {
      const { limit = 50, offset = 0, activityType = null, status = null } = options;

      const where = { user_id: userId };

      if (activityType) {
        where.activity_type = activityType;
      }

      if (status) {
        where.status = status.toUpperCase();
      }

      const logs = await UserActivityLog.findAll({
        where,
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return logs;
    } catch (error) {
      console.error('Error fetching user activity logs:', error);
      throw error;
    }
  }

  /**
   * Get field change history
   * @param {string} tableName - Table name
   * @param {string} recordId - Record ID
   * @param {string} fieldName - Field name (optional)
   */
  static async getFieldChangeHistory(tableName, recordId, fieldName = null) {
    try {
      const where = {
        table_name: tableName,
        record_id: String(recordId)
      };

      if (fieldName) {
        where.field_name = fieldName;
      }

      const history = await DataChangeHistory.findAll({
        where,
        order: [['changed_at', 'DESC']],
        include: [{
          association: 'changedByUser',
          attributes: ['id', 'full_name', 'email']
        }]
      });

      return history;
    } catch (error) {
      console.error('Error fetching field change history:', error);
      throw error;
    }
  }

  /**
   * Extract request information from Express request object
   * @param {Object} req - Express request object
   */
  static extractRequestInfo(req) {
    return {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      requestId: req.id || uuidv4(),
      userId: req.user?.id || null
    };
  }

  /**
   * Create audit middleware for Express
   * @param {string} activityType - Type of activity to log
   */
  static createActivityMiddleware(activityType) {
    return async (req, res, next) => {
      const originalJson = res.json;
      
      res.json = function(data) {
        const requestInfo = AuditService.extractRequestInfo(req);
        
        // Log activity after response
        setImmediate(() => {
          AuditService.logUserActivity({
            userId: requestInfo.userId,
            activityType,
            activityDescription: `${req.method} ${req.originalUrl}`,
            status: res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : 'FAILED',
            metadata: {
              method: req.method,
              url: req.originalUrl,
              statusCode: res.statusCode,
              body: req.body
            },
            ipAddress: requestInfo.ipAddress,
            userAgent: requestInfo.userAgent,
            requestId: requestInfo.requestId
          });
        });

        return originalJson.call(this, data);
      };

      next();
    };
  }
}

module.exports = AuditService;
