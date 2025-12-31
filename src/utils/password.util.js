const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { BCRYPT_ROUNDS } = require('../config/constants');

class PasswordUtil {
  /**
   * Hash password using bcrypt
   * @param {String} password - Plain text password
   * @returns {Promise<String>} Hashed password
   */
  static async hash(password) {
    return await bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * Compare password with hash
   * @param {String} password - Plain text password
   * @param {String} hash - Hashed password
   * @returns {Promise<Boolean>} Match result
   */
  static async compare(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate random OTP
   * @param {Number} length - OTP length (default: 6)
   * @returns {String} OTP
   */
  static generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  /**
   * Generate secure random token
   * @param {Number} bytes - Number of bytes (default: 32)
   * @returns {String} Hex token
   */
  static generateToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Validate password strength
   * @param {String} password - Password to validate
   * @returns {Object} Validation result
   */
  static validateStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculateStrength(password)
    };
  }

  /**
   * Calculate password strength score
   * @param {String} password - Password
   * @returns {String} Strength level (weak, medium, strong)
   */
  static calculateStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }
}

module.exports = PasswordUtil;
