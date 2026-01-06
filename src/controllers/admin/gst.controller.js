const BaseController = require('../../utils/baseController');
const GSTService = require('../../services/admin/gst.service');

class GSTController extends BaseController {
    constructor() {
        super('GSTController');
    }

    getAllGST = this.asyncHandler(async (req, res) => {
        const { page, limit, search, isActive, sortBy, sortOrder } = req.query;

        const result = await GSTService.getAllGST({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            search,
            isActive: isActive !== undefined ? isActive === 'true' : null,
            sortBy: sortBy || 'value',
            sortOrder: sortOrder || 'ASC'
        });

        await this.logActivity(req, 'VIEW_GST_LIST', 'Viewed GST list');

        this.sendPaginatedResponse(res, result.data, result.pagination, 'GST records retrieved successfully');
    });

    getGSTById = this.asyncHandler(async (req, res) => {
        const { id } = req.params;

        const gst = await GSTService.getGSTById(id);

        await this.logActivity(req, 'VIEW_GST', `Viewed GST value: ${gst.value}%`);

        this.sendSuccess(res, gst, 'GST record retrieved successfully');
    });

    createGST = this.asyncHandler(async (req, res) => {
        const gstData = { ...req.body };

        const gst = await GSTService.createGST(gstData, req.user.id);

        await this.logActivity(req, 'CREATE_GST', `Created GST: ${gst.value}%`, 'SUCCESS');

        this.sendSuccess(res, gst, 'GST record created successfully', 201);
    });

    updateGST = this.asyncHandler(async (req, res) => {
        const { id } = req.params;
        const gstData = { ...req.body };

        const gst = await GSTService.updateGST(id, gstData, req.user.id);

        await this.logActivity(req, 'UPDATE_GST', `Updated GST: ${gst.value}%`, 'SUCCESS');

        this.sendSuccess(res, gst, 'GST record updated successfully');
    });

    deleteGST = this.asyncHandler(async (req, res) => {
        const { id } = req.params;

        await GSTService.deleteGST(id, req.user.id);

        await this.logActivity(req, 'DELETE_GST', `Deleted GST ID: ${id}`, 'SUCCESS');

        this.sendSuccess(res, null, 'GST record deleted successfully');
    });

    getGSTStats = this.asyncHandler(async (req, res) => {
        const stats = await GSTService.getGSTStats();

        await this.logActivity(req, 'VIEW_GST_STATS', 'Viewed GST statistics');

        this.sendSuccess(res, stats, 'GST statistics retrieved successfully');
    });
}

module.exports = new GSTController();
