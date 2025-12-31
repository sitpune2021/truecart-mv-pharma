const BaseController = require('../../utils/baseController');
const CategoryService = require('../../services/admin/category.service');
const { processSingleImage, deleteFiles } = require('../../utils/image.utils');

class CategoryController extends BaseController {
  constructor() {
    super('CategoryController');
  }

  getAllCategories = this.asyncHandler(async (req, res) => {
    const { page, limit, search, level, parentId, isActive, sortBy, sortOrder } = req.query;

    const result = await CategoryService.getAllCategories({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      level: level ? parseInt(level) : null,
      parentId: parentId ? parseInt(parentId) : null,
      isActive: isActive !== undefined ? isActive === 'true' : null,
      sortBy,
      sortOrder
    });

    await this.logActivity(req, 'VIEW_CATEGORIES', 'Viewed categories list');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Categories retrieved successfully');
  });

  getCategoryTree = this.asyncHandler(async (req, res) => {
    const tree = await CategoryService.getCategoryTree();

    await this.logActivity(req, 'VIEW_CATEGORY_TREE', 'Viewed category tree');

    this.sendSuccess(res, tree, 'Category tree retrieved successfully');
  });

  getCategoryById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await CategoryService.getCategoryById(id);

    await this.logActivity(req, 'VIEW_CATEGORY', `Viewed category: ${category.name}`);

    this.sendSuccess(res, category, 'Category retrieved successfully');
  });

  getCategoryBySlug = this.asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const category = await CategoryService.getCategoryBySlug(slug);

    this.sendSuccess(res, category, 'Category retrieved successfully');
  });

  getCategoryChildren = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const children = await CategoryService.getCategoryChildren(id);

    this.sendSuccess(res, children, 'Category children retrieved successfully');
  });

  createCategory = this.asyncHandler(async (req, res) => {
    const categoryData = { ...req.body };

    // Handle image upload if provided
    if (req.file) {
      categoryData.image_url = await processSingleImage({
        file: req.file,
        folder: 'categories',
        baseName: categoryData.name || 'category'
      });
    }

    const category = await CategoryService.createCategory(categoryData, req.user.id);

    await this.logActivity(req, 'CREATE_CATEGORY', `Created category: ${category.name}`, 'SUCCESS');

    this.sendSuccess(res, category, 'Category created successfully', 201);
  });

  updateCategory = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const categoryData = { ...req.body };

    // Fetch existing to manage image replacement
    const existing = await CategoryService.getCategoryById(id);

    if (req.file) {
      categoryData.image_url = await processSingleImage({
        file: req.file,
        folder: 'categories',
        baseName: categoryData.name || existing.name || 'category'
      });

      if (existing.image_url) {
        await deleteFiles([existing.image_url]);
      }
    }

    const category = await CategoryService.updateCategory(id, categoryData, req.user.id);

    await this.logActivity(req, 'UPDATE_CATEGORY', `Updated category: ${category.name}`, 'SUCCESS');

    this.sendSuccess(res, category, 'Category updated successfully');
  });

  deleteCategory = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    await CategoryService.deleteCategory(id, req.user.id);

    await this.logActivity(req, 'DELETE_CATEGORY', `Deleted category ID: ${id}`, 'SUCCESS');

    this.sendSuccess(res, null, 'Category deleted successfully');
  });

  getCategoryStats = this.asyncHandler(async (req, res) => {
    const stats = await CategoryService.getCategoryStats();

    await this.logActivity(req, 'VIEW_CATEGORY_STATS', 'Viewed category statistics');

    this.sendSuccess(res, stats, 'Category statistics retrieved successfully');
  });

  getCategoriesByLevel = this.asyncHandler(async (req, res) => {
    const { level } = req.params;
    const { parentId } = req.query;

    const categories = await CategoryService.getCategoriesByLevel(
      parseInt(level),
      parentId ? parseInt(parentId) : null
    );

    this.sendSuccess(res, categories, `Level ${level} categories retrieved successfully`);
  });

  getSubCategories = this.asyncHandler(async (req, res) => {
    const { parentId } = req.params;

    const subCategories = await CategoryService.getSubCategories(parseInt(parentId));

    this.sendSuccess(res, subCategories, 'Sub-categories retrieved successfully');
  });
}

module.exports = new CategoryController();
