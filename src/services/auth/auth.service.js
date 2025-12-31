const { User, Role, Session, RefreshToken, PasswordResetToken, Permission } = require('../../database/models');
const PasswordUtil = require('../../utils/password.util');
const JWTUtil = require('../../utils/jwt.util');
const { MAX_CONCURRENT_SESSIONS, PASSWORD_RESET } = require('../../config/constants');
const { Op } = require('sequelize');
const { AppError } = require('../../utils/errors');

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const { email, phone, full_name, password, user_type = 'customer' } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
      }
      if (existingUser.phone === phone) {
        throw new AppError('Phone number already registered', 409, 'PHONE_EXISTS');
      }
    }

    // Hash password
    const password_hash = await PasswordUtil.hash(password);

    // Create user
    const user = await User.create({
      email,
      phone,
      full_name,
      password_hash,
      user_type
    });

    // Assign default role based on user type
    const defaultRole = await Role.findOne({
      where: { name: user_type, is_system: true }
    });

    if (defaultRole) {
      await user.addRole(defaultRole);
    }

    // TODO: Send verification email/SMS

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      user_type: user.user_type
    };
  }

  /**
   * Login user
   */
  async login(email, password, deviceInfo = {}) {
    // Find user
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] },
              attributes: ['id', 'name', 'display_name', 'module', 'action', 'scope']
            }
          ]
        }
      ]
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      throw new AppError(`Account locked. Try again in ${minutesLeft} minutes`, 423, 'ACCOUNT_LOCKED');
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Increment failed attempts
      user.failed_login_attempts += 1;

      // Lock account after 5 failed attempts
      if (user.failed_login_attempts >= 5) {
        user.locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await user.save();
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    // Reset failed attempts
    user.failed_login_attempts = 0;
    user.locked_until = null;
    user.last_login_at = new Date();
    await user.save();

    // Check concurrent sessions
    const activeSessions = await Session.count({
      where: {
        user_id: user.id,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (activeSessions >= MAX_CONCURRENT_SESSIONS) {
      // Delete oldest session
      const oldestSession = await Session.findOne({
        where: { user_id: user.id },
        order: [['created_at', 'ASC']]
      });
      if (oldestSession) {
        await oldestSession.destroy();
      }
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      user_type: user.user_type
    };

    const accessToken = JWTUtil.generateAccessToken(tokenPayload);
    const refreshToken = JWTUtil.generateRefreshToken(tokenPayload);
    const tokenFamily = JWTUtil.generateTokenFamily();

    // Store session
    await Session.create({
      user_id: user.id,
      token_hash: JWTUtil.hashToken(accessToken),
      device_info: deviceInfo,
      ip_address: deviceInfo.ip,
      user_agent: deviceInfo.userAgent,
      expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });

    // Store refresh token
    await RefreshToken.create({
      user_id: user.id,
      token_hash: JWTUtil.hashToken(refreshToken),
      token_family: tokenFamily,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Derive permissions from roles
    const rolePermissions = [];
    user.roles.forEach((role) => {
      (role.permissions || []).forEach((perm) => {
        if (perm?.name) rolePermissions.push(perm.name);
      });
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type,
        roles: user.roles.map(r => ({
          id: r.id,
          name: r.name,
          display_name: r.display_name,
          permissions: (r.permissions || []).map(p => ({
            id: p.id,
            name: p.name,
            display_name: p.display_name,
            module: p.module,
            action: p.action,
            scope: p.scope
          }))
        })),
        permissions: Array.from(new Set(rolePermissions))
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRY
      }
    };
  }

  /**
   * Get current user profile with roles & permissions
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] },
              attributes: ['id', 'name', 'display_name', 'module', 'action', 'scope']
            }
          ]
        }
      ],
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const rolePermissions = [];
    user.roles.forEach((role) => {
      (role.permissions || []).forEach((perm) => {
        if (perm?.name) rolePermissions.push(perm.name);
      });
    });

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      user_type: user.user_type,
      roles: user.roles.map(r => ({
        id: r.id,
        name: r.name,
        display_name: r.display_name,
        permissions: (r.permissions || []).map(p => ({
          id: p.id,
          name: p.name,
          display_name: p.display_name,
          module: p.module,
          action: p.action,
          scope: p.scope
        }))
      })),
      permissions: Array.from(new Set(rolePermissions))
    };
  }

  /**
   * Logout user
   */
  async logout(userId, accessToken) {
    const tokenHash = JWTUtil.hashToken(accessToken);

    // Delete session
    await Session.destroy({
      where: {
        user_id: userId,
        token_hash: tokenHash
      }
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshTokenString) {
    // Verify refresh token
    let decoded;
    try {
      decoded = JWTUtil.verifyRefreshToken(refreshTokenString);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }

    const tokenHash = JWTUtil.hashToken(refreshTokenString);

    // Find refresh token in database
    const storedToken = await RefreshToken.findOne({
      where: {
        token_hash: tokenHash,
        revoked_at: null,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (!storedToken) {
      throw new Error('Refresh token not found or revoked');
    }

    // Get user
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }

    // Generate new access token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      user_type: user.user_type
    };

    const newAccessToken = JWTUtil.generateAccessToken(tokenPayload);

    // Create new session
    await Session.create({
      user_id: user.id,
      token_hash: JWTUtil.hashToken(newAccessToken),
      expires_at: new Date(Date.now() + 15 * 60 * 1000)
    });

    return {
      accessToken: newAccessToken,
      expiresIn: '15m'
    };
  }

  /**
   * Request password reset
   */
  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If email exists, password reset OTP has been sent' };
    }

    // Generate 6-digit OTP
    const otp = PasswordUtil.generateOTP(6);

    // Store OTP
    await PasswordResetToken.create({
      user_id: user.id,
      token: otp,
      expires_at: new Date(Date.now() + PASSWORD_RESET.OTP_EXPIRY_MINUTES * 60 * 1000)
    });

    // TODO: Send OTP via email/SMS
    console.log(`Password reset OTP for ${email}: ${otp}`);

    return { message: 'If email exists, password reset OTP has been sent' };
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(email, token, newPassword) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Invalid email or OTP');
    }

    // Find valid OTP
    const resetToken = await PasswordResetToken.findOne({
      where: {
        user_id: user.id,
        token,
        used_at: null,
        expires_at: { [Op.gt]: new Date() }
      },
      order: [['created_at', 'DESC']]
    });

    if (!resetToken) {
      throw new Error('Invalid or expired OTP');
    }

    // Hash new password
    const password_hash = await PasswordUtil.hash(newPassword);

    // Update password
    user.password_hash = password_hash;
    user.failed_login_attempts = 0;
    user.locked_until = null;
    await user.save();

    // Mark OTP as used
    resetToken.used_at = new Date();
    await resetToken.save();

    // Revoke all refresh tokens
    await RefreshToken.update(
      { revoked_at: new Date(), revoked_reason: 'password_reset' },
      { where: { user_id: user.id, revoked_at: null } }
    );

    // Delete all sessions
    await Session.destroy({ where: { user_id: user.id } });

    return { message: 'Password reset successfully' };
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await PasswordUtil.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const password_hash = await PasswordUtil.hash(newPassword);

    // Update password
    user.password_hash = password_hash;
    await user.save();

    // Revoke all refresh tokens
    await RefreshToken.update(
      { revoked_at: new Date(), revoked_reason: 'password_change' },
      { where: { user_id: user.id, revoked_at: null } }
    );

    // Delete all sessions except current
    await Session.destroy({
      where: {
        user_id: user.id
      }
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Get current user profile
  **/

  async getProfile(userId) {

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password_hash"] },
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
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

}

module.exports = new AuthService();
