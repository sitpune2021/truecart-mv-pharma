const { body, param, query } = require('express-validator');

const inventoryValidators = {
  addProduct: [
    body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
    body('total_stock').isInt({ min: 0 }).withMessage('Total stock must be a non-negative integer'),
    body('online_stock').isInt({ min: 0 }).withMessage('Online stock must be a non-negative integer'),
    body('offline_stock').isInt({ min: 0 }).withMessage('Offline stock must be a non-negative integer'),
    body('low_stock_threshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a non-negative integer')
  ],

  restock: [
    param('id').isInt({ min: 1 }).withMessage('Valid inventory ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    body('online_percentage').optional().isInt({ min: 0, max: 100 }).withMessage('Online percentage must be between 0 and 100'),
    body('notes').optional().isString().trim()
  ],

  adjustAllocation: [
    param('id').isInt({ min: 1 }).withMessage('Valid inventory ID is required'),
    body('online_stock').isInt({ min: 0 }).withMessage('Online stock must be a non-negative integer'),
    body('offline_stock').isInt({ min: 0 }).withMessage('Offline stock must be a non-negative integer'),
    body('notes').optional().isString().trim()
  ],

  updateSettings: [
    param('id').isInt({ min: 1 }).withMessage('Valid inventory ID is required'),
    body('low_stock_threshold').isInt({ min: 0 }).withMessage('Low stock threshold must be a non-negative integer')
  ],

  getInventory: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().trim(),
    query('lowStockOnly').optional().isBoolean().withMessage('lowStockOnly must be boolean'),
    query('sortBy').optional().isIn(['created_at', 'total_stock', 'name']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC')
  ],

  getLogs: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('product_id').optional().isInt({ min: 1 }).withMessage('Valid product ID required'),
    query('transaction_type').optional().isIn(['restock', 'sale', 'offline_sale', 'adjustment', 'allocation_change', 'damage', 'return', 'transfer']).withMessage('Invalid transaction type'),
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO8601 date')
  ]
};

module.exports = inventoryValidators;
