const ApprovalService = require('./approval.service');
const {
  Manufacturer,
  Brand,
  Category,
  ProductName,
  Salt,
  Dosage,
  UnitType,
  Attribute,
  GST,
  Supplier,
  Product
} = require('../../database/models');

/**
 * Master Data Approval Service
 * Handles approval workflow for master data changes by vendors
 */
class MasterDataApprovalService {

  // Map entity types to their models
  static entityModelMap = {
    'manufacturer': Manufacturer,
    'brand': Brand,
    'category': Category,
    'product_name': ProductName,
    'salt': Salt,
    'dosage': Dosage,
    'unit_type': UnitType,
    'attribute': Attribute,
    'gst': GST,
    'supplier': Supplier,
    'product': Product
  };

  /**
   * Check if user needs approval for master data changes
   * Users with 'approvals:review' permission can make direct changes
   * Others need approval
   */
  static requiresApproval(userPermissions) {
    // If user has approval review permission, they can bypass approval
    return !userPermissions || !userPermissions.includes('approvals:review');
  }

  /**
   * Create master data record (with approval if vendor)
   */
  static async createMasterData({
    entityType,
    data,
    userId,
    userPermissions,
    requestReason = null,
    ipAddress = null,
    userAgent = null
  }) {
    const Model = this.entityModelMap[entityType];
    if (!Model) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    // If user has approval review permission, create directly
    if (!this.requiresApproval(userPermissions)) {
      return await Model.create({
        ...data,
        created_by: userId,
        updated_by: userId
      });
    }

    // Otherwise, create approval request
    const approvalRequest = await ApprovalService.createApprovalRequest({
      requestType: 'create',
      entityType,
      entityId: null,
      currentData: null,
      proposedData: {
        ...data,
        created_by: userId,
        updated_by: userId
      },
      requestReason,
      requestedBy: userId,
      ipAddress,
      userAgent,
      metadata: { userPermissions }
    });

    return {
      requiresApproval: true,
      approvalRequest,
      message: 'Your request has been submitted for approval'
    };
  }

  /**
   * Update master data record (with approval if vendor)
   */
  static async updateMasterData({
    entityType,
    entityId,
    data,
    userId,
    userPermissions,
    requestReason = null,
    ipAddress = null,
    userAgent = null
  }) {
    const Model = this.entityModelMap[entityType];
    if (!Model) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    // Get current data
    const currentRecord = await Model.findByPk(entityId);
    if (!currentRecord) {
      throw new Error(`${entityType} not found`);
    }

    // If user has approval review permission, update directly
    if (!this.requiresApproval(userPermissions)) {
      return await currentRecord.update({
        ...data,
        updated_by: userId
      });
    }

    // Otherwise, create approval request
    const approvalRequest = await ApprovalService.createApprovalRequest({
      requestType: 'update',
      entityType,
      entityId,
      currentData: currentRecord.toJSON(),
      proposedData: {
        ...data,
        updated_by: userId
      },
      requestReason,
      requestedBy: userId,
      ipAddress,
      userAgent,
      metadata: { userId }
    });

    return {
      requiresApproval: true,
      approvalRequest,
      message: 'Your update request has been submitted for approval'
    };
  }

  /**
   * Delete master data record (with approval if vendor)
   */
  static async deleteMasterData({
    entityType,
    entityId,
    userId,
    userPermissions,
    requestReason = null,
    ipAddress = null,
    userAgent = null
  }) {
    const Model = this.entityModelMap[entityType];
    if (!Model) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    // Get current data
    const currentRecord = await Model.findByPk(entityId);
    if (!currentRecord) {
      throw new Error(`${entityType} not found`);
    }

    // If user has approval review permission, delete directly
    if (!this.requiresApproval(userPermissions)) {
      await currentRecord.update({ deleted_by: userId });
      await currentRecord.destroy();
      return currentRecord;
    }

    // Otherwise, create approval request
    const approvalRequest = await ApprovalService.createApprovalRequest({
      requestType: 'delete',
      entityType,
      entityId,
      currentData: currentRecord.toJSON(),
      proposedData: {
        deleted_by: userId
      },
      requestReason,
      requestedBy: userId,
      ipAddress,
      userAgent,
      metadata: { userId }
    });

    return {
      requiresApproval: true,
      approvalRequest,
      message: 'Your delete request has been submitted for approval'
    };
  }

  /**
   * Apply approved changes to master data
   */
  static async applyApprovedChanges(approvalRequestId, appliedBy) {
    const approvalRequest = await ApprovalService.getApprovalRequestById(approvalRequestId);

    if (!approvalRequest) {
      throw new Error('Approval request not found');
    }

    const Model = this.entityModelMap[approvalRequest.entity_type];
    if (!Model) {
      throw new Error(`Unknown entity type: ${approvalRequest.entity_type}`);
    }

    return await ApprovalService.applyApprovedChanges(approvalRequestId, appliedBy, Model);
  }

  /**
   * Get entity model by type
   */
  static getModel(entityType) {
    return this.entityModelMap[entityType];
  }
}

module.exports = MasterDataApprovalService;
