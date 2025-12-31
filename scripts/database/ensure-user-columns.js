require('dotenv').config();
const { sequelize } = require('../../src/database/models');

async function ensureUserColumns() {
  try {
    console.log('\n=============================================');
    console.log('🔧 Ensuring tc_users has required columns...');
    console.log('=============================================\n');

    const addColumn = async (sql) => {
      try {
        await sequelize.query(sql);
      } catch (err) {
        if (err.original && err.original.code === '42701') {
          // column already exists
          console.log(`ℹ️  ${err.original.column} already exists`);
        } else {
          console.warn('⚠️ Column alter warning:', err.message);
        }
      }
    };

    await addColumn(`ALTER TABLE public.tc_users
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false NOT NULL`);

    await addColumn(`ALTER TABLE public.tc_users
      ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false NOT NULL`);

    await addColumn(`ALTER TABLE public.tc_users
      ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0 NOT NULL`);

    await addColumn(`ALTER TABLE public.tc_users
      ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE`);

    await addColumn(`ALTER TABLE public.tc_users
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE`);

    await addColumn(`ALTER TABLE public.tc_users
      ADD COLUMN IF NOT EXISTS profile_image TEXT`);

    await addColumn(`ALTER TABLE public.tc_users
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) NOT NULL DEFAULT 'User'`);

    console.log('\n✅ Column synchronization complete.');
  } catch (error) {
    console.error('\n❌ Failed to ensure tc_users columns:', error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

ensureUserColumns();
