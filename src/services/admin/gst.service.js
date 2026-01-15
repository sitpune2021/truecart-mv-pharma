const BaseService = require('../../utils/baseService');
const { GST, User } = require('../../database/models');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { Op } = require('sequelize');

class GSTService extends BaseService {
    constructor() {
        super(GST, 'GST');
    }

    async getAllGST(options = {}) {
        const {
            page = 1,
            limit = 10,
            search = '',
            isActive = null,
            sortBy = 'value',
            sortOrder = 'ASC'
        } = options;

        const where = {};

        if (search) {
            // Cast value to text for searching if necessary, or just search description
            where[Op.or] = [
                { description: { [Op.iLike]: `%${search}%` } }
            ];

            // If search is a number, try to match value exactly
            if (!isNaN(search)) {
                where[Op.or].push({ value: parseFloat(search) });
            }
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

    async getGSTById(id) {
        const gst = await GST.findByPk(id, {
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

        if (!gst) {
            throw new NotFoundError('GST record not found');
        }

        return gst;
    }

    async createGST(data, createdBy) {
        const { value } = data;

        const existing = await GST.findOne({ where: { value } });
        if (existing) {
            throw new ConflictError(`GST with value ${value}% already exists`);
        }

        const gst = await GST.create({
            ...data,
            created_by: createdBy
        });

        return this.getGSTById(gst.id);
    }

    async updateGST(id, data, updatedBy) {
        const gst = await GST.findByPk(id);
        if (!gst) {
            throw new NotFoundError('GST record not found');
        }

        if (data.value && parseFloat(data.value) !== parseFloat(gst.value)) {
            const existing = await GST.findOne({ where: { value: data.value } });
            if (existing) {
                throw new ConflictError(`GST with value ${data.value}% already in use`);
            }
        }

        await gst.update({
            ...data,
            updated_by: updatedBy
        });

        return this.getGSTById(id);
    }

    async deleteGST(id, deletedBy) {
        const gst = await GST.findByPk(id);
        if (!gst) {
            throw new NotFoundError('GST record not found');
        }

        await gst.update({ deleted_by: deletedBy });
        await gst.destroy();

        return true;
    }

    async getGSTStats() {
        const [total, active] = await Promise.all([
            GST.count(),
            GST.count({ where: { is_active: true } })
        ]);

        return {
            total,
            active
        };
    }
}

module.exports = new GSTService();
