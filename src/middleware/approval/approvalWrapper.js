const MasterDataApprovalService = require('../../services/approval/masterDataApproval.service');
const ResponseUtil = require('../../utils/response.util');

/**
 * Middleware wrapper for master data operations that require approval
 * Intercepts vendor requests and routes them through approval workflow
 */

/**
 * Wrap create operation with approval logic
 */
const wrapCreate = (entityType, createHandler) => {
  return async (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    const userId = req.user.id;

    // If user doesn't have approval review permission, use approval workflow
    if (MasterDataApprovalService.requiresApproval(userPermissions)) {
      try {
        const result = await MasterDataApprovalService.createMasterData({
          entityType,
          data: req.body,
          userId,
          userPermissions,
          requestReason: req.body.request_reason,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(202).json({
          success: true,
          message: result.message,
          data: result.approvalRequest,
          requiresApproval: true
        });
      } catch (error) {
        return next(error);
      }
    }

    // If user has approval review permission, proceed with normal handler
    return createHandler(req, res, next);
  };
};

/**
 * Wrap update operation with approval logic
 */
const wrapUpdate = (entityType, updateHandler) => {
  return async (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    const userId = req.user.id;
    const entityId = req.params.id;

    // If user doesn't have approval review permission, use approval workflow
    if (MasterDataApprovalService.requiresApproval(userPermissions)) {
      try {
        const result = await MasterDataApprovalService.updateMasterData({
          entityType,
          entityId,
          data: req.body,
          userId,
          userPermissions,
          requestReason: req.body.request_reason,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(202).json({
          success: true,
          message: result.message,
          data: result.approvalRequest,
          requiresApproval: true
        });
      } catch (error) {
        return next(error);
      }
    }

    // If user has approval review permission, proceed with normal handler
    return updateHandler(req, res, next);
  };
};

/**
 * Wrap delete operation with approval logic
 */
const wrapDelete = (entityType, deleteHandler) => {
  return async (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    const userId = req.user.id;
    const entityId = req.params.id;

    // If user doesn't have approval review permission, use approval workflow
    if (MasterDataApprovalService.requiresApproval(userPermissions)) {
      try {
        const result = await MasterDataApprovalService.deleteMasterData({
          entityType,
          entityId,
          userId,
          userPermissions,
          requestReason: req.body.request_reason,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(202).json({
          success: true,
          message: result.message,
          data: result.approvalRequest,
          requiresApproval: true
        });
      } catch (error) {
        return next(error);
      }
    }

    // If user has approval review permission, proceed with normal handler
    return deleteHandler(req, res, next);
  };
};

/**
 * Apply approved changes after admin approval
 */
const applyApprovedChanges = async (req, res, next) => {
  try {
    const { approvalRequestId } = req.params;
    const appliedBy = req.user.id;

    const result = await MasterDataApprovalService.applyApprovedChanges(
      approvalRequestId,
      appliedBy
    );

    return ResponseUtil.success(res, result, 'Approved changes applied successfully');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  wrapCreate,
  wrapUpdate,
  wrapDelete,
  applyApprovedChanges
};
