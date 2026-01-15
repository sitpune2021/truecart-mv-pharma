const BaseController = require('../../utils/baseController');
const ApprovalService = require('../../services/approval/approval.service');
const ResponseUtil = require('../../utils/response.util');

class ApprovalController extends BaseController {
  constructor() {
    super('ApprovalController');
  }

  /**
   * Get all approval requests with filters
   */
  getAllApprovalRequests = this.asyncHandler(async (req, res) => {
    const {
      page,
      limit,
      status,
      entityType,
      requestType,
      requestedBy,
      reviewedBy,
      isApplied
    } = req.query;

    const result = await ApprovalService.getApprovalRequests({
      page,
      limit,
      status,
      entityType,
      requestType,
      requestedBy,
      reviewedBy,
      isApplied: isApplied === 'true' ? true : isApplied === 'false' ? false : null
    });

    return this.sendPaginatedResponse(
      res,
      result.data,
      result.pagination,
      'Approval requests retrieved successfully'
    );
  });

  /**
   * Get approval request by ID
   */
  getApprovalRequestById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const approvalRequest = await ApprovalService.getApprovalRequestById(id);

    if (!approvalRequest) {
      return ResponseUtil.notFound(res, 'Approval request not found');
    }

    return this.sendSuccess(res, approvalRequest, 'Approval request retrieved successfully');
  });

  /**
   * Review approval request (approve/reject)
   */
  reviewApprovalRequest = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action, remarks, finalData } = req.body;
    const reviewedBy = req.user.id;

    if (!['approve', 'reject'].includes(action)) {
      return ResponseUtil.badRequest(res, 'Action must be either approve or reject');
    }

    const approvalRequest = await ApprovalService.reviewApprovalRequest({
      requestId: id,
      reviewedBy,
      action,
      remarks,
      finalData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await this.logActivity(
      req,
      'APPROVAL_REVIEW',
      `${action === 'approve' ? 'Approved' : 'Rejected'} ${approvalRequest.entity_type} request`,
      'SUCCESS',
      { requestId: id, action }
    );

    return this.sendSuccess(
      res,
      approvalRequest,
      `Approval request ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    );
  });

  /**
   * Cancel approval request
   */
  cancelApprovalRequest = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const approvalRequest = await ApprovalService.cancelApprovalRequest(id, userId, reason);

    await this.logActivity(
      req,
      'APPROVAL_CANCEL',
      `Cancelled approval request for ${approvalRequest.entity_type}`,
      'SUCCESS',
      { requestId: id }
    );

    return this.sendSuccess(res, approvalRequest, 'Approval request cancelled successfully');
  });

  /**
   * Get approval statistics
   */
  getApprovalStats = this.asyncHandler(async (req, res) => {
    const userId = req.user.user_type === 'vendor' ? req.user.id : null;
    const stats = await ApprovalService.getApprovalStats(userId, req.user.user_type);

    return this.sendSuccess(res, stats, 'Approval statistics retrieved successfully');
  });

  /**
   * Get user's approval requests (for vendors to see their own requests)
   */
  getMyApprovalRequests = this.asyncHandler(async (req, res) => {
    const { page, limit, status, entityType } = req.query;
    const userId = req.user.id;

    const result = await ApprovalService.getApprovalRequests({
      page,
      limit,
      status,
      entityType,
      requestedBy: userId
    });

    return this.sendPaginatedResponse(
      res,
      result.data,
      result.pagination,
      'Your approval requests retrieved successfully'
    );
  });

  /**
   * Get user notifications
   */
  getUserNotifications = this.asyncHandler(async (req, res) => {
    const { page, limit, unreadOnly } = req.query;
    const userId = req.user.id;

    const result = await ApprovalService.getUserNotifications(userId, {
      page,
      limit,
      unreadOnly: unreadOnly === 'true'
    });

    return this.sendPaginatedResponse(
      res,
      result.data,
      result.pagination,
      'Notifications retrieved successfully'
    );
  });

  /**
   * Mark notification as read
   */
  markNotificationAsRead = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await ApprovalService.markNotificationAsRead(id, userId);

    return this.sendSuccess(res, notification, 'Notification marked as read');
  });

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead = this.asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await ApprovalService.markAllNotificationsAsRead(userId);

    return this.sendSuccess(res, null, 'All notifications marked as read');
  });
}

module.exports = new ApprovalController();
