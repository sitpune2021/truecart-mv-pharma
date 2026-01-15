const { VendorInventory, InventoryLog, Product, User, sequelize } = require('../../database/models');
const { Op } = require('sequelize');

class AdminInventoryService {
  /**
   * Get aggregated inventory across all vendors
   */
  async getAggregatedInventory(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      lowStockOnly = false,
      sortBy = 'total_inventory',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;

    // Build product search condition
    const productWhere = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    // Get aggregated data
    const query = `
      SELECT 
        p.id,
        p.sku,
        p.name,
        p.category,
        p.brand,
        p.primary_image,
        COALESCE(SUM(vi.total_stock), 0) as total_inventory,
        COALESCE(SUM(vi.online_stock), 0) as total_online,
        COALESCE(SUM(vi.offline_stock), 0) as total_offline,
        COUNT(DISTINCT vi.vendor_id) as vendor_count,
        MIN(vi.low_stock_threshold) as min_threshold,
        CASE 
          WHEN COALESCE(SUM(vi.total_stock), 0) <= MIN(vi.low_stock_threshold) THEN true
          ELSE false
        END as is_low_stock
      FROM tc_products p
      LEFT JOIN tc_vendor_inventory vi ON p.id = vi.product_id AND vi.deleted_at IS NULL
      WHERE p.deleted_at IS NULL
        ${search ? `AND (p.name ILIKE '%${search}%' OR p.sku ILIKE '%${search}%')` : ''}
      GROUP BY p.id, p.sku, p.name, p.category, p.brand, p.primary_image
      ${lowStockOnly ? 'HAVING COALESCE(SUM(vi.total_stock), 0) <= MIN(vi.low_stock_threshold)' : ''}
      ORDER BY ${sortBy === 'name' ? 'p.name' : sortBy} ${sortOrder}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        SELECT p.id
        FROM tc_products p
        LEFT JOIN tc_vendor_inventory vi ON p.id = vi.product_id AND vi.deleted_at IS NULL
        WHERE p.deleted_at IS NULL
          ${search ? `AND (p.name ILIKE '%${search}%' OR p.sku ILIKE '%${search}%')` : ''}
        GROUP BY p.id
        ${lowStockOnly ? 'HAVING COALESCE(SUM(vi.total_stock), 0) <= MIN(vi.low_stock_threshold)' : ''}
      ) as subquery
    `;

    const [data] = await sequelize.query(query);
    const [[{ total }]] = await sequelize.query(countQuery);

    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get inventory breakdown by vendor for a specific product
   */
  async getProductInventoryByVendor(productId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const { rows: data, count: total } = await VendorInventory.findAndCountAll({
      where: { product_id: productId },
      include: [
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'sku', 'name', 'primary_image']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['total_stock', 'DESC']]
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
   * Get inventory for a specific vendor
   */
  async getVendorInventory(vendorId, options = {}) {
    const { page = 1, limit = 10, search } = options;
    const offset = (page - 1) * limit;

    const where = { vendor_id: vendorId };
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
      order: [['total_stock', 'DESC']],
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
   * Get all low stock items across platform
   */
  async getAllLowStockItems(options = {}) {
    const { page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    const { rows: data, count: total } = await VendorInventory.findAndCountAll({
      where: {
        [Op.and]: sequelize.where(
          sequelize.col('VendorInventory.total_stock'),
          Op.lte,
          sequelize.col('VendorInventory.low_stock_threshold')
        )
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'sku', 'name', 'category', 'brand', 'primary_image']
        },
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'full_name', 'email', 'phone']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['total_stock', 'ASC']]
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
   * Get inventory statistics
   */
  async getInventoryStats() {
    const [stats] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT vi.vendor_id) as total_vendors_with_inventory,
        COALESCE(SUM(vi.total_stock), 0) as total_stock_across_platform,
        COALESCE(SUM(vi.online_stock), 0) as total_online_stock,
        COALESCE(SUM(vi.offline_stock), 0) as total_offline_stock,
        COUNT(DISTINCT CASE 
          WHEN vi.total_stock <= vi.low_stock_threshold THEN vi.id 
        END) as low_stock_items_count,
        COUNT(DISTINCT CASE 
          WHEN vi.total_stock = 0 THEN vi.id 
        END) as out_of_stock_items_count
      FROM tc_products p
      LEFT JOIN tc_vendor_inventory vi ON p.id = vi.product_id AND vi.deleted_at IS NULL
      WHERE p.deleted_at IS NULL
    `);

    return stats[0];
  }

  /**
   * Get inventory activity logs (admin view)
   */
  async getInventoryLogs(options = {}) {
    const {
      page = 1,
      limit = 50,
      vendor_id,
      product_id,
      transaction_type,
      startDate,
      endDate
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    if (vendor_id) where.vendor_id = vendor_id;
    if (product_id) where.product_id = product_id;
    if (transaction_type) where.transaction_type = transaction_type;

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at[Op.gte] = new Date(startDate);
      if (endDate) where.created_at[Op.lte] = new Date(endDate);
    }

    const { rows: data, count: total } = await InventoryLog.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'sku', 'name']
        },
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'performer',
          attributes: ['id', 'full_name']
        }
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
   * Get vendor inventory summary
   */
  async getVendorInventorySummary(vendorId) {
    const [summary] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT vi.product_id) as total_products,
        COALESCE(SUM(vi.total_stock), 0) as total_stock,
        COALESCE(SUM(vi.online_stock), 0) as total_online_stock,
        COALESCE(SUM(vi.offline_stock), 0) as total_offline_stock,
        COUNT(DISTINCT CASE 
          WHEN vi.total_stock <= vi.low_stock_threshold THEN vi.id 
        END) as low_stock_count,
        COUNT(DISTINCT CASE 
          WHEN vi.total_stock = 0 THEN vi.id 
        END) as out_of_stock_count
      FROM tc_vendor_inventory vi
      WHERE vi.vendor_id = :vendorId AND vi.deleted_at IS NULL
    `, {
      replacements: { vendorId },
      type: sequelize.QueryTypes.SELECT
    });

    return summary;
  }
}

module.exports = new AdminInventoryService();
