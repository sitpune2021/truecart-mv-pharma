const BaseController = require('../../utils/baseController');
const UnitTypeService = require('../../services/admin/unitType.service');

class UnitTypeController extends BaseController {
    constructor() {
        super('UnitTypeController');
    }

    getAllUnitTypes = this.asyncHandler(async (req, res) => {
        const { page, limit, search, isActive, sortBy, sortOrder } = req.query;

        const result = await UnitTypeService.getAllUnitTypes({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            search,
            isActive: isActive !== undefined ? isActive === 'true' : null,
            sortBy,
            sortOrder
        });

        await this.logActivity(req, 'VIEW_UNIT_TYPES', 'Viewed unit types list');

        this.sendPaginatedResponse(res, result.data, result.pagination, 'Unit Types retrieved successfully');
    });

    getUnitTypeById = this.asyncHandler(async (req, res) => {
        const { id } = req.params;

        const unitType = await UnitTypeService.getUnitTypeById(id);

        await this.logActivity(req, 'VIEW_UNIT_TYPE', `Viewed unit type: ${unitType.name}`);

        this.sendSuccess(res, unitType, 'Unit Type retrieved successfully');
    });

    getUnitTypeBySlug = this.asyncHandler(async (req, res) => {
        const { slug } = req.params;

        const unitType = await UnitTypeService.getUnitTypeBySlug(slug);

        this.sendSuccess(res, unitType, 'Unit Type retrieved successfully');
    });

    createUnitType = this.asyncHandler(async (req, res) => {
        const unitTypeData = { ...req.body };

        const unitType = await UnitTypeService.createUnitType(unitTypeData, req.user.id);

        await this.logActivity(req, 'CREATE_UNIT_TYPE', `Created unit type: ${unitType.name}`, 'SUCCESS');

        this.sendSuccess(res, unitType, 'Unit Type created successfully', 201);
    });

    updateUnitType = this.asyncHandler(async (req, res) => {
        const { id } = req.params;
        const unitTypeData = { ...req.body };

        const unitType = await UnitTypeService.updateUnitType(id, unitTypeData, req.user.id);

        await this.logActivity(req, 'UPDATE_UNIT_TYPE', `Updated unit type: ${unitType.name}`, 'SUCCESS');

        this.sendSuccess(res, unitType, 'Unit Type updated successfully');
    });

    deleteUnitType = this.asyncHandler(async (req, res) => {
        const { id } = req.params;

        await UnitTypeService.deleteUnitType(id, req.user.id);

        await this.logActivity(req, 'DELETE_UNIT_TYPE', `Deleted unit type ID: ${id}`, 'SUCCESS');

        this.sendSuccess(res, null, 'Unit Type deleted successfully');
    });

    getUnitTypeStats = this.asyncHandler(async (req, res) => {
        const stats = await UnitTypeService.getUnitTypeStats();

        await this.logActivity(req, 'VIEW_UNIT_TYPE_STATS', 'Viewed unit type statistics');

        this.sendSuccess(res, stats, 'Unit Type statistics retrieved successfully');
    });
}

module.exports = new UnitTypeController();
