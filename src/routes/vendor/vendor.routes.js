const express = require('express');
const router = express.Router();

// Middleware
const { authenticate } = require('../../middleware/auth/authenticate');
const { authorize } = require('../../middleware/auth/authorize');
const validate = require('../../middleware/validation/validate');

// Controllers
const VendorInventoryController = require('../../controllers/vendor/inventory.controller');

// Validators
const inventoryValidators = require('../../validators/inventory.validator');
const { commonValidators } = require('../../validators/admin.validator');

// Apply authentication to all vendor routes
router.use(authenticate);

// ==================== INVENTORY ROUTES ====================

// Get vendor's inventory list
router.get('/inventory',
  authorize('inventory:read'),
  inventoryValidators.getInventory,
  validate,
  VendorInventoryController.getInventory
);

// Get low stock items
router.get('/inventory/low-stock',
  authorize('inventory:read'),
  VendorInventoryController.getLowStock
);

// Get inventory logs
router.get('/inventory/logs',
  authorize('inventory:read'),
  inventoryValidators.getLogs,
  validate,
  VendorInventoryController.getLogs
);

// Get single inventory item
router.get('/inventory/:id',
  authorize('inventory:read'),
  commonValidators.idParam,
  validate,
  VendorInventoryController.getInventoryItem
);

// Add product to inventory
router.post('/inventory',
  authorize('inventory:create'),
  inventoryValidators.addProduct,
  validate,
  VendorInventoryController.addProduct
);

// Restock inventory
router.post('/inventory/:id/restock',
  authorize('inventory:update'),
  inventoryValidators.restock,
  validate,
  VendorInventoryController.restock
);

// Adjust stock allocation
router.put('/inventory/:id/allocation',
  authorize('inventory:update'),
  inventoryValidators.adjustAllocation,
  validate,
  VendorInventoryController.adjustAllocation
);

// Update inventory settings
router.put('/inventory/:id/settings',
  authorize('inventory:update'),
  inventoryValidators.updateSettings,
  validate,
  VendorInventoryController.updateSettings
);

// Remove product from inventory
router.delete('/inventory/:id',
  authorize('inventory:delete'),
  commonValidators.idParam,
  validate,
  VendorInventoryController.removeProduct
);

module.exports = router;
