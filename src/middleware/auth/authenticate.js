const JWTUtil = require('../../utils/jwt.util');
const ResponseUtil = require('../../utils/response.util');
const { User, Role, Permission } = require('../../database/models');

/**
 * Authentication middleware - Verify JWT token
 */

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtil.extractTokenFromHeader(authHeader);

    if (!token) {
      return ResponseUtil.unauthorized(res, 'No token provided');
    }

    let decoded;

    try {
      decoded = JWTUtil.verifyAccessToken(token);
    } catch (error) {
      return ResponseUtil.unauthorized(res, 'Invalid or expired token');
    }

    const userId = decoded.userId || decoded.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Role,
          as: "roles",
          required: false,
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: "permissions",
              required: false,
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) {
      return ResponseUtil.unauthorized(res, "User not found");
    }

    if (!user.is_active) {
      return ResponseUtil.unauthorized(res, "User account is deactivated");
    }

    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      return ResponseUtil.unauthorized(res, "Account is temporarily locked");
    }

    const permissions = new Set();

    if (user.roles) {
      user.roles.forEach((role) => {
        if (role.permissions) {
          role.permissions.forEach((perm) => {
            permissions.add(perm.name);
          });
        }
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      user_type: user.user_type,
      roles: user.roles.map((r) => r.name),
      permissions: [...permissions],
    };

    next();

  } catch (error) {
    return ResponseUtil.error(res, "Authentication failed");
  }
};



/**
 * Optional authentication - Attach user if token is valid, but don't fail if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtil.extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const decoded = JWTUtil.verifyAccessToken(token);
        const user = await User.findByPk(decoded.userId, {
          attributes: { exclude: ['password_hash'] }
        });

        if (user && user.is_active) {
          req.user = {
            id: user.id,
            email: user.email,
            user_type: user.user_type
          };
        }
      } catch (error) {
        // Token invalid, but that's okay for optional auth
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticate, optionalAuth };
