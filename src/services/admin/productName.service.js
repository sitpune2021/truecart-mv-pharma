const BaseService = require('../../utils/baseService');
const { ProductName, Product, User } = require('../../database/models');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { generateUniqueSlug } = require('../../utils/slug.utils');
const { Op } = require('sequelize');

class ProductNameService extends BaseService {
  constructor() {
    super(ProductName, 'ProductName');
  }

  async getAllProductNames(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      isActive = null,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = options;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { uses: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (isActive !== null) {
      where.is_active = isActive;
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

  async getProductNameById(id) {
    const productName = await ProductName.findByPk(id, {
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

    if (!productName) {
      throw new NotFoundError('Product name not found');
    }

    return productName;
  }

  async getProductNameBySlug(slug) {
    const productName = await ProductName.findOne({
      where: { slug }
    });

    if (!productName) {
      throw new NotFoundError('Product name not found');
    }

    return productName;
  }

  async createProductName(data, createdBy) {
    const { name } = data;

    const existing = await ProductName.findOne({ where: { name } });
    if (existing) {
      throw new ConflictError('Product name already exists');
    }

    const slug = await generateUniqueSlug(name, ProductName);

    const productName = await ProductName.create({
      ...data,
      slug,
      created_by: createdBy
    });

    return this.getProductNameById(productName.id);
  }

  async updateProductName(id, data, updatedBy) {
    const productName = await ProductName.findByPk(id);
    if (!productName) {
      throw new NotFoundError('Product name not found');
    }

    if (data.name && data.name !== productName.name) {
      const existing = await ProductName.findOne({ where: { name: data.name } });
      if (existing) {
        throw new ConflictError('Product name already in use');
      }
      data.slug = await generateUniqueSlug(data.name, ProductName, id);
    }

    await productName.update({
      ...data,
      updated_by: updatedBy
    });

    return this.getProductNameById(id);
  }

  async deleteProductName(id, deletedBy) {
    const productName = await ProductName.findByPk(id);
    if (!productName) {
      throw new NotFoundError('Product name not found');
    }

    const productsCount = await Product.count({ where: { product_name_id: id } });
    if (productsCount > 0) {
      throw new ConflictError(`Cannot delete product name. ${productsCount} product(s) are associated with it.`);
    }

    await productName.update({ deleted_by: deletedBy });
    await productName.destroy();

    return true;
  }

  async getProductNameStats() {
    const [total, active, withProducts] = await Promise.all([
      ProductName.count(),
      ProductName.count({ where: { is_active: true } }),
      ProductName.count({
        include: [{
          model: Product,
          as: 'products',
          required: true
        }]
      })
    ]);

    return {
      total,
      active,
      withProducts
    };
  }
}

module.exports = new ProductNameService();
