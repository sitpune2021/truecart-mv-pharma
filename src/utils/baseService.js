const { logger } = require('../config/logger');
const AuditService = require('../services/audit/audit.service');

class BaseService {
  constructor(model, serviceName) {
    this.model = model;
    this.serviceName = serviceName;
    this.logger = logger.child({ service: serviceName });
  }

  /**
   * Create a new record
   */
  async create(data, userId = null, auditMetadata = {}) {
    try {
      const record = await this.model.create(data);

      // Log audit trail
      await AuditService.logDataChange({
        tableName: this.model.tableName,
        recordId: record.id,
        action: 'INSERT',
        newValues: record.toJSON(),
        changedBy: userId,
        ...auditMetadata
      });

      this.logger.info(`Created ${this.serviceName}:`, { id: record.id });
      return record;
    } catch (error) {
      this.logger.error(`Error creating ${this.serviceName}:`, {
        error: error.message,
        data
      });
      throw error;
    }
  }

  /**
   * Find record by ID
   */
  async findById(id, options = {}) {
    try {
      const record = await this.model.findByPk(id, options);
      return record;
    } catch (error) {
      this.logger.error(`Error finding ${this.serviceName} by ID:`, {
        error: error.message,
        id
      });
      throw error;
    }
  }

  /**
   * Find all records with pagination
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        where = {},
        include = [],
        order = [['created_at', 'DESC']]
      } = options;

      const offset = (page - 1) * limit;

      const { count, rows } = await this.model.findAndCountAll({
        where,
        include,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      return {
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count
        }
      };
    } catch (error) {
      this.logger.error(`Error finding all ${this.serviceName}:`, {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Update a record
   */
  async update(id, data, userId = null, auditMetadata = {}) {
    try {
      const record = await this.findById(id);
      if (!record) {
        throw new Error(`${this.serviceName} not found`);
      }

      const oldValues = record.toJSON();
      await record.update(data);
      const newValues = record.toJSON();

      // Log audit trail
      await AuditService.logDataChange({
        tableName: this.model.tableName,
        recordId: record.id,
        action: 'UPDATE',
        oldValues,
        newValues,
        changedBy: userId,
        ...auditMetadata
      });

      this.logger.info(`Updated ${this.serviceName}:`, { id: record.id });
      return record;
    } catch (error) {
      this.logger.error(`Error updating ${this.serviceName}:`, {
        error: error.message,
        id,
        data
      });
      throw error;
    }
  }

  /**
   * Soft delete a record
   */
  async delete(id, userId = null, auditMetadata = {}) {
    try {
      const record = await this.findById(id);
      if (!record) {
        throw new Error(`${this.serviceName} not found`);
      }

      const oldValues = record.toJSON();
      await record.destroy();

      // Log audit trail
      await AuditService.logDataChange({
        tableName: this.model.tableName,
        recordId: record.id,
        action: 'DELETE',
        oldValues,
        changedBy: userId,
        ...auditMetadata
      });

      this.logger.info(`Deleted ${this.serviceName}:`, { id: record.id });
      return true;
    } catch (error) {
      this.logger.error(`Error deleting ${this.serviceName}:`, {
        error: error.message,
        id
      });
      throw error;
    }
  }

  /**
   * Restore a soft-deleted record
   */
  async restore(id, userId = null, auditMetadata = {}) {
    try {
      const record = await this.model.findByPk(id, { paranoid: false });
      if (!record) {
        throw new Error(`${this.serviceName} not found`);
      }

      await record.restore();

      // Log audit trail
      await AuditService.logDataChange({
        tableName: this.model.tableName,
        recordId: record.id,
        action: 'RESTORE',
        newValues: record.toJSON(),
        changedBy: userId,
        ...auditMetadata
      });

      this.logger.info(`Restored ${this.serviceName}:`, { id: record.id });
      return record;
    } catch (error) {
      this.logger.error(`Error restoring ${this.serviceName}:`, {
        error: error.message,
        id
      });
      throw error;
    }
  }

  /**
   * Count records
   */
  async count(where = {}) {
    try {
      return await this.model.count({ where });
    } catch (error) {
      this.logger.error(`Error counting ${this.serviceName}:`, {
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = BaseService;
