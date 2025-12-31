const BaseController = require('../../utils/baseController');
const VendorInventoryService = require('../../services/vendor/inventory.service');

class VendorInventoryController extends BaseController {
  constructor() {
    super('VendorInventoryController');
  }

  /**
   * Get vendor's inventory list
   */
  getInventory = this.asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const result = await VendorInventoryService.getVendorInventory(vendorId, req.query);

    await this.logActivity(req, 'VIEW_INVENTORY', 'Viewed inventory list');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Inventory retrieved successfully');
  });

  /**
   * Get single inventory item
   */
  getInventoryItem = this.asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const { id } = req.params;

    const inventory = await VendorInventoryService.getInventoryById(id, vendorId);

    await this.logActivity(req, 'VIEW_INVENTORY_ITEM', `Viewed inventory item: ${inventory.product.name}`);

    this.sendSuccess(res, inventory, 'Inventory item retrieved successfully');
  });

  /**
   * Add product to inventory
   */
  addProduct = this.asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const inventory = await VendorInventoryService.addProductToInventory(vendorId, req.body, req.user.id);

    await this.logActivity(req, 'ADD_INVENTORY', `Added product to inventory: ${inventory.product_id}`, 'SUCCESS');

    this.sendSuccess(res, inventory, 'Product added to inventory successfully', 201);
  });

  /**
   * Restock inventory
   */
  restock = this.asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const { id } = req.params;

    const inventory = await VendorInventoryService.restockInventory(id, vendorId, req.body, req.user.id);

    await this.logActivity(req, 'RESTOCK_INVENTORY', `Restocked inventory: ${id}`, 'SUCCESS');

    this.sendSuccess(res, inventory, 'Inventory restocked successfully');
  });

  /**
   * Adjust stock allocation
   */
  adjustAllocation = this.asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const { id } = req.params;

    const inventory = await VendorInventoryService.adjustAllocation(id, vendorId, req.body, req.user.id);

    await this.logActivity(req, 'ADJUST_ALLOCATION', `Adjusted stock allocation: ${id}`, 'SUCCESS');

    this.sendSuccess(res, inventory, 'Stock allocation adjusted successfully');
  });

  /**
   * Update inventory settings
   */
  updateSettings = this.asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const { id } = req.params;

    const inventory = await VendorInventoryService.updateInventorySettings(id, vendorId, req.body, req.user.id);

    await this.logActivity(req, 'UPDATE_INVENTORY_SETTINGS', `Updated inventory settings: ${id}`, 'SUCCESS');

    this.sendSuccess(res, inventory, 'Inventory settings updated successfully');
  });

  /**
   * Remove product from inventory
   */
  removeProduct = this.asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const { id } = req.params;

    await VendorInventoryService.removeFromInventory(id, vendorId, req.user.id);

    await this.logActivity(req, 'REMOVE_INVENTORY', `Removed product from inventory: ${id}`, 'SUCCESS');

    this.sendSuccess(res, null, 'Product removed from inventory successfully');
  });

  /**
   * Get inventory logs
   */
  getLogs = this.asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const result = await VendorInventoryService.getInventoryLogs(vendorId, req.query);

    await this.logActivity(req, 'VIEW_INVENTORY_LOGS', 'Viewed inventory logs');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Inventory logs retrieved successfully');
  });

  /**
   * Get low stock items
   */
  getLowStock = this.asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const items = await VendorInventoryService.getLowStockItems(vendorId);

    await this.logActivity(req, 'VIEW_LOW_STOCK', 'Viewed low stock items');

    this.sendSuccess(res, items, 'Low stock items retrieved successfully');
  });
}

module.exports = new VendorInventoryController();
