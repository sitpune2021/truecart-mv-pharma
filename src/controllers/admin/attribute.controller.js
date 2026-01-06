const BaseController = require('../../utils/baseController');
const AttributeService = require('../../services/admin/attribute.service');

class AttributeController extends BaseController {
    constructor() {
        super('AttributeController');
    }

    getAllAttributes = this.asyncHandler(async (req, res) => {
        const { page, limit, search, isActive, sortBy, sortOrder } = req.query;

        const result = await AttributeService.getAllAttributes({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            search,
            isActive: isActive !== undefined ? isActive === 'true' : null,
            sortBy,
            sortOrder
        });

        await this.logActivity(req, 'VIEW_ATTRIBUTES', 'Viewed attributes list');

        this.sendPaginatedResponse(res, result.data, result.pagination, 'Attributes retrieved successfully');
    });

    getAttributeById = this.asyncHandler(async (req, res) => {
        const { id } = req.params;

        const attribute = await AttributeService.getAttributeById(id);

        await this.logActivity(req, 'VIEW_ATTRIBUTE', `Viewed attribute: ${attribute.name}`);

        this.sendSuccess(res, attribute, 'Attribute retrieved successfully');
    });

    getAttributeBySlug = this.asyncHandler(async (req, res) => {
        const { slug } = req.params;

        const attribute = await AttributeService.getAttributeBySlug(slug);

        this.sendSuccess(res, attribute, 'Attribute retrieved successfully');
    });

    createAttribute = this.asyncHandler(async (req, res) => {
        const attributeData = { ...req.body };

        const attribute = await AttributeService.createAttribute(attributeData, req.user.id);

        await this.logActivity(req, 'CREATE_ATTRIBUTE', `Created attribute: ${attribute.name}`, 'SUCCESS');

        this.sendSuccess(res, attribute, 'Attribute created successfully', 201);
    });

    updateAttribute = this.asyncHandler(async (req, res) => {
        const { id } = req.params;
        const attributeData = { ...req.body };

        const attribute = await AttributeService.updateAttribute(id, attributeData, req.user.id);

        await this.logActivity(req, 'UPDATE_ATTRIBUTE', `Updated attribute: ${attribute.name}`, 'SUCCESS');

        this.sendSuccess(res, attribute, 'Attribute updated successfully');
    });

    deleteAttribute = this.asyncHandler(async (req, res) => {
        const { id } = req.params;

        await AttributeService.deleteAttribute(id, req.user.id);

        await this.logActivity(req, 'DELETE_ATTRIBUTE', `Deleted attribute ID: ${id}`, 'SUCCESS');

        this.sendSuccess(res, null, 'Attribute deleted successfully');
    });

    getAttributeStats = this.asyncHandler(async (req, res) => {
        const stats = await AttributeService.getAttributeStats();

        await this.logActivity(req, 'VIEW_ATTRIBUTE_STATS', 'Viewed attribute statistics');

        this.sendSuccess(res, stats, 'Attribute statistics retrieved successfully');
    });
}

module.exports = new AttributeController();
