const BaseController = require('../../utils/baseController');
const PermissionService = require('../../services/admin/permission.service');

class PermissionController extends BaseController {
  constructor() {
    super('PermissionController');
  }

  /**
   * Get all permissions
   */
  getAllPermissions = this.asyncHandler(async (req, res) => {
    const { page, limit, search, module, action, isActive } = req.query;

    const result = await PermissionService.getAllPermissions({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      search,
      module,
      action,
      isActive: isActive !== undefined ? isActive === 'true' : null
    });

    await this.logActivity(req, 'VIEW_PERMISSIONS', 'Viewed permissions list');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Permissions retrieved successfully');
  });

  /**
   * Get permissions grouped by module
   */
  getPermissionsByModule = this.asyncHandler(async (req, res) => {
    const permissions = await PermissionService.getPermissionsByModule();

    await this.logActivity(req, 'VIEW_PERMISSIONS_BY_MODULE', 'Viewed permissions by module');

    this.sendSuccess(res, permissions, 'Permissions retrieved successfully');
  });

  /**
   * Get permission by ID
   */
  getPermissionById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const permission = await PermissionService.findById(id);

    if (!permission) {
      return this.sendError(res, 'Permission not found', 404);
    }

    await this.logActivity(req, 'VIEW_PERMISSION', `Viewed permission: ${permission.name}`);

    this.sendSuccess(res, permission, 'Permission retrieved successfully');
  });

  /**
   * Create new permission
   */
  createPermission = this.asyncHandler(async (req, res) => {
    const permission = await PermissionService.createPermission(req.body, req.user.id);

    await this.logActivity(req, 'CREATE_PERMISSION', `Created permission: ${permission.name}`, 'SUCCESS');

    this.sendSuccess(res, permission, 'Permission created successfully', 201);
  });

  /**
   * Update permission
   */
  updatePermission = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const permission = await PermissionService.updatePermission(id, req.body, req.user.id);

    await this.logActivity(req, 'UPDATE_PERMISSION', `Updated permission: ${permission.name}`, 'SUCCESS');

    this.sendSuccess(res, permission, 'Permission updated successfully');
  });

  /**
   * Delete permission
   */
  deletePermission = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    await PermissionService.deletePermission(id, req.user.id);

    await this.logActivity(req, 'DELETE_PERMISSION', `Deleted permission ID: ${id}`, 'SUCCESS');

    this.sendSuccess(res, null, 'Permission deleted successfully');
  });

  /**
   * Get permission statistics
   */
  getPermissionStats = this.asyncHandler(async (req, res) => {
    const stats = await PermissionService.getPermissionStats();

    await this.logActivity(req, 'VIEW_PERMISSION_STATS', 'Viewed permission statistics');

    this.sendSuccess(res, stats, 'Permission statistics retrieved successfully');
  });
}

module.exports = new PermissionController();
