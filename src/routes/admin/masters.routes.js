const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth/authenticate');
const { authorize } = require('../../middleware/auth/authorize');
const validate = require('../../middleware/validation/validate');

const ManufacturerController = require('../../controllers/admin/manufacturer.controller');
const MarketerController = require('../../controllers/admin/marketer.controller');
const BrandController = require('../../controllers/admin/brand.controller');
const CategoryController = require('../../controllers/admin/category.controller');
const ProductNameController = require('../../controllers/admin/productName.controller');
const { uploadBrandImage, uploadCategoryImage } = require('../../middleware/upload/imageUpload');

const {
  manufacturerValidation,
  marketerValidation,
  brandValidation,
  categoryValidation,
  productNameValidation
} = require('../../validators/masters.validator');

// ==================== MARKETERS ====================

router.get('/marketers',
  authenticate,
  authorize('marketers:read'),
  MarketerController.getAllMarketers
);

router.get('/marketers/stats',
  authenticate,
  authorize('marketers:read'),
  MarketerController.getMarketerStats
);

router.get('/marketers/:id',
  authenticate,
  authorize('marketers:read'),
  marketerValidation.getById,
  validate,
  MarketerController.getMarketerById
);

router.get('/marketers/slug/:slug',
  authenticate,
  authorize('marketers:read'),
  marketerValidation.getBySlug,
  validate,
  MarketerController.getMarketerBySlug
);

router.post('/marketers',
  authenticate,
  authorize('marketers:create'),
  marketerValidation.create,
  validate,
  MarketerController.createMarketer
);

router.put('/marketers/:id',
  authenticate,
  authorize('marketers:update'),
  marketerValidation.update,
  validate,
  MarketerController.updateMarketer
);

router.delete('/marketers/:id',
  authenticate,
  authorize('marketers:delete'),
  marketerValidation.getById,
  validate,
  MarketerController.deleteMarketer
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
  manufacturerValidation.create,
  validate,
  ManufacturerController.createManufacturer
);

router.put('/manufacturers/:id',
  authenticate,
  authorize('manufacturers:update'),
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

module.exports = router;
