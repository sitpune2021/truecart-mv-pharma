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
    body('sku').optional().trim(),
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('brand').optional().trim(),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('cost_price').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
    body('mrp').optional().isFloat({ min: 0 }).withMessage('MRP must be a positive number'),
    body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a positive integer'),
    body('low_stock_threshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a positive integer'),
    body('unit').optional().trim(),
    body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
    body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
    body('is_featured').optional().isBoolean().withMessage('is_featured must be boolean'),
    body('is_best_seller').optional().isBoolean().withMessage('is_best_seller must be boolean'),
    body('is_offer').optional().isBoolean().withMessage('is_offer must be boolean'),
    body('requires_prescription').optional().isBoolean().withMessage('requires_prescription must be boolean')
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid product ID'),
    body('sku').optional().trim(),
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('brand').optional().trim(),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('cost_price').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
    body('mrp').optional().isFloat({ min: 0 }).withMessage('MRP must be a positive number'),
    body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a positive integer'),
    body('low_stock_threshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a positive integer'),
    body('unit').optional().trim(),
    body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
    body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
    body('is_featured').optional().isBoolean().withMessage('is_featured must be boolean'),
    body('is_best_seller').optional().isBoolean().withMessage('is_best_seller must be boolean'),
    body('is_offer').optional().isBoolean().withMessage('is_offer must be boolean'),
    body('requires_prescription').optional().isBoolean().withMessage('requires_prescription must be boolean')
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
