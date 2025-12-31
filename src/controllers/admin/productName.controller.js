const BaseController = require('../../utils/baseController');
const ProductNameService = require('../../services/admin/productName.service');

class ProductNameController extends BaseController {
  constructor() {
    super('ProductNameController');
  }

  getAllProductNames = this.asyncHandler(async (req, res) => {
    const { page, limit, search, isActive, sortBy, sortOrder } = req.query;

    const result = await ProductNameService.getAllProductNames({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : null,
      sortBy,
      sortOrder
    });

    await this.logActivity(req, 'VIEW_PRODUCT_NAMES', 'Viewed product names list');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Product names retrieved successfully');
  });

  getProductNameById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const productName = await ProductNameService.getProductNameById(id);

    await this.logActivity(req, 'VIEW_PRODUCT_NAME', `Viewed product name: ${productName.name}`);

    this.sendSuccess(res, productName, 'Product name retrieved successfully');
  });

  getProductNameBySlug = this.asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const productName = await ProductNameService.getProductNameBySlug(slug);

    this.sendSuccess(res, productName, 'Product name retrieved successfully');
  });

  createProductName = this.asyncHandler(async (req, res) => {
    const productNameData = { ...req.body };

    const productName = await ProductNameService.createProductName(productNameData, req.user.id);

    await this.logActivity(req, 'CREATE_PRODUCT_NAME', `Created product name: ${productName.name}`, 'SUCCESS');

    this.sendSuccess(res, productName, 'Product name created successfully', 201);
  });

  updateProductName = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const productNameData = { ...req.body };

    const productName = await ProductNameService.updateProductName(id, productNameData, req.user.id);

    await this.logActivity(req, 'UPDATE_PRODUCT_NAME', `Updated product name: ${productName.name}`, 'SUCCESS');

    this.sendSuccess(res, productName, 'Product name updated successfully');
  });

  deleteProductName = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    await ProductNameService.deleteProductName(id, req.user.id);

    await this.logActivity(req, 'DELETE_PRODUCT_NAME', `Deleted product name ID: ${id}`, 'SUCCESS');

    this.sendSuccess(res, null, 'Product name deleted successfully');
  });

  getProductNameStats = this.asyncHandler(async (req, res) => {
    const stats = await ProductNameService.getProductNameStats();

    await this.logActivity(req, 'VIEW_PRODUCT_NAME_STATS', 'Viewed product name statistics');

    this.sendSuccess(res, stats, 'Product name statistics retrieved successfully');
  });
}

module.exports = new ProductNameController();
