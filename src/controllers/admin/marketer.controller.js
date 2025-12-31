const BaseController = require('../../utils/baseController');
const MarketerService = require('../../services/admin/marketer.service');

class MarketerController extends BaseController {
  constructor() {
    super('MarketerController');
  }

  getAllMarketers = this.asyncHandler(async (req, res) => {
    const { page, limit, search, isActive, sortBy, sortOrder } = req.query;

    const result = await MarketerService.getAllMarketers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : null,
      sortBy,
      sortOrder
    });

    await this.logActivity(req, 'VIEW_MARKETERS', 'Viewed marketers list');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Marketers retrieved successfully');
  });

  getMarketerById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const marketer = await MarketerService.getMarketerById(id);

    await this.logActivity(req, 'VIEW_MARKETER', `Viewed marketer: ${marketer.name}`);

    this.sendSuccess(res, marketer, 'Marketer retrieved successfully');
  });

  getMarketerBySlug = this.asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const marketer = await MarketerService.getMarketerBySlug(slug);

    this.sendSuccess(res, marketer, 'Marketer retrieved successfully');
  });

  createMarketer = this.asyncHandler(async (req, res) => {
    const marketerData = { ...req.body };

    const marketer = await MarketerService.createMarketer(marketerData, req.user.id);

    await this.logActivity(req, 'CREATE_MARKETER', `Created marketer: ${marketer.name}`, 'SUCCESS');

    this.sendSuccess(res, marketer, 'Marketer created successfully', 201);
  });

  updateMarketer = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const marketerData = { ...req.body };

    const marketer = await MarketerService.updateMarketer(id, marketerData, req.user.id);

    await this.logActivity(req, 'UPDATE_MARKETER', `Updated marketer: ${marketer.name}`, 'SUCCESS');

    this.sendSuccess(res, marketer, 'Marketer updated successfully');
  });

  deleteMarketer = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    await MarketerService.deleteMarketer(id, req.user.id);

    await this.logActivity(req, 'DELETE_MARKETER', `Deleted marketer ID: ${id}`, 'SUCCESS');

    this.sendSuccess(res, null, 'Marketer deleted successfully');
  });

  getMarketerStats = this.asyncHandler(async (req, res) => {
    const stats = await MarketerService.getMarketerStats();

    await this.logActivity(req, 'VIEW_MARKETER_STATS', 'Viewed marketer statistics');

    this.sendSuccess(res, stats, 'Marketer statistics retrieved successfully');
  });
}

module.exports = new MarketerController();
