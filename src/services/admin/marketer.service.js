const BaseService = require('../../utils/baseService');
const { Marketer, Product, User } = require('../../database/models');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { generateUniqueSlug } = require('../../utils/slug.utils');
const { Op } = require('sequelize');

class MarketerService extends BaseService {
  constructor() {
    super(Marketer, 'Marketer');
  }

  async getAllMarketers(options = {}) {
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

  async getMarketerById(id) {
    const marketer = await Marketer.findByPk(id, {
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

    if (!marketer) {
      throw new NotFoundError('Marketer not found');
    }

    return marketer;
  }

  async getMarketerBySlug(slug) {
    const marketer = await Marketer.findOne({
      where: { slug }
    });

    if (!marketer) {
      throw new NotFoundError('Marketer not found');
    }

    return marketer;
  }

  async createMarketer(data, createdBy) {
    const { name } = data;

    const existing = await Marketer.findOne({ where: { name } });
    if (existing) {
      throw new ConflictError('Marketer with this name already exists');
    }

    const slug = await generateUniqueSlug(name, Marketer);

    const marketer = await Marketer.create({
      ...data,
      slug,
      created_by: createdBy
    });

    return this.getMarketerById(marketer.id);
  }

  async updateMarketer(id, data, updatedBy) {
    const marketer = await Marketer.findByPk(id);
    if (!marketer) {
      throw new NotFoundError('Marketer not found');
    }

    if (data.name && data.name !== marketer.name) {
      const existing = await Marketer.findOne({ where: { name: data.name } });
      if (existing) {
        throw new ConflictError('Marketer name already in use');
      }
      data.slug = await generateUniqueSlug(data.name, Marketer, id);
    }

    await marketer.update({
      ...data,
      updated_by: updatedBy
    });

    return this.getMarketerById(id);
  }

  async deleteMarketer(id, deletedBy) {
    const marketer = await Marketer.findByPk(id);
    if (!marketer) {
      throw new NotFoundError('Marketer not found');
    }

    const productsCount = await Product.count({ where: { marketer_id: id } });
    if (productsCount > 0) {
      throw new ConflictError(`Cannot delete marketer. ${productsCount} product(s) are associated with it.`);
    }

    await marketer.update({ deleted_by: deletedBy });
    await marketer.destroy();

    return true;
  }

  async getMarketerStats() {
    const [total, active, withProducts] = await Promise.all([
      Marketer.count(),
      Marketer.count({ where: { is_active: true } }),
      Marketer.count({
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

module.exports = new MarketerService();
