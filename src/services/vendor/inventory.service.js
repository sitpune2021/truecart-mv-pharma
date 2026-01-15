const BaseService = require('../../utils/baseService');
const { ConflictError } = require('../../utils/errors');
const { VendorInventory, InventoryLog, Product, User, sequelize } = require('../../database/models');
const { Op } = require('sequelize');

class VendorInventoryService extends BaseService {
  constructor() {
    super(VendorInventory, 'VendorInventory');
  }

  /**
   * Get vendor's inventory with pagination and filters
   */
  async getVendorInventory(vendorId, options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      lowStockOnly = false,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    const where = { vendor_id: vendorId };

    if (lowStockOnly) {
      where[Op.and] = sequelize.literal(`"VendorInventory"."total_stock" <= "VendorInventory"."low_stock_threshold"`);
    }

    const include = [
      {
        model: Product,
        as: 'product',
        where: search ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { sku: { [Op.iLike]: `%${search}%` } }
          ]
        } : undefined,
        required: !!search
      }
    ];

    const { rows: data, count: total } = await VendorInventory.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      distinct: true
    });

    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single inventory item by ID
   */
  async getInventoryById(id, vendorId) {
    const inventory = await VendorInventory.findOne({
      where: { id, vendor_id: vendorId },
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'vendor' }
      ]
    });

    if (!inventory) {
      throw new Error('Inventory item not found');
    }

    return inventory;
  }

  /**
   * Add product to vendor inventory
   */
  async addProductToInventory(vendorId, data, createdBy) {
    const { product_id, total_stock, online_stock, offline_stock, low_stock_threshold } = data;

    return await sequelize.transaction(async (transaction) => {
      // Check if product exists
      const product = await Product.findByPk(product_id, { transaction });
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if vendor already has this product
      const existing = await VendorInventory.findOne({
        where: { vendor_id: vendorId, product_id },
        transaction
      });

      if (existing) {
        throw new ConflictError('Product already exists in your inventory');
      }

      // Validate stock allocation
      if (total_stock !== online_stock + offline_stock) {
        throw new Error('Total stock must equal online stock plus offline stock');
      }

      const inventory = await VendorInventory.create({
        vendor_id: vendorId,
        product_id,
        total_stock: total_stock || 0,
        online_stock: online_stock || 0,
        offline_stock: offline_stock || 0,
        low_stock_threshold: low_stock_threshold || 10,
        created_by: createdBy,
        updated_by: createdBy
      }, { transaction });

      // Log the initial stock
      await this.createInventoryLog({
        vendor_id: vendorId,
        product_id,
        transaction_type: 'restock',
        quantity_change: total_stock || 0,
        stock_type: 'total',
        previous_total_stock: 0,
        new_total_stock: total_stock || 0,
        previous_online_stock: 0,
        new_online_stock: online_stock || 0,
        previous_offline_stock: 0,
        new_offline_stock: offline_stock || 0,
        reference_type: 'initial_stock',
        notes: 'Initial stock added',
        performed_by: createdBy
      }, transaction);

      return inventory;
    });
  }

  /**
   * Restock inventory with optional allocation and threshold updates
   */
  async restockInventory(id, vendorId, data, updatedBy) {
    const {
      quantity,
      stock_type = 'total', // 'total' | 'online' | 'offline'
      notes,
      low_stock_threshold,
      new_online_stock,
      new_offline_stock
    } = data;

    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    return await sequelize.transaction(async (transaction) => {
      const inventory = await VendorInventory.findOne({
        where: { id, vendor_id: vendorId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!inventory) {
        throw new Error('Inventory item not found');
      }

      const previousTotal = inventory.total_stock;
      const previousOnline = inventory.online_stock;
      const previousOffline = inventory.offline_stock;

      const newTotal = previousTotal + quantity;

      let nextOnline = previousOnline;
      let nextOffline = previousOffline;

      const overrideProvided = new_online_stock !== undefined && new_offline_stock !== undefined;

      if (overrideProvided) {
        if (new_online_stock < 0 || new_offline_stock < 0) {
          throw new Error('Stock values cannot be negative');
        }

        const overrideSum = new_online_stock + new_offline_stock;

        if (stock_type === 'total' && overrideSum === quantity) {
          // Treat provided values as allocation for the incoming quantity
          nextOnline = previousOnline + new_online_stock;
          nextOffline = previousOffline + new_offline_stock;
        } else if (overrideSum === newTotal) {
          // Treat provided values as absolute totals
          nextOnline = new_online_stock;
          nextOffline = new_offline_stock;
        } else {
          throw new Error('Provided online/offline stock must sum to the quantity or new total stock value');
        }
      } else {
        if (stock_type === 'online') {
          nextOnline = previousOnline + quantity;
          nextOffline = previousOffline;
        } else if (stock_type === 'offline') {
          nextOffline = previousOffline + quantity;
          nextOnline = previousOnline;
        } else {
          // distribute proportionally based on existing allocation
          const totalCurrent = previousOnline + previousOffline;
          if (totalCurrent > 0) {
            const onlineRatio = previousOnline / totalCurrent;
            nextOnline = previousOnline + Math.round(quantity * onlineRatio);
            nextOffline = newTotal - nextOnline;
          } else {
            // default split 60/40 when no prior stock
            nextOnline = Math.round(quantity * 0.6);
            nextOffline = newTotal - nextOnline;
          }
        }
      }

      // Final validation
      if (nextOnline < 0 || nextOffline < 0) {
        throw new Error('Stock values cannot be negative');
      }
      if (nextOnline + nextOffline !== newTotal) {
        throw new Error('Online and offline stock must equal total stock');
      }

      inventory.total_stock = newTotal;
      inventory.online_stock = nextOnline;
      inventory.offline_stock = nextOffline;
      if (low_stock_threshold !== undefined) {
        inventory.low_stock_threshold = low_stock_threshold;
      }
      inventory.updated_by = updatedBy;

      await inventory.save({ transaction });

      await this.createInventoryLog({
        vendor_id: vendorId,
        product_id: inventory.product_id,
        transaction_type: 'restock',
        quantity_change: quantity,
        stock_type,
        previous_total_stock: previousTotal,
        new_total_stock: inventory.total_stock,
        previous_online_stock: previousOnline,
        new_online_stock: inventory.online_stock,
        previous_offline_stock: previousOffline,
        new_offline_stock: inventory.offline_stock,
        reference_type: 'manual_restock',
        notes: notes || `Restocked ${quantity} units`,
        performed_by: updatedBy
      }, transaction);

      return inventory;
    });
  }

  /**
   * Adjust stock allocation between online and offline
   */
  async adjustAllocation(id, vendorId, data, updatedBy) {
    const { online_stock, offline_stock, notes } = data;

    return await sequelize.transaction(async (transaction) => {
      const inventory = await VendorInventory.findOne({
        where: { id, vendor_id: vendorId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!inventory) {
        throw new Error('Inventory item not found');
      }

      // Validate new allocation
      if (online_stock + offline_stock !== inventory.total_stock) {
        throw new Error('Online stock plus offline stock must equal total stock');
      }

      if (online_stock < 0 || offline_stock < 0) {
        throw new Error('Stock values cannot be negative');
      }

      const previousOnline = inventory.online_stock;
      const previousOffline = inventory.offline_stock;

      inventory.online_stock = online_stock;
      inventory.offline_stock = offline_stock;
      inventory.updated_by = updatedBy;

      await inventory.save({ transaction });

      // Log the allocation change
      await this.createInventoryLog({
        vendor_id: vendorId,
        product_id: inventory.product_id,
        transaction_type: 'allocation_change',
        quantity_change: 0,
        stock_type: 'total',
        previous_total_stock: inventory.total_stock,
        new_total_stock: inventory.total_stock,
        previous_online_stock: previousOnline,
        new_online_stock: online_stock,
        previous_offline_stock: previousOffline,
        new_offline_stock: offline_stock,
        reference_type: 'manual_allocation',
        notes: notes || 'Stock allocation adjusted',
        performed_by: updatedBy
      }, transaction);

      return inventory;
    });
  }

  /**
   * Update inventory settings (low stock threshold)
   */
  async updateInventorySettings(id, vendorId, data, updatedBy) {
    const { low_stock_threshold } = data;

    const inventory = await this.getInventoryById(id, vendorId);

    if (low_stock_threshold !== undefined) {
      inventory.low_stock_threshold = low_stock_threshold;
    }

    inventory.updated_by = updatedBy;
    await inventory.save();

    return inventory;
  }

  /**
   * Remove product from inventory (soft delete)
   */
  async removeFromInventory(id, vendorId, deletedBy) {
    const inventory = await this.getInventoryById(id, vendorId);

    if (inventory.total_stock > 0) {
      throw new Error('Cannot remove product with existing stock. Adjust stock to 0 first.');
    }

    inventory.deleted_by = deletedBy;
    await inventory.destroy();

    return true;
  }

  /**
   * Get inventory history/logs
   */
  async getInventoryLogs(vendorId, options = {}) {
    const {
      page = 1,
      limit = 50,
      product_id,
      transaction_type,
      startDate,
      endDate
    } = options;

    const offset = (page - 1) * limit;
    const where = { vendor_id: vendorId };

    if (product_id) {
      where.product_id = product_id;
    }

    if (transaction_type) {
      where.transaction_type = transaction_type;
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at[Op.gte] = new Date(startDate);
      if (endDate) where.created_at[Op.lte] = new Date(endDate);
    }

    const { rows: data, count: total } = await InventoryLog.findAndCountAll({
      where,
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'performer' }
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Create inventory log entry
   */
  async createInventoryLog(logData, transaction = null) {
    return await InventoryLog.create(logData, transaction ? { transaction } : {});
  }

  /**
   * Get low stock items for vendor
   */
  async getLowStockItems(vendorId) {
    return await VendorInventory.findAll({
      where: {
        vendor_id: vendorId,
        [Op.and]: sequelize.literal(`"VendorInventory"."total_stock" <= "VendorInventory"."low_stock_threshold"`)
      },
      include: [{ model: Product, as: 'product' }],
      order: [['total_stock', 'ASC']]
    });
  }
}

module.exports = new VendorInventoryService();
