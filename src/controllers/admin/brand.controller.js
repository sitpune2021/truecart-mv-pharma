const BaseController = require('../../utils/baseController');
const BrandService = require('../../services/admin/brand.service');
const { processSingleImage, deleteFiles } = require('../../utils/image.utils');

class BrandController extends BaseController {
  constructor() {
    super('BrandController');
  }

  getAllBrands = this.asyncHandler(async (req, res) => {
    const { page, limit, search, manufacturerId, isActive, sortBy, sortOrder } = req.query;

    const result = await BrandService.getAllBrands({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      manufacturerId: manufacturerId ? parseInt(manufacturerId) : null,
      isActive: isActive !== undefined ? isActive === 'true' : null,
      sortBy,
      sortOrder
    });

    await this.logActivity(req, 'VIEW_BRANDS', 'Viewed brands list');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Brands retrieved successfully');
  });

  getBrandById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const brand = await BrandService.getBrandById(id);

    await this.logActivity(req, 'VIEW_BRAND', `Viewed brand: ${brand.name}`);

    this.sendSuccess(res, brand, 'Brand retrieved successfully');
  });

  getBrandBySlug = this.asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const brand = await BrandService.getBrandBySlug(slug);

    this.sendSuccess(res, brand, 'Brand retrieved successfully');
  });

  createBrand = this.asyncHandler(async (req, res) => {
    const brandData = { ...req.body };

    // Handle logo upload if provided
    if (req.file) {
      brandData.logo_url = await processSingleImage({
        file: req.file,
        folder: 'brands',
        baseName: brandData.name || 'brand'
      });
    }

    const brand = await BrandService.createBrand(brandData, req.user.id);

    await this.logActivity(req, 'CREATE_BRAND', `Created brand: ${brand.name}`, 'SUCCESS');

    this.sendSuccess(res, brand, 'Brand created successfully', 201);
  });

  updateBrand = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const brandData = { ...req.body };

    // Fetch existing to manage logo replacement
    const existing = await BrandService.getBrandById(id);

    if (req.file) {
      brandData.logo_url = await processSingleImage({
        file: req.file,
        folder: 'brands',
        baseName: brandData.name || existing.name || 'brand'
      });

      if (existing.logo_url) {
        await deleteFiles([existing.logo_url]);
      }
    }

    const brand = await BrandService.updateBrand(id, brandData, req.user.id);

    await this.logActivity(req, 'UPDATE_BRAND', `Updated brand: ${brand.name}`, 'SUCCESS');

    this.sendSuccess(res, brand, 'Brand updated successfully');
  });

  deleteBrand = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    await BrandService.deleteBrand(id, req.user.id);

    await this.logActivity(req, 'DELETE_BRAND', `Deleted brand ID: ${id}`, 'SUCCESS');

    this.sendSuccess(res, null, 'Brand deleted successfully');
  });

  getBrandStats = this.asyncHandler(async (req, res) => {
    const stats = await BrandService.getBrandStats();

    await this.logActivity(req, 'VIEW_BRAND_STATS', 'Viewed brand statistics');

    this.sendSuccess(res, stats, 'Brand statistics retrieved successfully');
  });
}

module.exports = new BrandController();
