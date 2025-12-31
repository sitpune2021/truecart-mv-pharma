const customerAuthService = require('../services/customer/customerAuth.service');
const ResponseUtil = require('../utils/response.util');
const { asyncHandler } = require('../middleware/utils/errorHandler');

class CustomerAuthController {
  /**
   * Request OTP for customer login/signup
   * POST /api/v1/auth/customer/request-otp
   */
  requestOTP = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    const result = await customerAuthService.requestOTP(phone);

    return ResponseUtil.success(res, result, 'OTP sent successfully');
  });

  /**
   * Verify OTP and login/signup
   * POST /api/v1/auth/customer/verify-otp
   */
  verifyOTP = asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;

    const deviceInfo = {
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('user-agent')
    };

    const result = await customerAuthService.verifyOTP(phone, otp, deviceInfo);

    const statusCode = result.isNewUser ? 201 : 200;

    return res.status(statusCode).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        tokens: result.tokens,
        isNewUser: result.isNewUser
      }
    });
  });

  /**
   * Resend OTP
   * POST /api/v1/auth/customer/resend-otp
   */
  resendOTP = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    const result = await customerAuthService.resendOTP(phone);

    return ResponseUtil.success(res, result, 'OTP resent successfully');
  });

  /**
   * Update customer profile (optional - for after login)
   * PUT /api/v1/auth/customer/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updateData = req.body;

    const result = await customerAuthService.updateProfile(userId, updateData);

    return ResponseUtil.success(res, result, 'Profile updated successfully');
  });
}

module.exports = new CustomerAuthController();
