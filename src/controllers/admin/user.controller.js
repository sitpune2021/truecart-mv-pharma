const BaseController = require('../../utils/baseController');
const UserService = require('../../services/admin/user.service');

class UserController extends BaseController {
  constructor() {
    super('UserController');
  }

  /**
   * Get all users
   */
  getAllUsers = this.asyncHandler(async (req, res) => {
    const { page, limit, search, userType, isActive, sortBy, sortOrder } = req.query;

    const result = await UserService.getAllUsers(
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        search,
        userType,
        isActive: isActive !== undefined ? isActive === 'true' : null,
        sortBy,
        sortOrder
      },
      req.user
    );

    await this.logActivity(req, 'VIEW_USERS', 'Viewed users list');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Users retrieved successfully');
  });

  /**
   * Get user by ID
   */
  getUserById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await UserService.getUserById(id, req.user);

    await this.logActivity(req, 'VIEW_USER', `Viewed user: ${user.full_name}`);

    this.sendSuccess(res, user, 'User retrieved successfully');
  });

  /**
   * Create new user
   */
  createUser = this.asyncHandler(async (req, res) => {
    const user = await UserService.createUser(req.body, req.user);

    await this.logActivity(req, 'CREATE_USER', `Created user: ${user.full_name}`, 'SUCCESS');

    this.sendSuccess(res, user, 'User created successfully', 201);
  });

  /**
   * Update user
   */
  updateUser = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await UserService.updateUser(id, req.body, req.user);

    await this.logActivity(req, 'UPDATE_USER', `Updated user: ${user.full_name}`, 'SUCCESS');

    this.sendSuccess(res, user, 'User updated successfully');
  });

  /**
   * Deactivate user
   */
  deactivateUser = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    await UserService.deactivateUser(id, req.user);

    await this.logActivity(req, 'DEACTIVATE_USER', `Deactivated user ID: ${id}`, 'SUCCESS');

    this.sendSuccess(res, null, 'User deactivated successfully');
  });

  /**
   * Reactivate user
   */
  reactivateUser = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await UserService.reactivateUser(id, req.user);

    await this.logActivity(req, 'REACTIVATE_USER', `Reactivated user: ${user.full_name}`, 'SUCCESS');

    this.sendSuccess(res, user, 'User reactivated successfully');
  });

  /**
   * Assign roles to user
   */
  assignRoles = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { roleIds } = req.body;

    const user = await UserService.assignRoles(id, roleIds, req.user);

    await this.logActivity(req, 'ASSIGN_ROLES', `Assigned roles to user: ${user.full_name}`, 'SUCCESS');

    this.sendSuccess(res, user, 'Roles assigned successfully');
  });

  /**
   * Get user statistics
   */
  getUserStats = this.asyncHandler(async (req, res) => {
    const stats = await UserService.getUserStats();

    await this.logActivity(req, 'VIEW_USER_STATS', 'Viewed user statistics');

    this.sendSuccess(res, stats, 'User statistics retrieved successfully');
  });
}

module.exports = new UserController();
