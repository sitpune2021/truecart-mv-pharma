const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth/authenticate');
const { authorize } = require('../../middleware/auth/authorize');
const validate = require('../../middleware/validation/validate');

const ManufacturerController = require('../../controllers/admin/manufacturer.controller');
const SupplierController = require('../../controllers/admin/supplier.controller');
const BrandController = require('../../controllers/admin/brand.controller');
const CategoryController = require('../../controllers/admin/category.controller');
const ProductNameController = require('../../controllers/admin/productName.controller');
const SaltController = require('../../controllers/admin/salt.controller');
const DosageController = require('../../controllers/admin/dosage.controller');
const UnitTypeController = require('../../controllers/admin/unitType.controller');
const AttributeController = require('../../controllers/admin/attribute.controller');
const GSTController = require('../../controllers/admin/gst.controller');
const { uploadBrandImage, uploadCategoryImage, uploadManufacturerImage } = require('../../middleware/upload/imageUpload');
const { wrapCreate, wrapUpdate, wrapDelete } = require('../../middleware/approval/approvalWrapper');

const {
  manufacturerValidation,
  supplierValidation,
  brandValidation,
  categoryValidation,
  productNameValidation,
  saltValidation,
  dosageValidation,
  unitTypeValidation,
  attributeValidation,
  gstValidation
} = require('../../validators/masters.validator');

// ==================== SUPPLIERS ====================

router.get('/suppliers',
  authenticate,
  authorize('suppliers:read'),
  SupplierController.getAllSuppliers
);

router.get('/suppliers/stats',
  authenticate,
  authorize('suppliers:read'),
  SupplierController.getSupplierStats
);

router.get('/suppliers/:id',
  authenticate,
  authorize('suppliers:read'),
  supplierValidation.getById,
  validate,
  SupplierController.getSupplierById
);

router.get('/suppliers/slug/:slug',
  authenticate,
  authorize('suppliers:read'),
  supplierValidation.getBySlug,
  validate,
  SupplierController.getSupplierBySlug
);

router.post('/suppliers',
  authenticate,
  authorize('suppliers:create'),
  supplierValidation.create,
  validate,
  wrapCreate('supplier', SupplierController.createSupplier)
);

router.put('/suppliers/:id',
  authenticate,
  authorize('suppliers:update'),
  supplierValidation.update,
  validate,
  wrapUpdate('supplier', SupplierController.updateSupplier)
);

router.delete('/suppliers/:id',
  authenticate,
  authorize('suppliers:delete'),
  supplierValidation.getById,
  validate,
  wrapDelete('supplier', SupplierController.deleteSupplier)
);

// ==================== MANUFACTURERS ====================

router.get('/manufacturers',
  authenticate,
  authorize('manufacturers:read'),
  ManufacturerController.getAllManufacturers
);

router.get('/manufacturers/stats',
  authenticate,
  authorize('manufacturers:read'),
  ManufacturerController.getManufacturerStats
);

router.get('/manufacturers/:id',
  authenticate,
  authorize('manufacturers:read'),
  manufacturerValidation.getById,
  validate,
  ManufacturerController.getManufacturerById
);

router.get('/manufacturers/slug/:slug',
  authenticate,
  authorize('manufacturers:read'),
  manufacturerValidation.getBySlug,
  validate,
  ManufacturerController.getManufacturerBySlug
);

router.post('/manufacturers',
  authenticate,
  authorize('manufacturers:create'),
  uploadManufacturerImage,
  manufacturerValidation.create,
  validate,
  wrapCreate('manufacturer', ManufacturerController.createManufacturer)
);

router.put('/manufacturers/:id',
  authenticate,
  authorize('manufacturers:update'),
  uploadManufacturerImage,
  manufacturerValidation.update,
  validate,
  wrapUpdate('manufacturer', ManufacturerController.updateManufacturer)
);

router.delete('/manufacturers/:id',
  authenticate,
  authorize('manufacturers:delete'),
  manufacturerValidation.getById,
  validate,
  wrapDelete('manufacturer', ManufacturerController.deleteManufacturer)
);

// ==================== BRANDS ====================

router.get('/brands',
  authenticate,
  authorize('brands:read'),
  BrandController.getAllBrands
);

router.get('/brands/stats',
  authenticate,
  authorize('brands:read'),
  BrandController.getBrandStats
);

router.get('/brands/:id',
  authenticate,
  authorize('brands:read'),
  brandValidation.getById,
  validate,
  BrandController.getBrandById
);

router.get('/brands/slug/:slug',
  authenticate,
  authorize('brands:read'),
  brandValidation.getBySlug,
  validate,
  BrandController.getBrandBySlug
);

router.post('/brands',
  authenticate,
  authorize('brands:create'),
  uploadBrandImage,
  brandValidation.create,
  validate,
  wrapCreate('brand', BrandController.createBrand)
);

router.put('/brands/:id',
  authenticate,
  authorize('brands:update'),
  uploadBrandImage,
  brandValidation.update,
  validate,
  wrapUpdate('brand', BrandController.updateBrand)
);

router.delete('/brands/:id',
  authenticate,
  authorize('brands:delete'),
  brandValidation.getById,
  validate,
  wrapDelete('brand', BrandController.deleteBrand)
);

// ==================== CATEGORIES ====================

router.get('/categories',
  authenticate,
  authorize('categories:read'),
  CategoryController.getAllCategories
);

router.get('/categories/tree',
  authenticate,
  authorize('categories:read'),
  CategoryController.getCategoryTree
);

router.get('/categories/stats',
  authenticate,
  authorize('categories:read'),
  CategoryController.getCategoryStats
);

router.get('/categories/level/:level',
  authenticate,
  authorize('categories:read'),
  CategoryController.getCategoriesByLevel
);

router.get('/categories/parent/:parentId/sub-categories',
  authenticate,
  authorize('categories:read'),
  CategoryController.getSubCategories
);

router.get('/categories/:id',
  authenticate,
  authorize('categories:read'),
  categoryValidation.getById,
  validate,
  CategoryController.getCategoryById
);

router.get('/categories/:id/children',
  authenticate,
  authorize('categories:read'),
  categoryValidation.getById,
  validate,
  CategoryController.getCategoryChildren
);

router.get('/categories/slug/:slug',
  authenticate,
  authorize('categories:read'),
  categoryValidation.getBySlug,
  validate,
  CategoryController.getCategoryBySlug
);

router.post('/categories',
  authenticate,
  authorize('categories:create'),
  uploadCategoryImage,
  categoryValidation.create,
  validate,
  wrapCreate('category', CategoryController.createCategory)
);

router.put('/categories/:id',
  authenticate,
  authorize('categories:update'),
  uploadCategoryImage,
  categoryValidation.update,
  validate,
  wrapUpdate('category', CategoryController.updateCategory)
);

router.delete('/categories/:id',
  authenticate,
  authorize('categories:delete'),
  categoryValidation.getById,
  validate,
  wrapDelete('category', CategoryController.deleteCategory)
);

// ==================== PRODUCT NAMES (Generic Names) ====================

router.get('/product-names',
  authenticate,
  authorize('product_names:read'),
  ProductNameController.getAllProductNames
);

router.get('/product-names/stats',
  authenticate,
  authorize('product_names:read'),
  ProductNameController.getProductNameStats
);

router.get('/product-names/:id',
  authenticate,
  authorize('product_names:read'),
  productNameValidation.getById,
  validate,
  ProductNameController.getProductNameById
);

router.get('/product-names/slug/:slug',
  authenticate,
  authorize('product_names:read'),
  productNameValidation.getBySlug,
  validate,
  ProductNameController.getProductNameBySlug
);

router.post('/product-names',
  authenticate,
  authorize('product_names:create'),
  productNameValidation.create,
  validate,
  wrapCreate('product_name', ProductNameController.createProductName)
);

router.put('/product-names/:id',
  authenticate,
  authorize('product_names:update'),
  productNameValidation.update,
  validate,
  wrapUpdate('product_name', ProductNameController.updateProductName)
);

router.delete('/product-names/:id',
  authenticate,
  authorize('product_names:delete'),
  productNameValidation.getById,
  validate,
  wrapDelete('product_name', ProductNameController.deleteProductName)
);

// ==================== SALTS ====================

router.get('/salts',
  authenticate,
  authorize('salts:read'),
  SaltController.getAllSalts
);

router.get('/salts/stats',
  authenticate,
  authorize('salts:read'),
  SaltController.getSaltStats
);

router.get('/salts/:id',
  authenticate,
  authorize('salts:read'),
  saltValidation.getById,
  validate,
  SaltController.getSaltById
);

router.get('/salts/slug/:slug',
  authenticate,
  authorize('salts:read'),
  saltValidation.getBySlug,
  validate,
  SaltController.getSaltBySlug
);

router.post('/salts',
  authenticate,
  authorize('salts:create'),
  saltValidation.create,
  validate,
  wrapCreate('salt', SaltController.createSalt)
);

router.put('/salts/:id',
  authenticate,
  authorize('salts:update'),
  saltValidation.update,
  validate,
  wrapUpdate('salt', SaltController.updateSalt)
);

router.delete('/salts/:id',
  authenticate,
  authorize('salts:delete'),
  saltValidation.getById,
  validate,
  wrapDelete('salt', SaltController.deleteSalt)
);

// ==================== DOSAGES ====================

router.get('/dosages',
  authenticate,
  authorize('dosages:read'),
  DosageController.getAllDosages
);

router.get('/dosages/stats',
  authenticate,
  authorize('dosages:read'),
  DosageController.getDosageStats
);

router.get('/dosages/:id',
  authenticate,
  authorize('dosages:read'),
  dosageValidation.getById,
  validate,
  DosageController.getDosageById
);

router.get('/dosages/slug/:slug',
  authenticate,
  authorize('dosages:read'),
  dosageValidation.getBySlug,
  validate,
  DosageController.getDosageBySlug
);

router.post('/dosages',
  authenticate,
  authorize('dosages:create'),
  dosageValidation.create,
  validate,
  wrapCreate('dosage', DosageController.createDosage)
);

router.put('/dosages/:id',
  authenticate,
  authorize('dosages:update'),
  dosageValidation.update,
  validate,
  wrapUpdate('dosage', DosageController.updateDosage)
);

router.delete('/dosages/:id',
  authenticate,
  authorize('dosages:delete'),
  dosageValidation.getById,
  validate,
  wrapDelete('dosage', DosageController.deleteDosage)
);

// ==================== UNIT TYPES ====================

router.get('/unit-types',
  authenticate,
  authorize('unit_types:read'),
  UnitTypeController.getAllUnitTypes
);

router.get('/unit-types/stats',
  authenticate,
  authorize('unit_types:read'),
  UnitTypeController.getUnitTypeStats
);

router.get('/unit-types/:id',
  authenticate,
  authorize('unit_types:read'),
  unitTypeValidation.getById,
  validate,
  UnitTypeController.getUnitTypeById
);

router.get('/unit-types/slug/:slug',
  authenticate,
  authorize('unit_types:read'),
  unitTypeValidation.getBySlug,
  validate,
  UnitTypeController.getUnitTypeBySlug
);

router.post('/unit-types',
  authenticate,
  authorize('unit_types:create'),
  unitTypeValidation.create,
  validate,
  wrapCreate('unit_type', UnitTypeController.createUnitType)
);

router.put('/unit-types/:id',
  authenticate,
  authorize('unit_types:update'),
  unitTypeValidation.update,
  validate,
  wrapUpdate('unit_type', UnitTypeController.updateUnitType)
);

router.delete('/unit-types/:id',
  authenticate,
  authorize('unit_types:delete'),
  unitTypeValidation.getById,
  validate,
  wrapDelete('unit_type', UnitTypeController.deleteUnitType)
);

// ==================== ATTRIBUTES ====================

router.get('/attributes',
  authenticate,
  authorize('attributes:read'),
  AttributeController.getAllAttributes
);

router.get('/attributes/stats',
  authenticate,
  authorize('attributes:read'),
  AttributeController.getAttributeStats
);

router.get('/attributes/:id',
  authenticate,
  authorize('attributes:read'),
  attributeValidation.getById,
  validate,
  AttributeController.getAttributeById
);

router.get('/attributes/slug/:slug',
  authenticate,
  authorize('attributes:read'),
  attributeValidation.getBySlug,
  validate,
  AttributeController.getAttributeBySlug
);

router.post('/attributes',
  authenticate,
  authorize('attributes:create'),
  attributeValidation.create,
  validate,
  wrapCreate('attribute', AttributeController.createAttribute)
);

router.put('/attributes/:id',
  authenticate,
  authorize('attributes:update'),
  attributeValidation.update,
  validate,
  wrapUpdate('attribute', AttributeController.updateAttribute)
);

router.delete('/attributes/:id',
  authenticate,
  authorize('attributes:delete'),
  attributeValidation.getById,
  validate,
  wrapDelete('attribute', AttributeController.deleteAttribute)
);

// ==================== GST ====================

router.get('/gst',
  authenticate,
  authorize('gst:read'),
  GSTController.getAllGST
);

router.get('/gst/stats',
  authenticate,
  authorize('gst:read'),
  GSTController.getGSTStats
);

router.get('/gst/:id',
  authenticate,
  authorize('gst:read'),
  gstValidation.getById,
  validate,
  GSTController.getGSTById
);

router.post('/gst',
  authenticate,
  authorize('gst:create'),
  gstValidation.create,
  validate,
  wrapCreate('gst', GSTController.createGST)
);

router.put('/gst/:id',
  authenticate,
  authorize('gst:update'),
  gstValidation.update,
  validate,
  wrapUpdate('gst', GSTController.updateGST)
);

router.delete('/gst/:id',
  authenticate,
  authorize('gst:delete'),
  gstValidation.getById,
  validate,
  wrapDelete('gst', GSTController.deleteGST)
);

module.exports = router;
