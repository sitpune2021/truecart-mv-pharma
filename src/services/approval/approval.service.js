const {
  ApprovalRequest,
  ApprovalHistory,
  ApprovalNotification,
  User,
  sequelize
} = require('../../database/models');
const { generateUniqueSlug } = require('../../utils/slug.utils');
const { logger } = require('../../config/logger');
const { Op } = require('sequelize');

class ApprovalService {
  /**
   * Create a new approval request
   */
  static async createApprovalRequest({
    requestType,
    entityType,
    entityId = null,
    currentData = null,
    proposedData,
    changeSummary = null,
    requestReason = null,
    requestedBy,
    ipAddress = null,
    userAgent = null,
    metadata = {}
  }) {
    const transaction = await sequelize.transaction();

    try {
      // Create approval request
      const approvalRequest = await ApprovalRequest.create({
        request_type: requestType,
        entity_type: entityType,
        entity_id: entityId,
        current_data: currentData,
        proposed_data: proposedData,
        change_summary: changeSummary || this.generateChangeSummary(requestType, entityType, currentData, proposedData),
        request_reason: requestReason,
        requested_by: requestedBy,
        status: 'pending',
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata
      }, { transaction });

      // Create history entry
      await ApprovalHistory.create({
        approval_request_id: approvalRequest.id,
        action: 'submitted',
        action_by: requestedBy,
        new_status: 'pending',
        remarks: requestReason,
        data_snapshot: proposedData,
        ip_address: ipAddress,
        user_agent: userAgent
      }, { transaction });

      // Notify admins/super_admins
      await this.notifyReviewers(approvalRequest.id, 'new_request', transaction);

      await transaction.commit();

      logger.info('Approval request created', {
        requestId: approvalRequest.id,
        entityType,
        requestType,
        requestedBy
      });

      return approvalRequest;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error creating approval request', { error: error.message });
      throw error;
    }
  }

  /**
   * Review an approval request (approve/reject)
   */
  static async reviewApprovalRequest({
    requestId,
    reviewedBy,
    action, // 'approve' or 'reject'
    remarks = null,
    finalData = null, // Modified data if reviewer edits
    ipAddress = null,
    userAgent = null
  }) {
    const transaction = await sequelize.transaction();

    try {
      const approvalRequest = await ApprovalRequest.findByPk(requestId, {
        include: [
          { model: User, as: 'requester', attributes: ['id', 'full_name', 'email'] }
        ],
        transaction
      });

      if (!approvalRequest) {
        throw new Error('Approval request not found');
      }

      if (approvalRequest.status !== 'pending') {
        throw new Error(`Cannot review request with status: ${approvalRequest.status}`);
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      const previousStatus = approvalRequest.status;

      // Check if reviewer modified the data
      const dataWasModified = finalData && JSON.stringify(finalData) !== JSON.stringify(approvalRequest.proposed_data);

      // If data was modified, create a 'modified' history entry first
      if (dataWasModified) {
        await ApprovalHistory.create({
          approval_request_id: requestId,
          action: 'modified',
          action_by: reviewedBy,
          previous_status: previousStatus,
          new_status: previousStatus,
          remarks: 'Reviewer modified the proposed data before approval',
          data_snapshot: finalData,
          ip_address: ipAddress,
          user_agent: userAgent
        }, { transaction });
      }

      // Update approval request
      await approvalRequest.update({
        status: newStatus,
        reviewed_by: reviewedBy,
        reviewed_at: new Date(),
        reviewer_remarks: remarks,
        final_data: finalData || approvalRequest.proposed_data
      }, { transaction });

      // Create history entry for approval/rejection
      await ApprovalHistory.create({
        approval_request_id: requestId,
        action: action === 'approve' ? 'approved' : 'rejected',
        action_by: reviewedBy,
        previous_status: previousStatus,
        new_status: newStatus,
        remarks,
        data_snapshot: finalData || approvalRequest.proposed_data,
        ip_address: ipAddress,
        user_agent: userAgent
      }, { transaction });

      // Notify requester
      await this.notifyRequester(
        requestId,
        approvalRequest.requested_by,
        action === 'approve' ? 'approved' : 'rejected',
        transaction
      );

      await transaction.commit();

      logger.info('Approval request reviewed', {
        requestId,
        action,
        reviewedBy
      });

      // AUTO-APPLY: If approved, immediately apply changes to the database
      // This is done AFTER committing the approval to avoid nested transactions
      if (action === 'approve') {
        logger.info('Auto-applying approved changes', { requestId, entityType: approvalRequest.entity_type });

        // Import MasterDataApprovalService to apply changes
        const MasterDataApprovalService = require('./masterDataApproval.service');
        const Model = MasterDataApprovalService.entityModelMap[approvalRequest.entity_type];

        if (Model) {
          try {
            await this.applyApprovedChanges(requestId, reviewedBy, Model);
            logger.info('✅ Successfully auto-applied approved changes to database', { requestId });
          } catch (applyError) {
            logger.error('❌ Failed to auto-apply changes', { requestId, error: applyError.message, stack: applyError.stack });
            // Don't throw - approval is already done
            // Admin can manually apply later if needed
          }
        } else {
          logger.warn('⚠️  No model found for entity type, skipping auto-apply', {
            requestId,
            entityType: approvalRequest.entity_type
          });
        }
      }

      return approvalRequest;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error reviewing approval request', { error: error.message });
      throw error;
    }
  }

  /**
   * Apply approved changes to the actual entity
   */
  static async applyApprovedChanges(requestId, appliedBy, Model) {
    const transaction = await sequelize.transaction();

    try {
      const approvalRequest = await ApprovalRequest.findByPk(requestId, { transaction });

      if (!approvalRequest) {
        throw new Error('Approval request not found');
      }

      if (approvalRequest.status !== 'approved') {
        throw new Error('Only approved requests can be applied');
      }

      if (approvalRequest.is_applied) {
        throw new Error('Request has already been applied');
      }

      const dataToApply = approvalRequest.final_data || approvalRequest.proposed_data;

      // Normalize/augment data per entity to avoid apply-time errors
      const normalizedData = { ...dataToApply };

      // Normalize boolean-like strings commonly sent from forms
      const booleanKeys = ['is_active', 'is_featured', 'is_best_seller', 'is_offer', 'requires_prescription'];
      for (const key of booleanKeys) {
        if (typeof normalizedData[key] === 'string') {
          normalizedData[key] = normalizedData[key] === 'true';
        }
      }

      // Generate slugs where the entity has a name/slug field
      const slugEntities = new Set(['manufacturer', 'brand', 'category', 'product_name', 'supplier', 'product']);
      if (slugEntities.has(approvalRequest.entity_type) && normalizedData.name) {
        normalizedData.slug = await generateUniqueSlug(
          normalizedData.name,
          Model,
          approvalRequest.entity_id || undefined
        );
      }

      let result;

      // Apply changes based on request type
      switch (approvalRequest.request_type) {
        case 'create':
          result = await Model.create(normalizedData, { transaction });
          // Update approval request with the created entity ID
          await approvalRequest.update({
            entity_id: result.id
          }, { transaction });
          break;

        case 'update':
          if (!approvalRequest.entity_id) {
            throw new Error('Entity ID required for update');
          }
          const entityToUpdate = await Model.findByPk(approvalRequest.entity_id, { transaction });
          if (!entityToUpdate) {
            throw new Error('Entity not found');
          }
          result = await entityToUpdate.update(normalizedData, { transaction });
          break;

        case 'delete':
          if (!approvalRequest.entity_id) {
            throw new Error('Entity ID required for delete');
          }
          const entityToDelete = await Model.findByPk(approvalRequest.entity_id, { transaction });
          if (!entityToDelete) {
            throw new Error('Entity not found');
          }
          await entityToDelete.destroy({ transaction });
          result = entityToDelete;
          break;

        default:
          throw new Error(`Unknown request type: ${approvalRequest.request_type}`);
      }

      // Mark as applied
      await approvalRequest.update({
        is_applied: true,
        applied_at: new Date(),
        applied_by: appliedBy
      }, { transaction });

      // Create history entry
      await ApprovalHistory.create({
        approval_request_id: requestId,
        action: 'applied',
        action_by: appliedBy,
        remarks: 'Changes applied to database',
        data_snapshot: normalizedData
      }, { transaction });

      await transaction.commit();

      logger.info('Approval changes applied', {
        requestId,
        entityType: approvalRequest.entity_type,
        requestType: approvalRequest.request_type
      });

      return result;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error applying approved changes', { error: error.message });
      throw error;
    }
  }

  /**
   * Cancel an approval request
   */
  static async cancelApprovalRequest(requestId, cancelledBy, reason = null) {
    const transaction = await sequelize.transaction();

    try {
      const approvalRequest = await ApprovalRequest.findByPk(requestId, { transaction });

      if (!approvalRequest) {
        throw new Error('Approval request not found');
      }

      if (approvalRequest.status !== 'pending') {
        throw new Error('Only pending requests can be cancelled');
      }

      if (approvalRequest.requested_by !== cancelledBy) {
        throw new Error('Only the requester can cancel their request');
      }

      const previousStatus = approvalRequest.status;

      await approvalRequest.update({
        status: 'cancelled'
      }, { transaction });

      await ApprovalHistory.create({
        approval_request_id: requestId,
        action: 'cancelled',
        action_by: cancelledBy,
        previous_status: previousStatus,
        new_status: 'cancelled',
        remarks: reason
      }, { transaction });

      await transaction.commit();

      logger.info('Approval request cancelled', { requestId, cancelledBy });

      return approvalRequest;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error cancelling approval request', { error: error.message });
      throw error;
    }
  }

  /**
   * Get approval requests with filters
   */
  static async getApprovalRequests({
    page = 1,
    limit = 20,
    status = null,
    entityType = null,
    requestType = null,
    requestedBy = null,
    reviewedBy = null,
    isApplied = null
  }) {
    const where = {};

    if (status) where.status = status;
    if (entityType) where.entity_type = entityType;
    if (requestType) where.request_type = requestType;
    if (requestedBy) where.requested_by = requestedBy;
    if (reviewedBy) where.reviewed_by = reviewedBy;
    if (isApplied !== null) where.is_applied = isApplied;

    const offset = (page - 1) * limit;

    const { count, rows } = await ApprovalRequest.findAndCountAll({
      where,
      include: [
        { model: User, as: 'requester', attributes: ['id', 'full_name', 'email', 'user_type'] },
        { model: User, as: 'reviewer', attributes: ['id', 'full_name', 'email', 'user_type'] },
        { model: User, as: 'applier', attributes: ['id', 'full_name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    return {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get approval request by ID with full details
   */
  static async getApprovalRequestById(requestId) {
    const approvalRequest = await ApprovalRequest.findByPk(requestId, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'full_name', 'email', 'user_type'] },
        { model: User, as: 'reviewer', attributes: ['id', 'full_name', 'email', 'user_type'] },
        { model: User, as: 'applier', attributes: ['id', 'full_name', 'email'] },
        {
          model: ApprovalHistory,
          as: 'history',
          include: [
            { model: User, as: 'actor', attributes: ['id', 'full_name', 'email'] }
          ],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    return approvalRequest;
  }

  /**
   * Get approval statistics
   */
  static async getApprovalStats(userId = null, userType = null) {
    const where = {};

    // If vendor, show only their requests
    if (userType === 'vendor' && userId) {
      where.requested_by = userId;
    }

    const [pending, approved, rejected, cancelled] = await Promise.all([
      ApprovalRequest.count({ where: { ...where, status: 'pending' } }),
      ApprovalRequest.count({ where: { ...where, status: 'approved' } }),
      ApprovalRequest.count({ where: { ...where, status: 'rejected' } }),
      ApprovalRequest.count({ where: { ...where, status: 'cancelled' } })
    ]);

    const byEntityType = await ApprovalRequest.findAll({
      where,
      attributes: [
        'entity_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['entity_type']
    });

    return {
      total: pending + approved + rejected + cancelled,
      pending,
      approved,
      rejected,
      cancelled,
      byEntityType: byEntityType.map(item => ({
        entityType: item.entity_type,
        count: parseInt(item.get('count'))
      }))
    };
  }

  /**
   * Notify reviewers (admins/super_admins) about new request
   */
  static async notifyReviewers(requestId, notificationType, transaction) {
    // Get all admin and super_admin users
    const reviewers = await User.findAll({
      where: {
        user_type: { [Op.in]: ['admin', 'super_admin'] },
        is_active: true
      },
      attributes: ['id'],
      transaction
    });

    const approvalRequest = await ApprovalRequest.findByPk(requestId, {
      include: [{ model: User, as: 'requester', attributes: ['full_name'] }],
      transaction
    });

    const notifications = reviewers.map(reviewer => ({
      approval_request_id: requestId,
      recipient_id: reviewer.id,
      notification_type: notificationType,
      title: `New ${approvalRequest.entity_type} ${approvalRequest.request_type} request`,
      message: `${approvalRequest.requester.full_name} submitted a ${approvalRequest.request_type} request for ${approvalRequest.entity_type}`,
      metadata: {
        entity_type: approvalRequest.entity_type,
        request_type: approvalRequest.request_type
      }
    }));

    await ApprovalNotification.bulkCreate(notifications, { transaction });
  }

  /**
   * Notify requester about approval decision
   */
  static async notifyRequester(requestId, requesterId, notificationType, transaction) {
    const approvalRequest = await ApprovalRequest.findByPk(requestId, {
      include: [{ model: User, as: 'reviewer', attributes: ['full_name'] }],
      transaction
    });

    await ApprovalNotification.create({
      approval_request_id: requestId,
      recipient_id: requesterId,
      notification_type: notificationType,
      title: `Your ${approvalRequest.entity_type} request was ${notificationType}`,
      message: approvalRequest.reviewer_remarks || `Your ${approvalRequest.request_type} request has been ${notificationType}`,
      metadata: {
        entity_type: approvalRequest.entity_type,
        request_type: approvalRequest.request_type,
        status: notificationType
      }
    }, { transaction });
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
    const where = { recipient_id: userId };
    if (unreadOnly) where.is_read = false;

    const offset = (page - 1) * limit;

    const { count, rows } = await ApprovalNotification.findAndCountAll({
      where,
      include: [
        {
          model: ApprovalRequest,
          as: 'approvalRequest',
          attributes: ['id', 'entity_type', 'request_type', 'status']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    };
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId, userId) {
    const notification = await ApprovalNotification.findOne({
      where: { id: notificationId, recipient_id: userId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.update({
      is_read: true,
      read_at: new Date()
    });

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  static async markAllNotificationsAsRead(userId) {
    await ApprovalNotification.update(
      { is_read: true, read_at: new Date() },
      { where: { recipient_id: userId, is_read: false } }
    );
  }

  /**
   * Generate human-readable change summary
   */
  static generateChangeSummary(requestType, entityType, currentData, proposedData) {
    switch (requestType) {
      case 'create':
        return `Create new ${entityType}: ${proposedData.name || proposedData.title || 'N/A'}`;
      case 'update':
        return `Update ${entityType}: ${proposedData.name || proposedData.title || 'N/A'}`;
      case 'delete':
        return `Delete ${entityType}: ${currentData?.name || currentData?.title || 'N/A'}`;
      default:
        return `${requestType} ${entityType}`;
    }
  }
}

module.exports = ApprovalService;
