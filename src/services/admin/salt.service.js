const BaseService = require('../../utils/baseService');
const { Salt, User } = require('../../database/models');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { generateUniqueSlug } = require('../../utils/slug.utils');
const { Op } = require('sequelize');

class SaltService extends BaseService {
    constructor() {
        super(Salt, 'Salt');
    }

    async getAllSalts(options = {}) {
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

    async getSaltById(id) {
        const salt = await Salt.findByPk(id, {
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

        if (!salt) {
            throw new NotFoundError('Salt not found');
        }

        return salt;
    }

    async getSaltBySlug(slug) {
        const salt = await Salt.findOne({
            where: { slug }
        });

        if (!salt) {
            throw new NotFoundError('Salt not found');
        }

        return salt;
    }

    async createSalt(data, createdBy) {
        const { name } = data;

        const existing = await Salt.findOne({ where: { name } });
        if (existing) {
            throw new ConflictError('Salt with this name already exists');
        }

        const slug = await generateUniqueSlug(name, Salt);

        const salt = await Salt.create({
            ...data,
            slug,
            created_by: createdBy
        });

        return this.getSaltById(salt.id);
    }

    async updateSalt(id, data, updatedBy) {
        const salt = await Salt.findByPk(id);
        if (!salt) {
            throw new NotFoundError('Salt not found');
        }

        if (data.name && data.name !== salt.name) {
            const existing = await Salt.findOne({ where: { name: data.name } });
            if (existing) {
                throw new ConflictError('Salt name already in use');
            }
            data.slug = await generateUniqueSlug(data.name, Salt, id);
        }

        await salt.update({
            ...data,
            updated_by: updatedBy
        });

        return this.getSaltById(id);
    }

    async deleteSalt(id, deletedBy) {
        const salt = await Salt.findByPk(id);
        if (!salt) {
            throw new NotFoundError('Salt not found');
        }

        // Add any relationship checks here if needed in the future
        // For example: check if any products use this salt

        await salt.update({ deleted_by: deletedBy });
        await salt.destroy();

        return true;
    }

    async getSaltStats() {
        const [total, active] = await Promise.all([
            Salt.count(),
            Salt.count({ where: { is_active: true } })
        ]);

        return {
            total,
            active
        };
    }
}

module.exports = new SaltService();
