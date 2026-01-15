const express = require('express');
const router = express.Router();

// Middleware
const { authenticate } = require('../../middleware/auth/authenticate');
const { authorize, checkUserType } = require('../../middleware/auth/authorize');
const validate = require('../../middleware/validation/validate');

// Controllers
const ApprovalController = require('../../controllers/approval/approval.controller');

// Validators
const approvalValidators = require('../../validators/approval.validator');

// Apply authentication to all routes
router.use(authenticate);

// ==================== APPROVAL ROUTES ====================

// Get approval statistics
router.get('/stats',
  authorize('approvals:read'),
  ApprovalController.getApprovalStats
);

// Get all approval requests (admin/super_admin)
router.get('/',
  authorize('approvals:read'),
  approvalValidators.getApprovals,
  validate,
  ApprovalController.getAllApprovalRequests
);

// Get my approval requests (vendor's own requests)
router.get('/my-requests',
  authenticate,
  approvalValidators.getApprovals,
  validate,
  ApprovalController.getMyApprovalRequests
);

// Get approval request by ID
router.get('/:id',
  authorize('approvals:read'),
  approvalValidators.idParam,
  validate,
  ApprovalController.getApprovalRequestById
);

// Review approval request (approve/reject)
router.post('/:id/review',
  authorize('approvals:review'),
  approvalValidators.reviewApproval,
  validate,
  ApprovalController.reviewApprovalRequest
);

// Cancel approval request (only requester can cancel)
router.post('/:id/cancel',
  authenticate,
  approvalValidators.cancelApproval,
  validate,
  ApprovalController.cancelApprovalRequest
);

// ==================== NOTIFICATION ROUTES ====================

// Get user notifications
router.get('/notifications/list',
  authenticate,
  approvalValidators.getNotifications,
  validate,
  ApprovalController.getUserNotifications
);

// Mark notification as read
router.put('/notifications/:id/read',
  authenticate,
  approvalValidators.idParam,
  validate,
  ApprovalController.markNotificationAsRead
);

// Mark all notifications as read
router.put('/notifications/read-all',
  authenticate,
  ApprovalController.markAllNotificationsAsRead
);

module.exports = router;
