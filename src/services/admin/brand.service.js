const BaseService = require('../../utils/baseService');
const { Brand, Manufacturer, Product, User } = require('../../database/models');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { generateUniqueSlug } = require('../../utils/slug.utils');
const { Op } = require('sequelize');

class BrandService extends BaseService {
  constructor() {
    super(Brand, 'Brand');
  }

  async getAllBrands(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      manufacturerId = null,
      isActive = null,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = options;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (manufacturerId) {
      where.manufacturer_id = manufacturerId;
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
          model: Manufacturer,
          as: 'manufacturer',
          attributes: ['id', 'name', 'slug']
        },
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

  async getBrandById(id) {
    const brand = await Brand.findByPk(id, {
      include: [
        {
          model: Manufacturer,
          as: 'manufacturer',
          attributes: ['id', 'name', 'slug', 'country']
        },
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

    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    return brand;
  }

  async getBrandBySlug(slug) {
    const brand = await Brand.findOne({
      where: { slug },
      include: [
        {
          model: Manufacturer,
          as: 'manufacturer'
        }
      ]
    });

    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    return brand;
  }

  async createBrand(data, createdBy) {
    const { name, manufacturer_id } = data;

    const existing = await Brand.findOne({ where: { name } });
    if (existing) {
      throw new ConflictError('Brand with this name already exists');
    }

    if (manufacturer_id) {
      const manufacturer = await Manufacturer.findByPk(manufacturer_id);
      if (!manufacturer) {
        throw new NotFoundError('Manufacturer not found');
      }
    }

    const slug = await generateUniqueSlug(name, Brand);

    const brand = await Brand.create({
      ...data,
      slug,
      created_by: createdBy
    });

    return this.getBrandById(brand.id);
  }

  async updateBrand(id, data, updatedBy) {
    const brand = await Brand.findByPk(id);
    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    if (data.name && data.name !== brand.name) {
      const existing = await Brand.findOne({ where: { name: data.name } });
      if (existing) {
        throw new ConflictError('Brand name already in use');
      }
      data.slug = await generateUniqueSlug(data.name, Brand, id);
    }

    if (data.manufacturer_id && data.manufacturer_id !== brand.manufacturer_id) {
      const manufacturer = await Manufacturer.findByPk(data.manufacturer_id);
      if (!manufacturer) {
        throw new NotFoundError('Manufacturer not found');
      }
    }

    await brand.update({
      ...data,
      updated_by: updatedBy
    });

    return this.getBrandById(id);
  }

  async deleteBrand(id, deletedBy) {
    const brand = await Brand.findByPk(id);
    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    const productsCount = await Product.count({ where: { brand_id: id } });
    if (productsCount > 0) {
      throw new ConflictError(`Cannot delete brand. ${productsCount} product(s) are associated with it.`);
    }

    await brand.update({ deleted_by: deletedBy });
    await brand.destroy();

    return true;
  }

  async getBrandStats() {
    const [total, active, withManufacturer] = await Promise.all([
      Brand.count(),
      Brand.count({ where: { is_active: true } }),
      Brand.count({ where: { manufacturer_id: { [Op.ne]: null } } })
    ]);

    return {
      total,
      active,
      withManufacturer
    };
  }
}

module.exports = new BrandService();
