const BaseController = require('../../utils/baseController');
const SaltService = require('../../services/admin/salt.service');

class SaltController extends BaseController {
    constructor() {
        super('SaltController');
    }

    getAllSalts = this.asyncHandler(async (req, res) => {
        const { page, limit, search, isActive, sortBy, sortOrder } = req.query;

        const result = await SaltService.getAllSalts({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            search,
            isActive: isActive !== undefined ? isActive === 'true' : null,
            sortBy,
            sortOrder
        });

        await this.logActivity(req, 'VIEW_SALTS', 'Viewed salts list');

        this.sendPaginatedResponse(res, result.data, result.pagination, 'Salts retrieved successfully');
    });

    getSaltById = this.asyncHandler(async (req, res) => {
        const { id } = req.params;

        const salt = await SaltService.getSaltById(id);

        await this.logActivity(req, 'VIEW_SALT', `Viewed salt: ${salt.name}`);

        this.sendSuccess(res, salt, 'Salt retrieved successfully');
    });

    getSaltBySlug = this.asyncHandler(async (req, res) => {
        const { slug } = req.params;

        const salt = await SaltService.getSaltBySlug(slug);

        this.sendSuccess(res, salt, 'Salt retrieved successfully');
    });

    createSalt = this.asyncHandler(async (req, res) => {
        const saltData = { ...req.body };

        const salt = await SaltService.createSalt(saltData, req.user.id);

        await this.logActivity(req, 'CREATE_SALT', `Created salt: ${salt.name}`, 'SUCCESS');

        this.sendSuccess(res, salt, 'Salt created successfully', 201);
    });

    updateSalt = this.asyncHandler(async (req, res) => {
        const { id } = req.params;
        const saltData = { ...req.body };

        const salt = await SaltService.updateSalt(id, saltData, req.user.id);

        await this.logActivity(req, 'UPDATE_SALT', `Updated salt: ${salt.name}`, 'SUCCESS');

        this.sendSuccess(res, salt, 'Salt updated successfully');
    });

    deleteSalt = this.asyncHandler(async (req, res) => {
        const { id } = req.params;

        await SaltService.deleteSalt(id, req.user.id);

        await this.logActivity(req, 'DELETE_SALT', `Deleted salt ID: ${id}`, 'SUCCESS');

        this.sendSuccess(res, null, 'Salt deleted successfully');
    });

    getSaltStats = this.asyncHandler(async (req, res) => {
        const stats = await SaltService.getSaltStats();

        await this.logActivity(req, 'VIEW_SALT_STATS', 'Viewed salt statistics');

        this.sendSuccess(res, stats, 'Salt statistics retrieved successfully');
    });
}

module.exports = new SaltController();
