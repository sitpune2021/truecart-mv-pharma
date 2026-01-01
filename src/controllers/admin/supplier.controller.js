const BaseController = require('../../utils/baseController');
const SupplierService = require('../../services/admin/supplier.service');

class SupplierController extends BaseController {
  constructor() {
    super('SupplierController');
  }

  getAllSuppliers = this.asyncHandler(async (req, res) => {
    const { page, limit, search, isActive, sortBy, sortOrder } = req.query;

    const result = await SupplierService.getAllSuppliers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : null,
      sortBy,
      sortOrder
    });

    await this.logActivity(req, 'VIEW_SUPPLIERS', 'Viewed suppliers list');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Suppliers retrieved successfully');
  });

  getSupplierById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const supplier = await SupplierService.getSupplierById(id);

    await this.logActivity(req, 'VIEW_SUPPLIER', `Viewed supplier: ${supplier.name}`);

    this.sendSuccess(res, supplier, 'Supplier retrieved successfully');
  });

  getSupplierBySlug = this.asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const supplier = await SupplierService.getSupplierBySlug(slug);

    this.sendSuccess(res, supplier, 'Supplier retrieved successfully');
  });

  createSupplier = this.asyncHandler(async (req, res) => {
    const supplierData = { ...req.body };

    const supplier = await SupplierService.createSupplier(supplierData, req.user.id);

    await this.logActivity(req, 'CREATE_SUPPLIER', `Created supplier: ${supplier.name}`, 'SUCCESS');

    this.sendSuccess(res, supplier, 'Supplier created successfully', 201);
  });

  updateSupplier = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const supplierData = { ...req.body };

    const supplier = await SupplierService.updateSupplier(id, supplierData, req.user.id);
    await this.logActivity(req, 'UPDATE_SUPPLIER', `Updated supplier: ${supplier.name}`, 'SUCCESS');

    this.sendSuccess(res, supplier, 'Supplier updated successfully');
  });

  deleteSupplier = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    await SupplierService.deleteSupplier(id, req.user.id);

    await this.logActivity(req, 'DELETE_SUPPLIER', `Deleted supplier ID: ${id}`, 'SUCCESS');

    this.sendSuccess(res, null, 'Supplier deleted successfully');
  });

  getSupplierStats = this.asyncHandler(async (req, res) => {
    const stats = await SupplierService.getSupplierStats();

    await this.logActivity(req, 'VIEW_SUPPLIER_STATS', 'Viewed supplier statistics');

    this.sendSuccess(res, stats, 'Supplier statistics retrieved successfully');
  });
}

module.exports = new SupplierController();