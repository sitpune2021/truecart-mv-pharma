const authService = require('../services/auth/auth.service');
const ResponseUtil = require('../utils/response.util');
const { asyncHandler } = require('../middleware/utils/errorHandler');

class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return ResponseUtil.created(res, result, 'User registered successfully');
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const deviceInfo = {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      device: req.get('user-agent')
    };

    const result = await authService.login(email, password, deviceInfo);
    return ResponseUtil.success(res, result, 'Login successful');
  });

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const result = await authService.logout(req.user.id, token);
    return ResponseUtil.success(res, result);
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh-token
   */
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    return ResponseUtil.success(res, result, 'Token refreshed successfully');
  });

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    return ResponseUtil.success(res, result);
  });

  /**
   * Reset password with OTP
   * POST /api/v1/auth/reset-password
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { email, token, newPassword } = req.body;
    const result = await authService.resetPassword(email, token, newPassword);
    return ResponseUtil.success(res, result);
  });

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    return ResponseUtil.success(res, result);
  });

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  getProfile = asyncHandler(async (req, res) => {
    const result = await authService.getProfile(req.user.id);
    return ResponseUtil.success(res, result);
    // const user = req.user;
    // return ResponseUtil.success(res, user);
  });

  /**
   * Verify email
   * POST /api/v1/auth/verify-email
   */
  verifyEmail = asyncHandler(async (req, res) => {
    // TODO: Implement email verification
    return ResponseUtil.success(res, { message: 'Email verification not yet implemented' });
  });

  /**
   * Verify phone
   * POST /api/v1/auth/verify-phone
   */
  verifyPhone = asyncHandler(async (req, res) => {
    // TODO: Implement phone verification
    return ResponseUtil.success(res, { message: 'Phone verification not yet implemented' });
  });
}

module.exports = new AuthController();
