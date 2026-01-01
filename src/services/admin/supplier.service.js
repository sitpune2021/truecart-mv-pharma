const BaseService = require('../../utils/baseService');
const { Supplier, Product, User } = require('../../database/models');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { generateUniqueSlug } = require('../../utils/slug.utils');
const { Op } = require('sequelize');

class SupplierService extends BaseService {
  constructor() {
    super(Supplier, 'Supplier');
  }

  async getAllSuppliers(options = {}) {
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
        { country: { [Op.iLike]: `%${search}%` } }
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

  async getSupplierById(id) {
    const supplier = await Supplier.findByPk(id, {
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

    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    return supplier;
  }

  async getSupplierBySlug(slug) {
    const supplier = await Supplier.findOne({
      where: { slug }
    });

    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    return supplier;
  }

  async createSupplier(data, createdBy) {
    const { name } = data;

    const existing = await Supplier.findOne({ where: { name } });
    if (existing) {
      throw new ConflictError('Supplier with this name already exists');
    }

    const slug = await generateUniqueSlug(name, Supplier);

    const supplier = await Supplier.create({
      ...data,
      slug,
      created_by: createdBy
    });

    return this.getSupplierById(supplier.id);
  }

  async updateSupplier(id, data, updatedBy) {
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    if (data.name && data.name !== supplier.name) {
      const existing = await Supplier.findOne({ where: { name: data.name } });
      if (existing) {
        throw new ConflictError('Supplier name already in use');
      }
      data.slug = await generateUniqueSlug(data.name, Supplier, id);
    }

    await supplier.update({
      ...data,
      updated_by: updatedBy
    });

    return this.getSupplierById(id);
  }

  async deleteSupplier(id, deletedBy) {
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    const productsCount = await Product.count({ where: { supplier_id: id } });
    if (productsCount > 0) {
      throw new ConflictError(`Cannot delete supplier. ${productsCount} product(s) are associated with it.`);
    }

    await supplier.update({ deleted_by: deletedBy });
    await supplier.destroy();

    return true;
  }

  async getSupplierStats() {
    const [total, active, withProducts] = await Promise.all([
      Supplier.count(),
      Supplier.count({ where: { is_active: true } }),
      Supplier.count({
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

module.exports = new SupplierService();
