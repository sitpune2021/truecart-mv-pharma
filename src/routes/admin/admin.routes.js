const express = require('express');
const router = express.Router();

// Middleware
const { authenticate } = require('../../middleware/auth/authenticate');
const { authorize } = require('../../middleware/auth/authorize');
const validate = require('../../middleware/validation/validate');
const { uploadMultiple } = require('../../middleware/upload/imageUpload');

// Controllers
const UserController = require('../../controllers/admin/user.controller');
const RoleController = require('../../controllers/admin/role.controller');
const PermissionController = require('../../controllers/admin/permission.controller');
const ProductController = require('../../controllers/admin/product.controller');
const InventoryController = require('../../controllers/admin/inventory.controller');

// Master Data Routes
const mastersRoutes = require('./masters.routes');

// Validators
const {
  userValidators,
  roleValidators,
  permissionValidators,
  productValidators,
  commonValidators
} = require('../../validators/admin.validator');
const inventoryValidators = require('../../validators/inventory.validator');

// Apply authentication to all routes
router.use(authenticate);

// ==================== MASTER DATA ROUTES ====================
router.use('/masters', mastersRoutes);

// ==================== USER ROUTES ====================
router.get('/users/stats', 
  authorize('users:read'),
  UserController.getUserStats
);

router.get('/users', 
  authorize('users:read'),
  commonValidators.pagination,
  validate,
  UserController.getAllUsers
);

router.get('/users/:id', 
  authorize('users:read'),
  commonValidators.idParam,
  validate,
  UserController.getUserById
);

router.post('/users', 
  authorize('users:create'),
  userValidators.create,
  validate,
  UserController.createUser
);

router.put('/users/:id', 
  authorize('users:update'),
  userValidators.update,
  validate,
  UserController.updateUser
);

router.delete('/users/:id', 
  authorize('users:delete'),
  commonValidators.idParam,
  validate,
  UserController.deactivateUser
);

router.post('/users/:id/reactivate', 
  authorize('users:update'),
  commonValidators.idParam,
  validate,
  UserController.reactivateUser
);

router.post('/users/:id/roles', 
  authorize('users:update'),
  userValidators.assignRoles,
  validate,
  UserController.assignRoles
);

// ==================== ROLE ROUTES ====================
router.get('/roles/stats', 
  authorize('roles:read'),
  RoleController.getRoleStats
);

router.get('/roles', 
  authorize('roles:read'),
  commonValidators.pagination,
  validate,
  RoleController.getAllRoles
);

router.get('/roles/:id', 
  authorize('roles:read'),
  commonValidators.idParam,
  validate,
  RoleController.getRoleById
);

router.post('/roles', 
  authorize('roles:create'),
  roleValidators.create,
  validate,
  RoleController.createRole
);

router.put('/roles/:id', 
  authorize('roles:update'),
  roleValidators.update,
  validate,
  RoleController.updateRole
);

router.delete('/roles/:id', 
  authorize('roles:delete'),
  commonValidators.idParam,
  validate,
  RoleController.deleteRole
);

router.post('/roles/:id/permissions', 
  authorize('roles:update'),
  roleValidators.assignPermissions,
  validate,
  RoleController.assignPermissions
);

// ==================== PERMISSION ROUTES ====================
router.get('/permissions/stats', 
  authorize('permissions:read'),
  PermissionController.getPermissionStats
);

router.get('/permissions/by-module', 
  authorize('permissions:read'),
  PermissionController.getPermissionsByModule
);

router.get('/permissions', 
  authorize('permissions:read'),
  commonValidators.pagination,
  validate,
  PermissionController.getAllPermissions
);

router.get('/permissions/:id', 
  authorize('permissions:read'),
  commonValidators.idParam,
  validate,
  PermissionController.getPermissionById
);

router.post('/permissions', 
  authorize('permissions:create'),
  permissionValidators.create,
  validate,
  PermissionController.createPermission
);

router.put('/permissions/:id', 
  authorize('permissions:update'),
  permissionValidators.update,
  validate,
  PermissionController.updatePermission
);

router.delete('/permissions/:id', 
  authorize('permissions:delete'),
  commonValidators.idParam,
  validate,
  PermissionController.deletePermission
);

// ==================== PRODUCT ROUTES ====================
router.get('/products/stats', 
  authorize('products:read'),
  ProductController.getProductStats
);

router.get('/products/categories', 
  authorize('products:read'),
  ProductController.getCategories
);

router.get('/products/brands', 
  authorize('products:read'),
  ProductController.getBrands
);

router.get('/products', 
  authorize('products:read'),
  commonValidators.pagination,
  validate,
  ProductController.getAllProducts
);

router.get('/products/:id', 
  authorize('products:read'),
  commonValidators.idParam,
  validate,
  ProductController.getProductById
);

router.post('/products', 
  authorize('products:create'),
  uploadMultiple,
  productValidators.create,
  validate,
  ProductController.createProduct
);

router.put('/products/:id', 
  authorize('products:update'),
  uploadMultiple,
  productValidators.update,
  validate,
  ProductController.updateProduct
);

router.delete('/products/:id', 
  authorize('products:delete'),
  commonValidators.idParam,
  validate,
  ProductController.deleteProduct
);

router.put('/products/:id/stock', 
  authorize('products:update'),
  productValidators.updateStock,
  validate,
  ProductController.updateStock
);

router.delete('/products/:id/images', 
  authorize('products:update'),
  commonValidators.idParam,
  validate,
  ProductController.deleteProductImage
);

// ==================== INVENTORY ROUTES ====================

// Get inventory statistics
router.get('/inventory/stats',
  authorize('inventory:read'),
  InventoryController.getStats
);

// Get all low stock items
router.get('/inventory/low-stock',
  authorize('inventory:read'),
  inventoryValidators.getInventory,
  validate,
  InventoryController.getLowStockItems
);

// Get inventory activity logs
router.get('/inventory/logs',
  authorize('inventory:read'),
  inventoryValidators.getLogs,
  validate,
  InventoryController.getLogs
);

// Get aggregated inventory
router.get('/inventory/aggregated',
  authorize('inventory:read'),
  inventoryValidators.getInventory,
  validate,
  InventoryController.getAggregatedInventory
);

// Get product inventory by vendor
router.get('/inventory/products/:productId/vendors',
  authorize('inventory:read'),
  commonValidators.idParam,
  validate,
  InventoryController.getProductByVendor
);

// Get vendor inventory summary
router.get('/inventory/vendors/:vendorId/summary',
  authorize('inventory:read'),
  commonValidators.idParam,
  validate,
  InventoryController.getVendorSummary
);

// Get specific vendor's inventory
router.get('/inventory/vendors/:vendorId',
  authorize('inventory:read'),
  inventoryValidators.getInventory,
  validate,
  InventoryController.getVendorInventory
);

module.exports = router;
