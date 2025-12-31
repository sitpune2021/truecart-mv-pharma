const ResponseUtil = require('../../utils/response.util');

/**
 * Authorization middleware - Check if user has required permission
 * @param {String} permission - Required permission (e.g., 'users.create')
 * @returns {Function} Middleware function
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, 'Authentication required');
    }

    // Super admin has all permissions
    if (req.user.user_type === 'super_admin') {
      return next();
    }

    // Check if user has the required permission
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return ResponseUtil.forbidden(res, `Permission denied: ${permission} required`);
    }

    next();
  };
};

/**
 * Check if user has any of the required permissions
 * @param {Array<String>} permissions - Array of permissions
 * @returns {Function} Middleware function
 */
const checkAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, 'Authentication required');
    }

    // Super admin has all permissions
    if (req.user.user_type === 'super_admin') {
      return next();
    }

    // Check if user has any of the required permissions
    const hasPermission = permissions.some(permission => 
      req.user.permissions && req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return ResponseUtil.forbidden(res, `One of these permissions required: ${permissions.join(', ')}`);
    }

    next();
  };
};

/**
 * Check if user has all of the required permissions
 * @param {Array<String>} permissions - Array of permissions
 * @returns {Function} Middleware function
 */
const checkAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, 'Authentication required');
    }

    // Super admin has all permissions
    if (req.user.user_type === 'super_admin') {
      return next();
    }

    // Check if user has all required permissions
    const hasAllPermissions = permissions.every(permission => 
      req.user.permissions && req.user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return ResponseUtil.forbidden(res, `All these permissions required: ${permissions.join(', ')}`);
    }

    next();
  };
};

/**
 * Check if user has specific role
 * @param {String|Array<String>} roles - Required role(s)
 * @returns {Function} Middleware function
 */
const checkRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, 'Authentication required');
    }

    // Check if user has any of the required roles
    const hasRole = roleArray.some(role => 
      req.user.roles && req.user.roles.includes(role)
    );

    if (!hasRole) {
      return ResponseUtil.forbidden(res, `Role required: ${roleArray.join(' or ')}`);
    }

    next();
  };
};

/**
 * Check if user has specific user type
 * @param {String|Array<String>} types - Required user type(s)
 * @returns {Function} Middleware function
 */
const checkUserType = (types) => {
  const typeArray = Array.isArray(types) ? types : [types];
  
  return (req, res, next) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, 'Authentication required');
    }

    if (!typeArray.includes(req.user.user_type)) {
      return ResponseUtil.forbidden(res, `User type required: ${typeArray.join(' or ')}`);
    }

    next();
  };
};

/**
 * Check if user is accessing their own resource
 * @param {String} paramName - Parameter name containing user ID (default: 'id')
 * @returns {Function} Middleware function
 */
const checkOwnership = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, 'Authentication required');
    }

    // Super admin can access any resource
    if (req.user.user_type === 'super_admin') {
      return next();
    }

    const resourceUserId = req.params[paramName] || req.body[paramName];
    
    if (resourceUserId !== req.user.id) {
      return ResponseUtil.forbidden(res, 'You can only access your own resources');
    }

    next();
  };
};

const authorize = (permission) => checkPermission(permission);

module.exports = {
  authorize,
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  checkRole,
  checkUserType,
  checkOwnership
};
