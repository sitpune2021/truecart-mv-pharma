const BaseService = require('../../utils/baseService');
const { Product, User } = require('../../database/models');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { Op } = require('sequelize');

class ProductService extends BaseService {
  constructor() {
    super(Product, 'Product');
  }

  /**
   * Get all products with filters
   */
  async getAllProducts(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = null,
      brand = null,
      isActive = null,
      isFeatured = null,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = brand;
    }

    if (isActive !== null) {
      where.is_active = isActive;
    }

    if (isFeatured !== null) {
      where.is_featured = isFeatured;
    }

    const result = await this.findAll({
      page,
      limit,
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [[sortBy, sortOrder]]
    });

    return result;
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  /**
   * Create new product
   */
  async createProduct(data, createdBy) {
    const { sku } = data;

    // Check if SKU already exists
    const existing = await Product.findOne({ where: { sku } });
    if (existing) {
      throw new ConflictError('Product with this SKU already exists');
    }

    const product = await Product.create({
      ...data,
      created_by: createdBy
    });

    return this.getProductById(product.id);
  }

  /**
   * Update product
   */
  async updateProduct(id, data, updatedBy) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check SKU uniqueness if changed
    if (data.sku && data.sku !== product.sku) {
      const existing = await Product.findOne({ where: { sku: data.sku } });
      if (existing) {
        throw new ConflictError('SKU already in use');
      }
    }

    await product.update({
      ...data,
      updated_by: updatedBy
    });

    return this.getProductById(id);
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(id, deletedBy) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await product.update({ deleted_by: deletedBy });
    await product.destroy();

    return true;
  }

  /**
   * Update product stock
   */
  async updateStock(id, quantity, updatedBy) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await product.update({
      stock_quantity: quantity,
      updated_by: updatedBy
    });

    return this.getProductById(id);
  }

  /**
   * Get product statistics
   */
  async getProductStats() {
    const [total, active, featured, lowStock, outOfStock] = await Promise.all([
      Product.count(),
      Product.count({ where: { is_active: true } }),
      Product.count({ where: { is_featured: true } }),
      Product.count({
        where: {
          stock_quantity: {
            [Op.lte]: Product.sequelize.col('low_stock_threshold'),
            [Op.gt]: 0
          }
        }
      }),
      Product.count({ where: { stock_quantity: 0 } })
    ]);

    return {
      total,
      active,
      featured,
      lowStock,
      outOfStock
    };
  }

  /**
   * Get categories
   */
  async getCategories() {
    const categories = await Product.findAll({
      attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('category')), 'category']],
      where: {
        category: { [Op.ne]: null }
      },
      raw: true
    });

    return categories.map(c => c.category).filter(Boolean);
  }

  /**
   * Get brands
   */
  async getBrands() {
    const brands = await Product.findAll({
      attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('brand')), 'brand']],
      where: {
        brand: { [Op.ne]: null }
      },
      raw: true
    });

    return brands.map(b => b.brand).filter(Boolean);
  }
}

module.exports = new ProductService();
