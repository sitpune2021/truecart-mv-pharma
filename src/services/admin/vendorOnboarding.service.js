const BaseService = require('../../utils/baseService');
const { VendorOnboarding, User, sequelize } = require('../../database/models');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { Op } = require('sequelize');

class VendorOnboardingService extends BaseService {
  constructor() {
    super(VendorOnboarding, 'VendorOnboarding');
  }

  /**
   * Create vendor onboarding record
   */
  async createOnboarding(data, createdBy) {
    const transaction = await sequelize.transaction();

    try {
      // Check if user exists and is a vendor
      const user = await User.findByPk(data.user_id, { transaction });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.user_type !== 'vendor') {
        throw new ConflictError('User must be of type vendor');
      }

      // Check if onboarding already exists for this user
      const existingOnboarding = await VendorOnboarding.findOne({
        where: { user_id: data.user_id },
        paranoid: false,
        transaction
      });

      if (existingOnboarding && !existingOnboarding.deleted_at) {
        throw new ConflictError('Onboarding record already exists for this vendor');
      }

      // Normalize payload
      const normalized = VendorOnboardingService.normalizeOnboardingData(data);

      // Create onboarding record
      const onboarding = await VendorOnboarding.create({
        ...normalized,
        onboarding_status: 'pending',
        created_by: createdBy,
        updated_by: createdBy
      }, { transaction });

      await transaction.commit();

      return this.getOnboardingById(onboarding.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Normalize onboarding payload to avoid DB casting errors
   */
  static normalizeOnboardingData(input) {
    const data = { ...input };

    // Convert empty strings to null for numeric/integer columns
    const toNullIfEmpty = ['years_in_business', 'pincode'];
    toNullIfEmpty.forEach((field) => {
      if (data[field] === '') data[field] = null;
    });

    // Convert empty strings to null for optional text fields that should not be empty-string
    const toNullIfEmptyString = ['account_number', 'ifsc_code'];
    toNullIfEmptyString.forEach((field) => {
      if (data[field] === '') data[field] = null;
    });

    return data;
  }

  /**
   * List onboarding records with filters and pagination
   */
  async getAllOnboardings({ page = 1, limit = 10, search, status, sortBy = 'created_at', sortOrder = 'DESC' }) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const where = {};

    if (search) {
      where[Op.or] = [
        { business_name: { [Op.iLike]: `%${search}%` } },
        { gst_number: { [Op.iLike]: `%${search}%` } },
        { business_email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) {
      where.onboarding_status = status;
    }

    const allowedSort = ['created_at', 'business_name', 'onboarding_status'];
    const order = allowedSort.includes(sortBy) ? [[sortBy, sortOrder || 'DESC']] : [['created_at', 'DESC']];

    const { rows, count } = await VendorOnboarding.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'phone', 'user_type', 'is_active']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    return {
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum)
      }
    };
  }

  /**
   * Get onboarding by ID
   */
  async getOnboardingById(id) {
    const onboarding = await VendorOnboarding.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'phone', 'user_type', 'is_active']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    if (!onboarding) {
      throw new NotFoundError('Vendor onboarding not found');
    }

    return onboarding;
  }

  /**
   * Get onboarding by user ID
   */
  async getOnboardingByUserId(userId) {
    const onboarding = await VendorOnboarding.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'phone', 'user_type', 'is_active']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    return onboarding;
  }

  /**
   * Update onboarding record
   */
  async updateOnboarding(id, data, updatedBy) {
    const transaction = await sequelize.transaction();

    try {
      const onboarding = await VendorOnboarding.findByPk(id, { transaction });

      if (!onboarding) {
        throw new NotFoundError('Vendor onboarding not found');
      }

      const normalized = VendorOnboardingService.normalizeOnboardingData(data);

      await onboarding.update({
        ...normalized,
        updated_by: updatedBy
      }, { transaction });

      await transaction.commit();

      return this.getOnboardingById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Approve onboarding
   */
  async approveOnboarding(id, approvedBy, remarks = null) {
    const transaction = await sequelize.transaction();

    try {
      const onboarding = await VendorOnboarding.findByPk(id, { transaction });

      if (!onboarding) {
        throw new NotFoundError('Vendor onboarding not found');
      }

      if (onboarding.onboarding_status !== 'pending') {
        throw new ConflictError('Only pending onboarding can be approved');
      }

      await onboarding.update({
        onboarding_status: 'approved',
        approved_by: approvedBy,
        approval_remarks: remarks,
        onboarding_completed_at: new Date(),
        updated_by: approvedBy
      }, { transaction });

      await transaction.commit();

      return this.getOnboardingById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Reject onboarding
   */
  async rejectOnboarding(id, rejectedBy, remarks) {
    const transaction = await sequelize.transaction();

    try {
      const onboarding = await VendorOnboarding.findByPk(id, { transaction });

      if (!onboarding) {
        throw new NotFoundError('Vendor onboarding not found');
      }

      if (onboarding.onboarding_status !== 'pending') {
        throw new ConflictError('Only pending onboarding can be rejected');
      }

      await onboarding.update({
        onboarding_status: 'rejected',
        approved_by: rejectedBy,
        approval_remarks: remarks,
        updated_by: rejectedBy
      }, { transaction });

      await transaction.commit();

      return this.getOnboardingById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get onboarding statistics
   */
  async getOnboardingStats() {
    const [total, pending, approved, rejected, underReview] = await Promise.all([
      VendorOnboarding.count(),
      VendorOnboarding.count({ where: { onboarding_status: 'pending' } }),
      VendorOnboarding.count({ where: { onboarding_status: 'approved' } }),
      VendorOnboarding.count({ where: { onboarding_status: 'rejected' } }),
      VendorOnboarding.count({ where: { onboarding_status: 'under_review' } })
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      underReview
    };
  }

  /**
   * Delete onboarding record (soft delete)
   */
  async deleteOnboarding(id, deletedBy) {
    return this.delete(id, deletedBy);
  }
}

module.exports = new VendorOnboardingService();
