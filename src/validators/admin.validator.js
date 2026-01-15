const { body, param, query } = require('express-validator');

const userValidators = {
  create: [
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
    body('full_name').notEmpty().withMessage('Full name is required').trim(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('user_type').isIn(['super_admin', 'admin', 'vendor', 'delivery_agent']).withMessage('Invalid user type'),
    body('roles').optional().isArray().withMessage('Roles must be an array')
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
    body('full_name').optional().trim(),
    body('user_type').optional().isIn(['super_admin', 'admin', 'vendor', 'delivery_agent']).withMessage('Invalid user type'),
    body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
    body('roles').optional().isArray().withMessage('Roles must be an array')
  ],
  assignRoles: [
    param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
    body('roleIds').isArray({ min: 1 }).withMessage('At least one role is required'),
    body('roleIds.*').isInt({ min: 1 }).withMessage('Invalid role ID')
  ]
};

const roleValidators = {
  create: [
    body('name').notEmpty().withMessage('Role name is required').trim(),
    body('display_name').optional().trim(),
    body('description').optional().trim(),
    body('permissions').optional().isArray().withMessage('Permissions must be an array'),
    body('permissions.*').isInt({ min: 1 }).withMessage('Invalid permission ID')
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid role ID'),
    body('name').optional().trim(),
    body('display_name').optional().trim(),
    body('description').optional().trim(),
    body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
    body('permissions').optional().isArray().withMessage('Permissions must be an array'),
    body('permissions.*').isInt({ min: 1 }).withMessage('Invalid permission ID')
  ],
  assignPermissions: [
    param('id').isInt({ min: 1 }).withMessage('Invalid role ID'),
    body('permissionIds').isArray({ min: 1 }).withMessage('At least one permission is required'),
    body('permissionIds.*').isInt({ min: 1 }).withMessage('Invalid permission ID')
  ]
};

const permissionValidators = {
  create: [
    body('name').notEmpty().withMessage('Permission name is required').trim(),
    body('module').notEmpty().withMessage('Module is required').trim(),
    body('action').notEmpty().withMessage('Action is required').trim(),
    body('scope').optional().trim(),
    body('display_name').optional().trim(),
    body('description').optional().trim()
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid permission ID'),
    body('name').optional().trim(),
    body('module').optional().trim(),
    body('action').optional().trim(),
    body('scope').optional().trim(),
    body('display_name').optional().trim(),
    body('description').optional().trim(),
    body('is_active').optional().isBoolean().withMessage('is_active must be boolean')
  ]
};

const productValidators = {
  create: [
    body('productName').notEmpty().withMessage('Product name is required').trim(),
    body('brand').optional().isInt({ min: 1 }).withMessage('Invalid Brand ID'),
    body('manufacturer_id').optional().isInt({ min: 1 }).withMessage('Invalid Manufacturer ID'),
    body('categoryLevel1').optional().isInt({ min: 1 }).withMessage('Invalid Category Level 1 ID'),
    body('categoryLevel2').optional().isInt({ min: 1 }).withMessage('Invalid Category Level 2 ID'),
    body('categoryLevel3').optional().isInt({ min: 1 }).withMessage('Invalid Category Level 3 ID'),
    body('dosageForm').optional().isInt({ min: 1 }).withMessage('Invalid Dosage Form ID'),
    body('prescriptionRequired').optional().isBoolean().withMessage('Prescription Required must be a boolean'),
    body('shortDescription').optional().trim(),
    body('fullDescription').optional().trim(),
    body('gstRate').optional().isInt({ min: 1 }).withMessage('Invalid GST Rate ID'),
    body('discountType').optional().isIn(['percentage', 'flat']).withMessage('Invalid discount type'),
    body('discountValue').optional().isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
    body('variants').optional().isJSON().withMessage('Variants must be a valid JSON string'),
    body('salt').optional().isArray().withMessage('Salt must be an array of IDs'),
    body('salt.*').optional().isInt({ min: 1 }).withMessage('Invalid Salt ID'),
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid product ID'),
    body('productName').optional().trim(),
    body('brand').optional().isInt({ min: 1 }).withMessage('Invalid Brand ID'),
    body('categoryLevel1').optional().isInt({ min: 1 }).withMessage('Invalid Category Level 1 ID'),
    body('categoryLevel2').optional().isInt({ min: 1 }).withMessage('Invalid Category Level 2 ID'),
    body('categoryLevel3').optional().isInt({ min: 1 }).withMessage('Invalid Category Level 3 ID'),
    body('dosageForm').optional().isInt({ min: 1 }).withMessage('Invalid Dosage Form ID'),
    body('prescriptionRequired').optional().isBoolean().withMessage('Prescription Required must be a boolean'),
    body('shortDescription').optional().trim(),
    body('fullDescription').optional().trim(),
    body('gstRate').optional().isInt({ min: 1 }).withMessage('Invalid GST Rate ID'),
    body('discountType').optional().isIn(['percentage', 'flat']).withMessage('Invalid discount type'),
    body('discountValue').optional().isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
    body('variants').optional().isJSON().withMessage('Variants must be a valid JSON string'),
    body('salt').optional().isArray().withMessage('Salt must be an array of IDs'),
    body('salt.*').optional().isInt({ min: 1 }).withMessage('Invalid Salt ID'),
  ],
  updateStock: [
    param('id').isInt({ min: 1 }).withMessage('Invalid product ID'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive integer')
  ]
};

const commonValidators = {
  idParam: [
    param('id').isInt({ min: 1 }).withMessage('Invalid ID format')
  ],
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ]
};

module.exports = {
  userValidators,
  roleValidators,
  permissionValidators,
  productValidators,
  commonValidators
};
