const BaseService = require('../../utils/baseService');
const { Attribute, User } = require('../../database/models');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { generateUniqueSlug } = require('../../utils/slug.utils');
const { Op } = require('sequelize');

class AttributeService extends BaseService {
    constructor() {
        super(Attribute, 'Attribute');
    }

    async getAllAttributes(options = {}) {
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
                { description: { [Op.iLike]: `%${search}%` } }
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

    async getAttributeById(id) {
        const attribute = await Attribute.findByPk(id, {
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

        if (!attribute) {
            throw new NotFoundError('Attribute not found');
        }

        return attribute;
    }

    async getAttributeBySlug(slug) {
        const attribute = await Attribute.findOne({
            where: { slug }
        });

        if (!attribute) {
            throw new NotFoundError('Attribute not found');
        }

        return attribute;
    }

    async createAttribute(data, createdBy) {
        const { name } = data;

        const existing = await Attribute.findOne({ where: { name } });
        if (existing) {
            throw new ConflictError('Attribute with this name already exists');
        }

        const slug = await generateUniqueSlug(name, Attribute);

        const attribute = await Attribute.create({
            ...data,
            slug,
            created_by: createdBy
        });

        return this.getAttributeById(attribute.id);
    }

    async updateAttribute(id, data, updatedBy) {
        const attribute = await Attribute.findByPk(id);
        if (!attribute) {
            throw new NotFoundError('Attribute not found');
        }

        if (data.name && data.name !== attribute.name) {
            const existing = await Attribute.findOne({ where: { name: data.name } });
            if (existing) {
                throw new ConflictError('Attribute name already in use');
            }
            data.slug = await generateUniqueSlug(data.name, Attribute, id);
        }

        await attribute.update({
            ...data,
            updated_by: updatedBy
        });

        return this.getAttributeById(id);
    }

    async deleteAttribute(id, deletedBy) {
        const attribute = await Attribute.findByPk(id);
        if (!attribute) {
            throw new NotFoundError('Attribute not found');
        }

        await attribute.update({ deleted_by: deletedBy });
        await attribute.destroy();

        return true;
    }

    async getAttributeStats() {
        const [total, active] = await Promise.all([
            Attribute.count(),
            Attribute.count({ where: { is_active: true } })
        ]);

        return {
            total,
            active
        };
    }
}

module.exports = new AttributeService();
