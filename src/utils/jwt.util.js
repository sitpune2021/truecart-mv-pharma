const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT } = require('../config/constants');

class JWTUtil {
  /**
   * Generate access token
   * @param {Object} payload - Token payload
   * @returns {String} JWT token
   */
  static generateAccessToken(payload) {
    return jwt.sign(payload, JWT.SECRET, {
      expiresIn: JWT.ACCESS_TOKEN_EXPIRY
    });
  }

  /**
   * Generate refresh token
   * @param {Object} payload - Token payload
   * @returns {String} JWT token
   */
  static generateRefreshToken(payload) {
    return jwt.sign(payload, JWT.REFRESH_SECRET, {
      expiresIn: JWT.REFRESH_TOKEN_EXPIRY
    });
  }

  /**
   * Verify access token
   * @param {String} token - JWT token
   * @returns {Object} Decoded payload
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT.SECRET);
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   * @param {String} token - JWT token
   * @returns {Object} Decoded payload
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, JWT.REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Decode token without verification
   * @param {String} token - JWT token
   * @returns {Object} Decoded payload
   */
  static decode(token) {
    return jwt.decode(token);
  }

  /**
   * Generate token hash for storage
   * @param {String} token - JWT token
   * @returns {String} SHA256 hash
   */
  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate token family ID
   * @returns {String} UUID
   */
  static generateTokenFamily() {
    return crypto.randomUUID();
  }

  /**
   * Extract token from Authorization header
   * @param {String} authHeader - Authorization header value
   * @returns {String|null} Token or null
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

module.exports = JWTUtil;
