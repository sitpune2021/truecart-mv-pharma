const BaseService = require('../../utils/baseService');
const { UnitType, User } = require('../../database/models');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { generateUniqueSlug } = require('../../utils/slug.utils');
const { Op } = require('sequelize');

class UnitTypeService extends BaseService {
    constructor() {
        super(UnitType, 'UnitType');
    }

    async getAllUnitTypes(options = {}) {
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

    async getUnitTypeById(id) {
        const unitType = await UnitType.findByPk(id, {
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

        if (!unitType) {
            throw new NotFoundError('Unit Type not found');
        }

        return unitType;
    }

    async getUnitTypeBySlug(slug) {
        const unitType = await UnitType.findOne({
            where: { slug }
        });

        if (!unitType) {
            throw new NotFoundError('Unit Type not found');
        }

        return unitType;
    }

    async createUnitType(data, createdBy) {
        const { name } = data;

        const existing = await UnitType.findOne({ where: { name } });
        if (existing) {
            throw new ConflictError('Unit Type with this name already exists');
        }

        const slug = await generateUniqueSlug(name, UnitType);

        const unitType = await UnitType.create({
            ...data,
            slug,
            created_by: createdBy
        });

        return this.getUnitTypeById(unitType.id);
    }

    async updateUnitType(id, data, updatedBy) {
        const unitType = await UnitType.findByPk(id);
        if (!unitType) {
            throw new NotFoundError('Unit Type not found');
        }

        if (data.name && data.name !== unitType.name) {
            const existing = await UnitType.findOne({ where: { name: data.name } });
            if (existing) {
                throw new ConflictError('Unit Type name already in use');
            }
            data.slug = await generateUniqueSlug(data.name, UnitType, id);
        }

        await unitType.update({
            ...data,
            updated_by: updatedBy
        });

        return this.getUnitTypeById(id);
    }

    async deleteUnitType(id, deletedBy) {
        const unitType = await UnitType.findByPk(id);
        if (!unitType) {
            throw new NotFoundError('Unit Type not found');
        }

        await unitType.update({ deleted_by: deletedBy });
        await unitType.destroy();

        return true;
    }

    async getUnitTypeStats() {
        const [total, active] = await Promise.all([
            UnitType.count(),
            UnitType.count({ where: { is_active: true } })
        ]);

        return {
            total,
            active
        };
    }
}

module.exports = new UnitTypeService();
