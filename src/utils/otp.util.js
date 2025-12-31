const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * OTP Utility - Handles OTP generation and hashing for security
 */

class OTPUtil {
  /**
   * Generate a 6-digit OTP
   */
  static generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Hash OTP before storing in database
   * @param {string} otp - Plain OTP
   * @returns {Promise<string>} - Hashed OTP
   */
  static async hashOTP(otp) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
  }

  /**
   * Verify OTP against hashed version
   * @param {string} plainOTP - Plain OTP from user
   * @param {string} hashedOTP - Hashed OTP from database
   * @returns {Promise<boolean>} - True if OTP matches
   */
  static async verifyOTP(plainOTP, hashedOTP) {
    return bcrypt.compare(plainOTP, hashedOTP);
  }

  /**
   * Generate OTP expiry time (5 minutes from now)
   */
  static generateExpiry() {
    return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Check if OTP is expired
   * @param {Date} expiryDate - OTP expiry date
   * @returns {boolean} - True if expired
   */
  static isExpired(expiryDate) {
    return new Date() > new Date(expiryDate);
  }
}

module.exports = OTPUtil;
