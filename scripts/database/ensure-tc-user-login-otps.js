require('dotenv').config();
const { sequelize } = require('../../src/database/models');

async function ensureOtpTable() {
  try {
    console.log('\n=============================================');
    console.log('🔧 Ensuring tc_user_login_otps table exists...');
    console.log('=============================================\n');

    const [existsResult] = await sequelize.query(
      `SELECT to_regclass('public.tc_user_login_otps') as table_name;`
    );

    if (existsResult[0].table_name) {
      console.log('✅ tc_user_login_otps already exists. Nothing to do.');
      return;
    }

    console.log('⚠️  tc_user_login_otps missing. Creating table...');

    await sequelize.query(`
      CREATE TABLE public.tc_user_login_otps (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(15) NOT NULL,
        user_id INTEGER REFERENCES tc_users(id) ON DELETE SET NULL,
        otp_code VARCHAR(255) NOT NULL,
        otp_expiry TIMESTAMP NOT NULL,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 25,
        is_used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sequelize.query(`CREATE INDEX idx_tc_user_login_otps_phone ON tc_user_login_otps(phone);`);
    await sequelize.query(`CREATE INDEX idx_tc_user_login_otps_user_id ON tc_user_login_otps(user_id);`);
    await sequelize.query(`CREATE INDEX idx_tc_user_login_otps_is_used ON tc_user_login_otps(is_used);`);
    await sequelize.query(`CREATE INDEX idx_tc_user_login_otps_created_at ON tc_user_login_otps(created_at);`);

    console.log('✅ tc_user_login_otps table created successfully.');
  } catch (error) {
    console.error('\n❌ Failed to ensure tc_user_login_otps table:', error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

ensureOtpTable();
