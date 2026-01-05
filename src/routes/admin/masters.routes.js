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
const { uploadBrandImage, uploadCategoryImage, uploadManufacturerImage } = require('../../middleware/upload/imageUpload');

const {
  manufacturerValidation,
  supplierValidation,
  brandValidation,
  categoryValidation,
  productNameValidation,
  saltValidation,
  dosageValidation
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
  SupplierController.createSupplier
);

router.put('/suppliers/:id',
  authenticate,
  authorize('suppliers:update'),
  supplierValidation.update,
  validate,
  SupplierController.updateSupplier
);

router.delete('/suppliers/:id',
  authenticate,
  authorize('suppliers:delete'),
  supplierValidation.getById,
  validate,
  SupplierController.deleteSupplier
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
  ManufacturerController.createManufacturer
);

router.put('/manufacturers/:id',
  authenticate,
  authorize('manufacturers:update'),
  uploadManufacturerImage,
  manufacturerValidation.update,
  validate,
  ManufacturerController.updateManufacturer
);

router.delete('/manufacturers/:id',
  authenticate,
  authorize('manufacturers:delete'),
  manufacturerValidation.getById,
  validate,
  ManufacturerController.deleteManufacturer
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
  BrandController.createBrand
);

router.put('/brands/:id',
  authenticate,
  authorize('brands:update'),
  uploadBrandImage,
  brandValidation.update,
  validate,
  BrandController.updateBrand
);

router.delete('/brands/:id',
  authenticate,
  authorize('brands:delete'),
  brandValidation.getById,
  validate,
  BrandController.deleteBrand
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
  CategoryController.createCategory
);

router.put('/categories/:id',
  authenticate,
  authorize('categories:update'),
  uploadCategoryImage,
  categoryValidation.update,
  validate,
  CategoryController.updateCategory
);

router.delete('/categories/:id',
  authenticate,
  authorize('categories:delete'),
  categoryValidation.getById,
  validate,
  CategoryController.deleteCategory
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
  ProductNameController.createProductName
);

router.put('/product-names/:id',
  authenticate,
  authorize('product_names:update'),
  productNameValidation.update,
  validate,
  ProductNameController.updateProductName
);

router.delete('/product-names/:id',
  authenticate,
  authorize('product_names:delete'),
  productNameValidation.getById,
  validate,
  ProductNameController.deleteProductName
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
  SaltController.createSalt
);

router.put('/salts/:id',
  authenticate,
  authorize('salts:update'),
  saltValidation.update,
  validate,
  SaltController.updateSalt
);

router.delete('/salts/:id',
  authenticate,
  authorize('salts:delete'),
  saltValidation.getById,
  validate,
  SaltController.deleteSalt
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
  DosageController.createDosage
);

router.put('/dosages/:id',
  authenticate,
  authorize('dosages:update'),
  dosageValidation.update,
  validate,
  DosageController.updateDosage
);

router.delete('/dosages/:id',
  authenticate,
  authorize('dosages:delete'),
  dosageValidation.getById,
  validate,
  DosageController.deleteDosage
);

module.exports = router;
