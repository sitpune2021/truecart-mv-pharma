const BaseController = require('../../utils/baseController');
const DosageService = require('../../services/admin/dosage.service');

class DosageController extends BaseController {
    constructor() {
        super('DosageController');
    }

    getAllDosages = this.asyncHandler(async (req, res) => {
        const { page, limit, search, isActive, sortBy, sortOrder } = req.query;

        const result = await DosageService.getAllDosages({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            search,
            isActive: isActive !== undefined ? isActive === 'true' : null,
            sortBy,
            sortOrder
        });

        await this.logActivity(req, 'VIEW_DOSAGES', 'Viewed dosages list');

        this.sendPaginatedResponse(res, result.data, result.pagination, 'Dosages retrieved successfully');
    });

    getDosageById = this.asyncHandler(async (req, res) => {
        const { id } = req.params;

        const dosage = await DosageService.getDosageById(id);

        await this.logActivity(req, 'VIEW_DOSAGE', `Viewed dosage: ${dosage.name}`);

        this.sendSuccess(res, dosage, 'Dosage retrieved successfully');
    });

    getDosageBySlug = this.asyncHandler(async (req, res) => {
        const { slug } = req.params;

        const dosage = await DosageService.getDosageBySlug(slug);

        this.sendSuccess(res, dosage, 'Dosage retrieved successfully');
    });

    createDosage = this.asyncHandler(async (req, res) => {
        const dosageData = { ...req.body };

        const dosage = await DosageService.createDosage(dosageData, req.user.id);

        await this.logActivity(req, 'CREATE_DOSAGE', `Created dosage: ${dosage.name}`, 'SUCCESS');

        this.sendSuccess(res, dosage, 'Dosage created successfully', 201);
    });

    updateDosage = this.asyncHandler(async (req, res) => {
        const { id } = req.params;
        const dosageData = { ...req.body };

        const dosage = await DosageService.updateDosage(id, dosageData, req.user.id);

        await this.logActivity(req, 'UPDATE_DOSAGE', `Updated dosage: ${dosage.name}`, 'SUCCESS');

        this.sendSuccess(res, dosage, 'Dosage updated successfully');
    });

    deleteDosage = this.asyncHandler(async (req, res) => {
        const { id } = req.params;

        await DosageService.deleteDosage(id, req.user.id);

        await this.logActivity(req, 'DELETE_DOSAGE', `Deleted dosage ID: ${id}`, 'SUCCESS');

        this.sendSuccess(res, null, 'Dosage deleted successfully');
    });

    getDosageStats = this.asyncHandler(async (req, res) => {
        const stats = await DosageService.getDosageStats();

        await this.logActivity(req, 'VIEW_DOSAGE_STATS', 'Viewed dosage statistics');

        this.sendSuccess(res, stats, 'Dosage statistics retrieved successfully');
    });
}

module.exports = new DosageController();
