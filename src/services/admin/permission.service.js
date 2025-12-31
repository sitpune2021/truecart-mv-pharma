const BaseService = require('../../utils/baseService');
const { Permission, Role } = require('../../database/models');
const { NotFoundError, ConflictError, ForbiddenError } = require('../../utils/errors');
const { Op } = require('sequelize');

class PermissionService extends BaseService {
  constructor() {
    super(Permission, 'Permission');
  }

  /**
   * Get all permissions with filters
   */
  async getAllPermissions(options = {}) {
    const {
      page = 1,
      limit = 50,
      search = '',
      module = null,
      action = null,
      isActive = null
    } = options;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { display_name: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (module) {
      where.module = module;
    }

    if (action) {
      where.action = action;
    }

    if (isActive !== null) {
      where.is_active = isActive;
    }

    const result = await this.findAll({
      page,
      limit,
      where,
      order: [['module', 'ASC'], ['action', 'ASC']]
    });

    return result;
  }

  /**
   * Get permissions grouped by module
   */
  async getPermissionsByModule() {
    const permissions = await Permission.findAll({
      where: { is_active: true },
      order: [['module', 'ASC'], ['action', 'ASC']]
    });

    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {});

    return grouped;
  }

  /**
   * Create new permission
   */
  async createPermission(data, createdBy) {
    const { name, module, action, scope, display_name, description } = data;

    // Check if permission already exists
    const existing = await Permission.findOne({ where: { name } });
    if (existing) {
      throw new ConflictError('Permission with this name already exists');
    }

    const permission = await Permission.create({
      name,
      module,
      action,
      scope,
      display_name,
      description,
      created_by: createdBy,
      is_active: true
    });

    return permission;
  }

  /**
   * Update permission
   */
  async updatePermission(id, data, updatedBy) {
    const { name, module, action, scope, display_name, description, is_active } = data;

    const permission = await Permission.findByPk(id);
    if (!permission) {
      throw new NotFoundError('Permission not found');
    }

    // Check name uniqueness if changed
    if (name && name !== permission.name) {
      const existing = await Permission.findOne({ where: { name } });
      if (existing) {
        throw new ConflictError('Permission name already in use');
      }
    }

    await permission.update({
      ...(name && { name }),
      ...(module && { module }),
      ...(action && { action }),
      ...(scope !== undefined && { scope }),
      ...(display_name && { display_name }),
      ...(description && { description }),
      ...(is_active !== undefined && { is_active }),
      updated_by: updatedBy
    });

    return permission;
  }

  /**
   * Delete permission
   */
  async deletePermission(id, deletedBy) {
    const permission = await Permission.findByPk(id);
    if (!permission) {
      throw new NotFoundError('Permission not found');
    }

    // Check if permission is assigned to any roles
    const roleCount = await Role.count({
      include: [{
        model: Permission,
        as: 'permissions',
        where: { id }
      }]
    });

    if (roleCount > 0) {
      throw new ConflictError(`Cannot delete permission. It is assigned to ${roleCount} role(s)`);
    }

    await permission.update({ deleted_by: deletedBy });
    await permission.destroy();

    return true;
  }

  /**
   * Get permission statistics
   */
  async getPermissionStats() {
    const [total, active, byModule] = await Promise.all([
      Permission.count(),
      Permission.count({ where: { is_active: true } }),
      Permission.findAll({
        attributes: [
          'module',
          [Permission.sequelize.fn('COUNT', Permission.sequelize.col('id')), 'count']
        ],
        group: ['module']
      })
    ]);

    return {
      total,
      active,
      byModule: byModule.reduce((acc, item) => {
        acc[item.module] = parseInt(item.get('count'));
        return acc;
      }, {})
    };
  }
}

module.exports = new PermissionService();
