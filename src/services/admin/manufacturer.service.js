const BaseService = require('../../utils/baseService');
const { Manufacturer, Brand, Product, User } = require('../../database/models');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { generateUniqueSlug } = require('../../utils/slug.utils');
const { Op } = require('sequelize');

class ManufacturerService extends BaseService {
  constructor() {
    super(Manufacturer, 'Manufacturer');
  }

  async getAllManufacturers(options = {}) {
    const {
      page = 1,
      limit = 10,
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

  async getManufacturerById(id) {
    const manufacturer = await Manufacturer.findByPk(id, {
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
        },
        {
          model: Brand,
          as: 'brands',
          attributes: ['id', 'name', 'slug', 'is_active']
        }
      ]
    });

    if (!manufacturer) {
      throw new NotFoundError('Manufacturer not found');
    }

    return manufacturer;
  }

  async getManufacturerBySlug(slug) {
    const manufacturer = await Manufacturer.findOne({
      where: { slug },
      include: [
        {
          model: Brand,
          as: 'brands',
          where: { is_active: true },
          required: false
        }
      ]
    });

    if (!manufacturer) {
      throw new NotFoundError('Manufacturer not found');
    }

    return manufacturer;
  }

  async createManufacturer(data, createdBy) {
    const { name } = data;

    const existing = await Manufacturer.findOne({ where: { name } });
    if (existing) {
      throw new ConflictError('Manufacturer with this name already exists');
    }

    const slug = await generateUniqueSlug(name, Manufacturer);

    const manufacturer = await Manufacturer.create({
      ...data,
      slug,
      created_by: createdBy
    });

    return this.getManufacturerById(manufacturer.id);
  }

  async updateManufacturer(id, data, updatedBy) {
    const manufacturer = await Manufacturer.findByPk(id);
    if (!manufacturer) {
      throw new NotFoundError('Manufacturer not found');
    }

    if (data.name && data.name !== manufacturer.name) {
      const existing = await Manufacturer.findOne({ where: { name: data.name } });
      if (existing) {
        throw new ConflictError('Manufacturer name already in use');
      }
      data.slug = await generateUniqueSlug(data.name, Manufacturer, id);
    }

    await manufacturer.update({
      ...data,
      updated_by: updatedBy
    });

    return this.getManufacturerById(id);
  }

  async deleteManufacturer(id, deletedBy) {
    const manufacturer = await Manufacturer.findByPk(id);
    if (!manufacturer) {
      throw new NotFoundError('Manufacturer not found');
    }

    // Soft-delete dependents first so the manufacturer can be removed without conflicts.
    const transaction = await Manufacturer.sequelize.transaction();
    try {
      // Soft delete brands tied to this manufacturer (if any still exist in schema).
      const brands = await Brand.findAll({ where: { manufacturer_id: id }, transaction, paranoid: true });
      for (const brand of brands) {
        await brand.update({ deleted_by: deletedBy }, { transaction });
        await brand.destroy({ transaction });
      }

      // Soft delete products tied to this manufacturer.
      const products = await Product.findAll({ where: { manufacturer_id: id }, transaction, paranoid: true });
      for (const product of products) {
        await product.update({ deleted_by: deletedBy }, { transaction });
        await product.destroy({ transaction });
      }

      await manufacturer.update({ deleted_by: deletedBy }, { transaction });
      await manufacturer.destroy({ transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getManufacturerStats() {
    const [total, active, withBrands] = await Promise.all([
      Manufacturer.count(),
      Manufacturer.count({ where: { is_active: true } }),
      Manufacturer.count({
        include: [{
          model: Brand,
          as: 'brands',
          required: true
        }]
      })
    ]);

    return {
      total,
      active,
      withBrands
    };
  }
}

module.exports = new ManufacturerService();
