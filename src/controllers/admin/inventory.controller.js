const BaseController = require('../../utils/baseController');
const AdminInventoryService = require('../../services/admin/inventory.service');

class AdminInventoryController extends BaseController {
  constructor() {
    super('AdminInventoryController');
  }

  /**
   * Get aggregated inventory across all vendors
   */
  getAggregatedInventory = this.asyncHandler(async (req, res) => {
    const result = await AdminInventoryService.getAggregatedInventory(req.query);

    await this.logActivity(req, 'VIEW_AGGREGATED_INVENTORY', 'Viewed aggregated inventory');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Aggregated inventory retrieved successfully');
  });

  /**
   * Get inventory breakdown by vendor for a product
   */
  getProductByVendor = this.asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const result = await AdminInventoryService.getProductInventoryByVendor(productId, req.query);

    await this.logActivity(req, 'VIEW_PRODUCT_BY_VENDOR', `Viewed product inventory by vendor: ${productId}`);

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Product inventory by vendor retrieved successfully');
  });

  /**
   * Get specific vendor's inventory
   */
  getVendorInventory = this.asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    const result = await AdminInventoryService.getVendorInventory(vendorId, req.query);

    await this.logActivity(req, 'VIEW_VENDOR_INVENTORY', `Viewed vendor inventory: ${vendorId}`);

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Vendor inventory retrieved successfully');
  });

  /**
   * Get all low stock items
   */
  getLowStockItems = this.asyncHandler(async (req, res) => {
    const result = await AdminInventoryService.getAllLowStockItems(req.query);

    await this.logActivity(req, 'VIEW_LOW_STOCK_ITEMS', 'Viewed all low stock items');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Low stock items retrieved successfully');
  });

  /**
   * Get inventory statistics
   */
  getStats = this.asyncHandler(async (req, res) => {
    const stats = await AdminInventoryService.getInventoryStats();

    await this.logActivity(req, 'VIEW_INVENTORY_STATS', 'Viewed inventory statistics');

    this.sendSuccess(res, stats, 'Inventory statistics retrieved successfully');
  });

  /**
   * Get inventory activity logs
   */
  getLogs = this.asyncHandler(async (req, res) => {
    const result = await AdminInventoryService.getInventoryLogs(req.query);

    await this.logActivity(req, 'VIEW_INVENTORY_LOGS', 'Viewed inventory logs');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Inventory logs retrieved successfully');
  });

  /**
   * Get vendor inventory summary
   */
  getVendorSummary = this.asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    const summary = await AdminInventoryService.getVendorInventorySummary(vendorId);

    await this.logActivity(req, 'VIEW_VENDOR_SUMMARY', `Viewed vendor inventory summary: ${vendorId}`);

    this.sendSuccess(res, summary, 'Vendor inventory summary retrieved successfully');
  });
}

module.exports = new AdminInventoryController();
