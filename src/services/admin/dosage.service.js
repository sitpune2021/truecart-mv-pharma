const BaseService = require('../../utils/baseService');
const { Dosage, User } = require('../../database/models');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { generateUniqueSlug } = require('../../utils/slug.utils');
const { Op } = require('sequelize');

class DosageService extends BaseService {
    constructor() {
        super(Dosage, 'Dosage');
    }

    async getAllDosages(options = {}) {
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

    async getDosageById(id) {
        const dosage = await Dosage.findByPk(id, {
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

        if (!dosage) {
            throw new NotFoundError('Dosage not found');
        }

        return dosage;
    }

    async getDosageBySlug(slug) {
        const dosage = await Dosage.findOne({
            where: { slug }
        });

        if (!dosage) {
            throw new NotFoundError('Dosage not found');
        }

        return dosage;
    }

    async createDosage(data, createdBy) {
        const { name } = data;

        const existing = await Dosage.findOne({ where: { name } });
        if (existing) {
            throw new ConflictError('Dosage with this name already exists');
        }

        const slug = await generateUniqueSlug(name, Dosage);

        const dosage = await Dosage.create({
            ...data,
            slug,
            created_by: createdBy
        });

        return this.getDosageById(dosage.id);
    }

    async updateDosage(id, data, updatedBy) {
        const dosage = await Dosage.findByPk(id);
        if (!dosage) {
            throw new NotFoundError('Dosage not found');
        }

        if (data.name && data.name !== dosage.name) {
            const existing = await Dosage.findOne({ where: { name: data.name } });
            if (existing) {
                throw new ConflictError('Dosage name already in use');
            }
            data.slug = await generateUniqueSlug(data.name, Dosage, id);
        }

        await dosage.update({
            ...data,
            updated_by: updatedBy
        });

        return this.getDosageById(id);
    }

    async deleteDosage(id, deletedBy) {
        const dosage = await Dosage.findByPk(id);
        if (!dosage) {
            throw new NotFoundError('Dosage not found');
        }

        // Add any relationship checks here if needed in the future
        // For example: check if any products use this dosage

        await dosage.update({ deleted_by: deletedBy });
        await dosage.destroy();

        return true;
    }

    async getDosageStats() {
        const [total, active] = await Promise.all([
            Dosage.count(),
            Dosage.count({ where: { is_active: true } })
        ]);

        return {
            total,
            active
        };
    }
}

module.exports = new DosageService();
