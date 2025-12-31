const BaseService = require('../../utils/baseService');
const { Category, Product, User } = require('../../database/models');
const { NotFoundError, ConflictError, ValidationError } = require('../../utils/errors');
const { generateUniqueSlug, generateCategorySlug } = require('../../utils/slug.utils');
const { Op } = require('sequelize');

class CategoryService extends BaseService {
  constructor() {
    super(Category, 'Category');
  }

  async getAllCategories(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      level = null,
      parentId = null,
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

    if (level !== null) {
      where.level = level;
    }

    if (parentId !== null) {
      where.parent_id = parentId;
    }

    if (isActive !== null) {
      where.is_active = isActive;
    }

    const sortableFields = [
      'name',
      'level',
      'is_active',
      'created_at',
      'updated_at'
    ];

    const normalizedSortBy = sortableFields.includes(sortBy) ? sortBy : 'name';

    const result = await this.findAll({
      page,
      limit,
      where,
      include: [
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug', 'level']
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
      order: [[normalizedSortBy, sortOrder]]
    });

    return result;
  }

  async getCategoryTree() {
    const categories = await Category.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'slug', 'level', 'parent_id', 'icon', 'image_url']
    });

    const buildTree = (parentId = null) => {
      return categories
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
          ...cat.toJSON(),
          children: buildTree(cat.id)
        }));
    };

    return buildTree();
  }

  async getCategoryById(id) {
    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug', 'level']
        },
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug', 'level', 'is_active']
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

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  async getCategoryBySlug(slug) {
    const category = await Category.findOne({
      where: { slug },
      include: [
        {
          model: Category,
          as: 'parent'
        },
        {
          model: Category,
          as: 'children',
          where: { is_active: true },
          required: false
        }
      ]
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  async getCategoryChildren(id) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const children = await Category.findAll({
      where: { parent_id: id, is_active: true },
      order: [['name', 'ASC']]
    });

    return children;
  }

  async getCategoriesByLevel(level, parentId = null) {
    const where = { level, is_active: true };
    
    if (parentId) {
      where.parent_id = parentId;
    } else if (level === 1) {
      where.parent_id = null;
    }

    const categories = await Category.findAll({
      where,
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'slug', 'level', 'parent_id', 'icon', 'image_url'],
      include: [
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug', 'level']
        }
      ]
    });

    return categories.map((category) => {
      const plain = category.toJSON();
      return {
        ...plain,
        parent_name: plain.parent?.name || null
      };
    });
  }

  async getSubCategories(parentId) {
    const parent = await Category.findByPk(parentId);
    if (!parent) {
      throw new NotFoundError('Parent category not found');
    }

    const subCategories = await Category.findAll({
      where: { 
        parent_id: parentId,
        level: parent.level + 1,
        is_active: true 
      },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'slug', 'level', 'parent_id', 'icon', 'image_url']
    });

    return subCategories;
  }

  async createCategory(data, createdBy) {
    const { name, parent_id, level } = data;

    if (level < 1 || level > 3) {
      throw new ValidationError('Category level must be 1, 2, or 3');
    }

    if (level === 1 && parent_id) {
      throw new ValidationError('Level 1 categories cannot have a parent');
    }

    if (level > 1 && !parent_id) {
      throw new ValidationError(`Level ${level} categories must have a parent`);
    }

    let parent = null;
    if (parent_id) {
      parent = await Category.findByPk(parent_id);
      if (!parent) {
        throw new NotFoundError('Parent category not found');
      }

      if (parent.level !== level - 1) {
        throw new ValidationError(`Parent category must be level ${level - 1}`);
      }
    }

    const slug = generateCategorySlug(name, parent);
    const existingSlug = await Category.findOne({ where: { slug } });
    if (existingSlug) {
      const uniqueSlug = await generateUniqueSlug(slug, Category);
      data.slug = uniqueSlug;
    } else {
      data.slug = slug;
    }

    const category = await Category.create({
      ...data,
      created_by: createdBy
    });

    return this.getCategoryById(category.id);
  }

  async updateCategory(id, data, updatedBy) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (data.parent_id && data.parent_id === id) {
      throw new ValidationError('Category cannot be its own parent');
    }

    if (data.name && data.name !== category.name) {
      let parent = null;
      if (category.parent_id) {
        parent = await Category.findByPk(category.parent_id);
      }
      
      const newSlug = generateCategorySlug(data.name, parent);
      const existingSlug = await Category.findOne({ 
        where: { 
          slug: newSlug,
          id: { [Op.ne]: id }
        } 
      });
      
      if (existingSlug) {
        data.slug = await generateUniqueSlug(newSlug, Category, id);
      } else {
        data.slug = newSlug;
      }
    }

    await category.update({
      ...data,
      updated_by: updatedBy
    });

    return this.getCategoryById(id);
  }

  async deleteCategory(id, deletedBy) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const childrenCount = await Category.count({ where: { parent_id: id } });
    if (childrenCount > 0) {
      throw new ConflictError(`Cannot delete category. ${childrenCount} sub-category(ies) exist.`);
    }

    const productsCount = await Product.count({ where: { category_id: id } });
    if (productsCount > 0) {
      throw new ConflictError(`Cannot delete category. ${productsCount} product(s) are associated with it.`);
    }

    await category.update({ deleted_by: deletedBy });
    await category.destroy();

    return true;
  }

  async getCategoryStats() {
    const [total, active, level1, level2, level3] = await Promise.all([
      Category.count(),
      Category.count({ where: { is_active: true } }),
      Category.count({ where: { level: 1 } }),
      Category.count({ where: { level: 2 } }),
      Category.count({ where: { level: 3 } })
    ]);

    return {
      total,
      active,
      byLevel: {
        level1,
        level2,
        level3
      }
    };
  }
}

module.exports = new CategoryService();
