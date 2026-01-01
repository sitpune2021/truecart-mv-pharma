const { body, param, query } = require('express-validator');

const supplierValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Supplier name is required')
      .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
    body('logo_url')
      .optional()
      .trim()
      .isURL().withMessage('Logo URL must be a valid URL'),
    body('website')
      .optional()
      .trim()
      .isURL().withMessage('Website must be a valid URL'),
    body('country')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Country must not exceed 100 characters'),
    body('is_active')
      .optional()
      .isBoolean().withMessage('is_active must be a boolean'),
    body('meta_title')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Meta title must not exceed 255 characters'),
    body('meta_description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Meta description must not exceed 1000 characters')
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid supplier ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty().withMessage('Supplier name cannot be empty')
      .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
    body('logo_url')
      .optional()
      .trim()
      .isURL().withMessage('Logo URL must be a valid URL'),
    body('website')
      .optional()
      .trim()
      .isURL().withMessage('Website must be a valid URL'),
    body('country')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Country must not exceed 100 characters'),
    body('is_active')
      .optional()
      .isBoolean().withMessage('is_active must be a boolean'),
    body('meta_title')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Meta title must not exceed 255 characters'),
    body('meta_description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Meta description must not exceed 1000 characters')
  ],

  getById: [
    param('id').isInt({ min: 1 }).withMessage('Invalid supplier ID')
  ],

  getBySlug: [
    param('slug').trim().notEmpty().withMessage('Slug is required')
  ]
};

const manufacturerValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Manufacturer name is required')
      .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('brand_name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 }).withMessage('Brand name must be between 2 and 255 characters'),
    body('brand_logo_url')
      .optional()
      .trim()
      .isURL().withMessage('Brand logo URL must be a valid URL'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
    body('logo_url')
      .optional()
      .trim()
      .isURL().withMessage('Logo URL must be a valid URL'),
    body('website')
      .optional()
      .trim()
      .isURL().withMessage('Website must be a valid URL'),
    body('country')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Country must not exceed 100 characters'),
    body('is_active')
      .optional()
      .isBoolean().withMessage('is_active must be a boolean'),
    body('meta_title')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Meta title must not exceed 255 characters'),
    body('meta_description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Meta description must not exceed 1000 characters')
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid manufacturer ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty().withMessage('Manufacturer name cannot be empty')
      .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('brand_name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 }).withMessage('Brand name must be between 2 and 255 characters'),
    body('brand_logo_url')
      .optional()
      .trim()
      .isURL().withMessage('Brand logo URL must be a valid URL'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
    body('logo_url')
      .optional()
      .trim()
      .isURL().withMessage('Logo URL must be a valid URL'),
    body('website')
      .optional()
      .trim()
      .isURL().withMessage('Website must be a valid URL'),
    body('country')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Country must not exceed 100 characters'),
    body('is_active')
      .optional()
      .isBoolean().withMessage('is_active must be a boolean'),
    body('meta_title')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Meta title must not exceed 255 characters'),
    body('meta_description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Meta description must not exceed 1000 characters')
  ],

  getById: [
    param('id').isInt({ min: 1 }).withMessage('Invalid manufacturer ID')
  ],

  getBySlug: [
    param('slug').trim().notEmpty().withMessage('Slug is required')
  ]
};

const brandValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Brand name is required')
      .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
    body('logo_url')
      .optional()
      .trim()
      .isURL().withMessage('Logo URL must be a valid URL'),
    body('manufacturer_id')
      .optional()
      .isInt({ min: 1 }).withMessage('Invalid manufacturer ID'),
    body('brand_type')
      .optional()
      .isIn(['private_label', 'fmcg_otc', 'ayurvedic', 'herbal_supplement', 'dermatology', 'baby_care', 'generic', 'other'])
      .withMessage('Invalid brand type'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),
    body('is_active')
      .optional()
      .isBoolean().withMessage('is_active must be a boolean'),
    body('meta_title')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Meta title must not exceed 255 characters'),
    body('meta_description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Meta description must not exceed 1000 characters')
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid brand ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty().withMessage('Brand name cannot be empty')
      .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
    body('logo_url')
      .optional()
      .trim()
      .isURL().withMessage('Logo URL must be a valid URL'),
    body('manufacturer_id')
      .optional()
      .isInt({ min: 1 }).withMessage('Invalid manufacturer ID'),
    body('brand_type')
      .optional()
      .isIn(['private_label', 'fmcg_otc', 'ayurvedic', 'herbal_supplement', 'dermatology', 'baby_care', 'generic', 'other'])
      .withMessage('Invalid brand type'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),
    body('is_active')
      .optional()
      .isBoolean().withMessage('is_active must be a boolean'),
    body('meta_title')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Meta title must not exceed 255 characters'),
    body('meta_description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Meta description must not exceed 1000 characters')
  ],

  getById: [
    param('id').isInt({ min: 1 }).withMessage('Invalid brand ID')
  ],

  getBySlug: [
    param('slug').trim().notEmpty().withMessage('Slug is required')
  ]
};

const categoryValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Category name is required')
      .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('parent_id')
      .optional()
      .isInt({ min: 1 }).withMessage('Invalid parent category ID'),
    body('level')
      .isInt({ min: 1, max: 3 }).withMessage('Level must be 1, 2, or 3'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
    body('image_url')
      .optional()
      .trim()
      .isURL().withMessage('Image URL must be a valid URL'),
    body('icon')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Icon must not exceed 100 characters'),
    body('display_order')
      .optional()
      .isInt({ min: 0 }).withMessage('Display order must be a non-negative integer'),
    body('is_active')
      .optional()
      .isBoolean().withMessage('is_active must be a boolean'),
    body('meta_title')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Meta title must not exceed 255 characters'),
    body('meta_description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Meta description must not exceed 1000 characters')
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid category ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty().withMessage('Category name cannot be empty')
      .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('parent_id')
      .optional()
      .isInt({ min: 1 }).withMessage('Invalid parent category ID'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
    body('image_url')
      .optional()
      .trim()
      .isURL().withMessage('Image URL must be a valid URL'),
    body('icon')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Icon must not exceed 100 characters'),
    body('display_order')
      .optional()
      .isInt({ min: 0 }).withMessage('Display order must be a non-negative integer'),
    body('is_active')
      .optional()
      .isBoolean().withMessage('is_active must be a boolean'),
    body('meta_title')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Meta title must not exceed 255 characters'),
    body('meta_description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Meta description must not exceed 1000 characters')
  ],

  getById: [
    param('id').isInt({ min: 1 }).withMessage('Invalid category ID')
  ],

  getBySlug: [
    param('slug').trim().notEmpty().withMessage('Slug is required')
  ]
};

const productNameValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Product name is required')
      .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
    body('uses')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Uses must not exceed 5000 characters'),
    body('side_effects')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Side effects must not exceed 5000 characters'),
    body('precautions')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Precautions must not exceed 5000 characters'),
    body('is_active')
      .optional()
      .isBoolean().withMessage('is_active must be a boolean')
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid product name ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty().withMessage('Product name cannot be empty')
      .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
    body('uses')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Uses must not exceed 5000 characters'),
    body('side_effects')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Side effects must not exceed 5000 characters'),
    body('precautions')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Precautions must not exceed 5000 characters'),
    body('is_active')
      .optional()
      .isBoolean().withMessage('is_active must be a boolean')
  ],

  getById: [
    param('id').isInt({ min: 1 }).withMessage('Invalid product name ID')
  ],

  getBySlug: [
    param('slug').trim().notEmpty().withMessage('Slug is required')
  ]
};

module.exports = {
  supplierValidation,
  manufacturerValidation,
  brandValidation,
  categoryValidation,
  productNameValidation
};
