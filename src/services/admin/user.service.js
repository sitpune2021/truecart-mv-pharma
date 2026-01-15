const BaseService = require('../../utils/baseService');
const { User, Role, UserRole } = require('../../database/models');
const PasswordUtil = require('../../utils/password.util');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { Op } = require('sequelize');

class UserService extends BaseService {
  constructor() {
    super(User, 'User');
  }

  /**
   * Get all users with filters and pagination
   */
  async getAllUsers(options = {}, actor) {
    const {
      page = 1,
      limit = 10,
      search = '',
      userType = null,
      isActive = null,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // User type filter
    if (userType) {
      where.user_type = userType;
    }

    // Active status filter
    if (isActive !== null) {
      where.is_active = isActive;
    }

    // Scope: non-super_admin can only see their owned users
    if (actor.user_type !== 'super_admin') {
      where.owner_user_id = actor.id;
    }

    const result = await this.findAll({
      page,
      limit,
      where,
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: [] },
        attributes: ['id', 'name', 'display_name']
      }],
      order: [[sortBy, sortOrder]],
      attributes: { exclude: ['password_hash'] }
    });

    return result;
  }

  /**
   * Get user by ID with roles
   */
  async getUserById(id, actor) {
    const user = await User.findByPk(id, {
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: ['assigned_at', 'expires_at'] },
        attributes: ['id', 'name', 'display_name', 'description']
      }],
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (actor.user_type !== 'super_admin' && user.owner_user_id !== actor.id) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Create new user
   */
  async createUser(data, actor) {
    const { email, phone, full_name, password, user_type, roles = [] } = data;
    const transaction = await User.sequelize.transaction();

    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            email ? { email } : null,
            phone ? { phone } : null
          ].filter(Boolean)
        },
        transaction
      });

      if (existingUser) {
        throw new ConflictError('User with this email or phone already exists');
      }

      // Hash password
      const password_hash = await PasswordUtil.hash(password);

      // Create user
      const user = await User.create({
        email,
        phone,
        full_name,
        password_hash,
        user_type,
        created_by: actor.id,
        owner_user_id: actor.user_type === 'super_admin' ? null : actor.id,
        is_active: true
      }, { transaction });

      // Assign roles
      if (roles.length > 0) {
        await this.assignRoles(user.id, roles, actor, { transaction });
      }

      await transaction.commit();

      return this.getUserById(user.id, actor);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id, data, actor) {
    const { email, phone, full_name, user_type, is_active, roles } = data;

    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (actor.user_type !== 'super_admin' && user.owner_user_id !== actor.id) {
      throw new NotFoundError('User not found');
    }

    // Check email/phone uniqueness if changed
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        throw new ConflictError('Email already in use');
      }
    }

    if (phone && phone !== user.phone) {
      const existing = await User.findOne({ where: { phone } });
      if (existing) {
        throw new ConflictError('Phone already in use');
      }
    }

    // Update user
    await user.update({
      ...(email && { email }),
      ...(phone && { phone }),
      ...(full_name && { full_name }),
      ...(user_type && { user_type }),
      ...(is_active !== undefined && { is_active }),
      updated_by: actor.id
    });

    // Update roles if provided
    if (roles) {
      await this.updateUserRoles(id, roles, actor);
    }

    return this.getUserById(id, actor);
  }

  /**
   * Assign roles to user
   */
  async assignRoles(userId, roleIds, actor, options = {}) {
    const { transaction } = options;

    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (actor.user_type !== 'super_admin' && user.owner_user_id !== actor.id) {
      throw new NotFoundError('User not found');
    }

    // Verify roles exist
    const roleWhere = { id: roleIds };
    if (actor.user_type !== 'super_admin') {
      roleWhere.owner_user_id = actor.id;
    }
    const roles = await Role.findAll({
      where: roleWhere,
      transaction
    });

    if (roles.length !== roleIds.length) {
      throw new NotFoundError('One or more roles not found');
    }

    // Assign roles
    const assignments = roleIds.map(roleId => ({
      user_id: userId,
      role_id: roleId,
      assigned_by: actor.id,
      assigned_at: new Date()
    }));

    await UserRole.bulkCreate(assignments, {
      ignoreDuplicates: true,
      transaction
    });

    if (transaction) {
      return;
    }

    return this.getUserById(userId, actor);
  }

  /**
   * Update user roles (replace all)
   */
  async updateUserRoles(userId, roleIds, actor) {
    // Remove existing roles
    await UserRole.destroy({
      where: { user_id: userId }
    });

    // Assign new roles
    if (roleIds.length > 0) {
      return this.assignRoles(userId, roleIds, actor);
    }

    return this.getUserById(userId, actor);
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(id, actor) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (actor.user_type !== 'super_admin' && user.owner_user_id !== actor.id) {
      throw new NotFoundError('User not found');
    }

    await user.update({
      is_active: false,
      deleted_by: actor.id
    });

    await user.destroy();

    return true;
  }

  /**
   * Reactivate user
   */
  async reactivateUser(id, actor) {
    const user = await User.findByPk(id, { paranoid: false });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (actor.user_type !== 'super_admin' && user.owner_user_id !== actor.id) {
      throw new NotFoundError('User not found');
    }

    await user.restore();
    await user.update({
      is_active: true,
      updated_by: actor.id
    });

    return this.getUserById(id);
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const [total, active, inactive, byType] = await Promise.all([
      User.count(),
      User.count({ where: { is_active: true } }),
      User.count({ where: { is_active: false } }),
      User.findAll({
        attributes: [
          'user_type',
          [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
        ],
        group: ['user_type']
      })
    ]);

    return {
      total,
      active,
      inactive,
      byType: byType.reduce((acc, item) => {
        acc[item.user_type] = parseInt(item.get('count'));
        return acc;
      }, {})
    };
  }
}

module.exports = new UserService();
