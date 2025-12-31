const { User, Role, Session, RefreshToken, UserRole, sequelize } = require('../../database/models');
const PasswordUtil = require('../../utils/password.util');
const JWTUtil = require('../../utils/jwt.util');
const OTPUtil = require('../../utils/otp.util');
const { Op } = require('sequelize');

class CustomerAuthService {
  /**
   * Request OTP for customer login/signup
   * Works for both new and existing customers
   */
  async requestOTP(phone) {
    // Generate 6-digit OTP
    const otp = OTPUtil.generateOTP();
    const hashedOTP = await OTPUtil.hashOTP(otp);
    const otpExpiry = OTPUtil.generateExpiry();

    // Find or create user by phone
    let user = await User.findOne({ where: { phone } });

    if (!user) {
      // New user - create minimal customer user with synthetic email and random password hash
      const randomPassword = PasswordUtil.generateToken(32);
      const password_hash = await PasswordUtil.hash(randomPassword);
      const syntheticEmail = `otp_${phone}@truecart.local`;

      user = await User.create({
        // email: syntheticEmail,
        phone,
        full_name: `Customer ${phone.slice(-4)}`,
        password_hash,
        user_type: 'customer',
        email_verified: false,
        phone_verified: false,
        is_active: false
      });
    }

    // Mark previous unused OTPs for this phone as used
    await sequelize.query(
      `UPDATE tc_user_login_otps
       SET is_used = true, used_at = NOW()
       WHERE phone = :phone AND is_used = false`,
      {
        replacements: { phone }
      }
    );

    // Insert new OTP record
    await sequelize.query(
      `INSERT INTO tc_user_login_otps
       (phone, user_id, otp_code, otp_expiry, attempts, max_attempts, is_used, ip_address, user_agent)
       VALUES (:phone, :user_id, :otp_code, :otp_expiry, 0, 25, false, NULL, NULL)`,
      {
        replacements: {
          phone,
          user_id: user.id,
          otp_code: hashedOTP,
          otp_expiry: otpExpiry
        }
      }
    );

    // TODO: Send OTP via SMS (Twilio/Firebase)
    // For now, log it (in production, remove this)
    console.log(`\n OTP for ${phone}: ${otp}\n`);

    return {
      message: 'OTP sent successfully',
      phone,
      expiresIn: '15 minutes',
      // In production, don't send OTP in response
      ...(process.env.NODE_ENV === 'development' && { otp })
    };
  }

  /**
   * Verify OTP and login/signup customer
   * Creates account if new user, logs in if existing
   */
  async verifyOTP(phone, otp, deviceInfo = {}) {
    const { ip_address, user_agent } = deviceInfo;

    // Get latest active OTP for this phone
    const [rows] = await sequelize.query(
      `SELECT * FROM tc_user_login_otps
       WHERE phone = :phone AND is_used = false
       ORDER BY created_at DESC
       LIMIT 1`,
      {
        replacements: { phone }
      }
    );

    const otpRecord = rows && rows[0];

    if (!otpRecord) {
      throw new Error('Invalid phone number or OTP');
    }

    // Check if OTP is expired
    if (OTPUtil.isExpired(otpRecord.otp_expiry)) {
      // Mark as used to prevent reuse
      await sequelize.query(
        `UPDATE tc_user_login_otps
         SET is_used = true, used_at = NOW()
         WHERE id = :id`,
        { replacements: { id: otpRecord.id } }
      );
      throw new Error('OTP has expired. Please request a new one');
    }

    // Check OTP attempts (max_attempts)
    if (otpRecord.attempts >= otpRecord.max_attempts) {
      throw new Error('Too many failed attempts. Please request a new OTP');
    }

    // Verify OTP (compare hashed)
    const isValidOTP = await OTPUtil.verifyOTP(otp, otpRecord.otp_code);
    if (!isValidOTP) {
      // Increment failed attempts
      await sequelize.query(
        `UPDATE tc_user_login_otps
         SET attempts = attempts + 1
         WHERE id = :id`,
        { replacements: { id: otpRecord.id } }
      );
      throw new Error('Invalid OTP');
    }

    // OTP is valid - mark as used
    await sequelize.query(
      `UPDATE tc_user_login_otps
       SET is_used = true, used_at = NOW()
       WHERE id = :id`,
      { replacements: { id: otpRecord.id } }
    );

    // Get or confirm user
    let user = null;

    if (otpRecord.user_id) {
      user = await User.findByPk(otpRecord.user_id, {
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] }
          }
        ]
      });
    }

    if (!user) {
      user = await User.findOne({
        where: { phone },
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] }
          }
        ]
      });
    }

    if (!user) {
      throw new Error('User not found for this phone');
    }

    // OTP is valid - activate user if new
    const isNewUser = !user.is_active;
    
    await user.update({
      is_active: true,
      phone_verified: true,
      last_login_at: new Date(),
      ...(isNewUser && { email_verified: false })
    });

    // Assign customer role if new user
    if (isNewUser) {
      const customerRole = await Role.findOne({
        where: { name: 'customer', is_system: true }
      });

      if (customerRole) {
        await UserRole.create({
          user_id: user.id,
          role_id: customerRole.id,
          assigned_by: user.id // Self-assigned
        });
      }

      // Set default full_name if not provided
      if (!user.full_name) {
        await user.update({
          full_name: `Customer ${phone.slice(-4)}`
        });
      }
    }

    // Reload user with roles
    await user.reload({
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ]
    });

    // Check concurrent sessions and cleanup if needed
    const MAX_SESSIONS = parseInt(process.env.MAX_CONCURRENT_SESSIONS) || 3;
    const activeSessions = await Session.count({
      where: {
        user_id: user.id,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (activeSessions >= MAX_SESSIONS) {
      // Delete oldest session
      const oldestSession = await Session.findOne({
        where: { user_id: user.id },
        order: [['last_activity', 'ASC']]
      });
      if (oldestSession) {
        await oldestSession.destroy();
      }
    }

    // Generate tokens
    const accessToken = JWTUtil.generateAccessToken({
      id: user.id,
      // email: user.email,
      phone: user.phone,
      user_type: user.user_type
    });

    const refreshToken = JWTUtil.generateRefreshToken({
      id: user.id,
      user_type: user.user_type
    });

    const tokenFamily = JWTUtil.generateTokenFamily();

    // Create session
    const session = await Session.create({
      user_id: user.id,
      token_hash: JWTUtil.hashToken(accessToken),
      ip_address,
      user_agent,
      expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      last_activity: new Date()
    });

    // Store refresh token
    await RefreshToken.create({
      user_id: user.id,
      token_hash: JWTUtil.hashToken(refreshToken),
      token_family: tokenFamily,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      is_revoked: false
    });

    // Prepare user data
    const userData = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      full_name: user.full_name,
      user_type: user.user_type,
      phone_verified: user.phone_verified,
      email_verified: user.email_verified,
      is_active: user.is_active,
      roles: user.roles.map(role => role.name),
      last_login_at: user.last_login_at
    };

    return {
      user: userData,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '15m'
      },
      isNewUser,
      message: isNewUser ? 'Account created and logged in successfully' : 'Logged in successfully'
    };
  }

  /**
   * Resend OTP (with rate limiting)
   */
  async resendOTP(phone) {
    // Find last OTP record for this phone
    const [rows] = await sequelize.query(
      `SELECT * FROM tc_user_login_otps
       WHERE phone = :phone
       ORDER BY created_at DESC
       LIMIT 1`,
      {
        replacements: { phone }
      }
    );

    const lastOtp = rows && rows[0];

    if (lastOtp) {
      const lastCreatedAt = new Date(lastOtp.created_at);
      const diffMs = Date.now() - lastCreatedAt.getTime();

      if (diffMs < 60 * 1000) {
        const waitTime = Math.ceil((60 * 1000 - diffMs) / 1000);
        throw new Error(`Please wait ${waitTime} seconds before requesting a new OTP`);
      }
    }

    // Generate and send new OTP
    return this.requestOTP(phone);
  }

  /**
   * Update customer profile (optional - for after login)
   */
  async updateProfile(userId, updateData) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const { full_name, email } = updateData;

    // Check email uniqueness if provided
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    await user.update({
      ...(full_name && { full_name }),
      ...(email && { email, email_verified: false })
    });

    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      full_name: user.full_name,
      phone_verified: user.phone_verified,
      email_verified: user.email_verified
    };
  }
  
}

module.exports = new CustomerAuthService();
