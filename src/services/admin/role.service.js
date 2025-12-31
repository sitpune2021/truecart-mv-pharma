const BaseService = require('../../utils/baseService');
const { Role, Permission, RolePermission, User } = require('../../database/models');
const { NotFoundError, ConflictError, ForbiddenError } = require('../../utils/errors');
const { Op } = require('sequelize');

class RoleService extends BaseService {
  constructor() {
    super(Role, 'Role');
  }

  /**
   * Get all roles with filters
   */
  async getAllRoles(options = {}, actor) {
    const {
      page = 1,
      limit = 20,
      search = '',
      isActive = null,
      createdByType = null
    } = options;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { display_name: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (isActive !== null) {
      where.is_active = isActive;
    }

    if (createdByType) {
      where.created_by_type = createdByType;
    }

    // Scope: non-super_admin only sees roles they own
    if (actor.user_type !== 'super_admin') {
      where.owner_user_id = actor.id;
    }

    const result = await this.findAll({
      page,
      limit,
      where,
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] },
        attributes: ['id', 'name', 'display_name', 'module', 'action']
      }],
      order: [['created_at', 'DESC']]
    });

    return result;
  }

  /**
   * Get role by ID with permissions
   */
  async getRoleById(id, actor = null) {
    const role = await Role.findByPk(id, {
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: ['granted_at'] },
        attributes: ['id', 'name', 'display_name', 'module', 'action', 'scope']
      }]
    });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    if (actor && actor.user_type !== 'super_admin' && role.owner_user_id !== actor.id) {
      throw new NotFoundError('Role not found');
    }

    return role;
  }

  /**
   * Create new role
   */
  async createRole(data, actor) {
    const { name, display_name, description, permissions = [], parent_role_id = null } = data;

    // Check if role already exists
    const existing = await Role.findOne({
      where: {
        name,
        created_by_type: actor.user_type === 'super_admin' ? 'admin' : 'vendor',
        owner_user_id: actor.user_type === 'super_admin' ? null : actor.id
      },
      paranoid: false
    });

    if (existing && !existing.deleted_at) {
      throw new ConflictError('Role with this name already exists');
    }

    // Create role
    const role = await Role.create({
      name,
      display_name,
      description,
      created_by_type: actor.user_type === 'super_admin' ? 'admin' : 'vendor',
      created_by_id: actor.id,
      owner_user_id: actor.user_type === 'super_admin' ? null : actor.id,
      parent_role_id,
      is_system: false,
      is_active: true
    });

    // Assign permissions
    if (permissions.length > 0) {
      await this.assignPermissions(role.id, permissions, actor);
    }

    return this.getRoleById(role.id, actor);
  }

  /**
   * Update role
   */
  async updateRole(id, data, actor) {
    const { name, display_name, description, is_active, permissions } = data;

    const role = await Role.findByPk(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    if (role.is_system) {
      throw new ForbiddenError('Cannot modify system role');
    }

    if (actor.user_type !== 'super_admin' && role.owner_user_id !== actor.id) {
      throw new NotFoundError('Role not found');
    }

    // Check name uniqueness if changed
    if (name && name !== role.name) {
      const existing = await Role.findOne({
        where: {
          name,
          created_by_type: actor.user_type === 'super_admin' ? 'admin' : 'vendor',
          owner_user_id: actor.user_type === 'super_admin' ? null : actor.id
        }
      });
      if (existing) {
        throw new ConflictError('Role name already in use');
      }
    }

    // Update role
    await role.update({
      ...(name && { name }),
      ...(display_name && { display_name }),
      ...(description && { description }),
      ...(is_active !== undefined && { is_active }),
      updated_by: actor.id
    });

    // Update permissions if provided
    if (permissions) {
      await this.updateRolePermissions(id, permissions, actor);
    }

    return this.getRoleById(id);
  }

  /**
   * Assign permissions to role
   */
  async assignPermissions(roleId, permissionIds, actor) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    if (actor.user_type !== 'super_admin' && role.owner_user_id !== actor.id) {
      throw new NotFoundError('Role not found');
    }

    // Verify permissions exist
    const permissions = await Permission.findAll({
      where: { id: permissionIds }
    });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundError('One or more permissions not found');
    }

    // Only allow assigning permissions the actor already has (unless super_admin)
    let allowedPermissionIds = permissions.map(p => p.id);
    if (actor.user_type !== 'super_admin') {
      allowedPermissionIds = permissions
        .filter(p => actor.permissions?.includes(p.name))
        .map(p => p.id);
      if (allowedPermissionIds.length === 0) {
        throw new ForbiddenError('No assignable permissions in request');
      }
    }

    // Assign permissions
    const assignments = allowedPermissionIds.map(permissionId => ({
      role_id: roleId,
      permission_id: permissionId,
      granted_by: actor.id,
      granted_at: new Date()
    }));

    await RolePermission.bulkCreate(assignments, {
      ignoreDuplicates: true
    });

    return this.getRoleById(roleId);
  }

  /**
   * Update role permissions (replace all)
   */
  async updateRolePermissions(roleId, permissionIds, actor) {
    // Remove existing permissions
    await RolePermission.destroy({
      where: { role_id: roleId }
    });

    // Assign new permissions
    if (permissionIds.length > 0) {
      return this.assignPermissions(roleId, permissionIds, actor);
    }

    return this.getRoleById(roleId);
  }

  /**
   * Delete role
   */
  async deleteRole(id, actor) {
    const role = await Role.findByPk(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    if (role.is_system) {
      throw new ForbiddenError('Cannot delete system role');
    }

    if (actor.user_type !== 'super_admin' && role.owner_user_id !== actor.id) {
      throw new NotFoundError('Role not found');
    }

    // Check if role is assigned to any users
    const userCount = await User.count({
      include: [{
        model: Role,
        as: 'roles',
        where: { id }
      }]
    });

    if (userCount > 0) {
      throw new ConflictError(`Cannot delete role. It is assigned to ${userCount} user(s)`);
    }

    await role.update({ deleted_by: actor.id });
    await role.destroy();

    return true;
  }

  /**
   * Get role statistics
   */
  async getRoleStats() {
    const [total, active, system, custom] = await Promise.all([
      Role.count(),
      Role.count({ where: { is_active: true } }),
      Role.count({ where: { is_system: true } }),
      Role.count({ where: { is_system: false } })
    ]);

    return {
      total,
      active,
      system,
      custom
    };
  }
}

module.exports = new RoleService();
