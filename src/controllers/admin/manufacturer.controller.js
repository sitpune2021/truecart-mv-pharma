const BaseController = require('../../utils/baseController');
const ManufacturerService = require('../../services/admin/manufacturer.service');
const { processSingleImage, deleteFiles } = require('../../utils/image.utils');

class ManufacturerController extends BaseController {
  constructor() {
    super('ManufacturerController');
  }

  getAllManufacturers = this.asyncHandler(async (req, res) => {
    const { page, limit, search, isActive, sortBy, sortOrder } = req.query;

    const result = await ManufacturerService.getAllManufacturers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : null,
      sortBy,
      sortOrder
    });

    await this.logActivity(req, 'VIEW_MANUFACTURERS', 'Viewed manufacturers list');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Manufacturers retrieved successfully');
  });

  getManufacturerById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const manufacturer = await ManufacturerService.getManufacturerById(id);

    await this.logActivity(req, 'VIEW_MANUFACTURER', `Viewed manufacturer: ${manufacturer.name}`);

    this.sendSuccess(res, manufacturer, 'Manufacturer retrieved successfully');
  });

  getManufacturerBySlug = this.asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const manufacturer = await ManufacturerService.getManufacturerBySlug(slug);

    this.sendSuccess(res, manufacturer, 'Manufacturer retrieved successfully');
  });

  createManufacturer = this.asyncHandler(async (req, res) => {
    const manufacturerData = { ...req.body };

    if (req.file) {
      manufacturerData.brand_logo_url = await processSingleImage({
        file: req.file,
        folder: 'manufacturers',
        baseName: manufacturerData.name || 'manufacturer'
      });
    }

    const manufacturer = await ManufacturerService.createManufacturer(manufacturerData, req.user.id);

    await this.logActivity(req, 'CREATE_MANUFACTURER', `Created manufacturer: ${manufacturer.name}`, 'SUCCESS');

    this.sendSuccess(res, manufacturer, 'Manufacturer created successfully', 201);
  });

  updateManufacturer = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const manufacturerData = { ...req.body };

    // Load existing to manage brand logo replacement
    const existing = await ManufacturerService.getManufacturerById(id);

    if (req.file) {
      manufacturerData.brand_logo_url = await processSingleImage({
        file: req.file,
        folder: 'manufacturers',
        baseName: manufacturerData.name || existing.name || 'manufacturer'
      });

      if (existing.brand_logo_url) {
        await deleteFiles([existing.brand_logo_url]);
      }
    }

    const manufacturer = await ManufacturerService.updateManufacturer(id, manufacturerData, req.user.id);

    await this.logActivity(req, 'UPDATE_MANUFACTURER', `Updated manufacturer: ${manufacturer.name}`, 'SUCCESS');

    this.sendSuccess(res, manufacturer, 'Manufacturer updated successfully');
  });

  deleteManufacturer = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    await ManufacturerService.deleteManufacturer(id, req.user.id);

    await this.logActivity(req, 'DELETE_MANUFACTURER', `Deleted manufacturer ID: ${id}`, 'SUCCESS');

    this.sendSuccess(res, null, 'Manufacturer deleted successfully');
  });

  getManufacturerStats = this.asyncHandler(async (req, res) => {
    const stats = await ManufacturerService.getManufacturerStats();

    await this.logActivity(req, 'VIEW_MANUFACTURER_STATS', 'Viewed manufacturer statistics');

    this.sendSuccess(res, stats, 'Manufacturer statistics retrieved successfully');
  });
}

module.exports = new ManufacturerController();
