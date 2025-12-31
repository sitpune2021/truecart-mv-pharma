const BaseController = require('../../utils/baseController');
const RoleService = require('../../services/admin/role.service');

class RoleController extends BaseController {
  constructor() {
    super('RoleController');
  }

  /**
   * Get all roles
   */
  getAllRoles = this.asyncHandler(async (req, res) => {
    const { page, limit, search, isActive, createdByType } = req.query;

    const result = await RoleService.getAllRoles(
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        search,
        isActive: isActive !== undefined ? isActive === 'true' : null,
        createdByType
      },
      req.user
    );

    await this.logActivity(req, 'VIEW_ROLES', 'Viewed roles list');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Roles retrieved successfully');
  });

  /**
   * Get role by ID
   */
  getRoleById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const role = await RoleService.getRoleById(id, req.user);

    await this.logActivity(req, 'VIEW_ROLE', `Viewed role: ${role.name}`);

    this.sendSuccess(res, role, 'Role retrieved successfully');
  });

  /**
   * Create new role
   */
  createRole = this.asyncHandler(async (req, res) => {
    const role = await RoleService.createRole(req.body, req.user);

    await this.logActivity(req, 'CREATE_ROLE', `Created role: ${role.name}`, 'SUCCESS');

    this.sendSuccess(res, role, 'Role created successfully', 201);
  });

  /**
   * Update role
   */
  updateRole = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const role = await RoleService.updateRole(id, req.body, req.user);

    await this.logActivity(req, 'UPDATE_ROLE', `Updated role: ${role.name}`, 'SUCCESS');

    this.sendSuccess(res, role, 'Role updated successfully');
  });

  /**
   * Delete role
   */
  deleteRole = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    await RoleService.deleteRole(id, req.user);

    await this.logActivity(req, 'DELETE_ROLE', `Deleted role ID: ${id}`, 'SUCCESS');

    this.sendSuccess(res, null, 'Role deleted successfully');
  });

  /**
   * Assign permissions to role
   */
  assignPermissions = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { permissionIds } = req.body;

    const role = await RoleService.assignPermissions(id, permissionIds, req.user);

    await this.logActivity(req, 'ASSIGN_PERMISSIONS', `Assigned permissions to role: ${role.name}`, 'SUCCESS');

    this.sendSuccess(res, role, 'Permissions assigned successfully');
  });

  /**
   * Get role statistics
   */
  getRoleStats = this.asyncHandler(async (req, res) => {
    const stats = await RoleService.getRoleStats();

    await this.logActivity(req, 'VIEW_ROLE_STATS', 'Viewed role statistics');

    this.sendSuccess(res, stats, 'Role statistics retrieved successfully');
  });
}

module.exports = new RoleController();
