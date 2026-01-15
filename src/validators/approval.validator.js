const { body, param, query } = require('express-validator');

const approvalValidators = {
  // Get approvals with filters
  getApprovals: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['pending', 'approved', 'rejected', 'cancelled'])
      .withMessage('Invalid status'),
    query('entityType')
      .optional()
      .isString()
      .withMessage('Entity type must be a string'),
    query('requestType')
      .optional()
      .isIn(['create', 'update', 'delete'])
      .withMessage('Invalid request type'),
    query('requestedBy')
      .optional()
      .isInt()
      .withMessage('Requested by must be an integer'),
    query('reviewedBy')
      .optional()
      .isInt()
      .withMessage('Reviewed by must be an integer'),
    query('isApplied')
      .optional()
      .isBoolean()
      .withMessage('Is applied must be a boolean')
  ],

  // Review approval
  reviewApproval: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    body('action')
      .notEmpty()
      .withMessage('Action is required')
      .isIn(['approve', 'reject'])
      .withMessage('Action must be either approve or reject'),
    body('remarks')
      .optional()
      .isString()
      .withMessage('Remarks must be a string'),
    body('finalData')
      .optional()
      .isObject()
      .withMessage('Final data must be an object')
  ],

  // Cancel approval
  cancelApproval: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    body('reason')
      .optional()
      .isString()
      .withMessage('Reason must be a string')
  ],

  // Get notifications
  getNotifications: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('unreadOnly')
      .optional()
      .isBoolean()
      .withMessage('Unread only must be a boolean')
  ],

  // ID param
  idParam: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer')
  ]
};

module.exports = approvalValidators;
