require('dotenv').config();
const { sequelize } = require('../../src/database/models');

async function ensureSessionColumns() {
  try {
    console.log('\n=============================================');
    console.log('🔧 Ensuring tc_sessions has required columns...');
    console.log('=============================================\n');

    const addColumn = async (sql) => {
      try {
        await sequelize.query(sql);
      } catch (err) {
        if (err.original && err.original.code === '42701') {
          console.log(`ℹ️  Column already exists`);
        } else {
          console.warn('⚠️ Column alter warning:', err.message);
        }
      }
    };

    await addColumn(`ALTER TABLE public.tc_sessions
      ADD COLUMN IF NOT EXISTS token_hash VARCHAR(255) NOT NULL DEFAULT ''`);

    await addColumn(`ALTER TABLE public.tc_sessions
      ALTER COLUMN token_hash DROP DEFAULT`);

    await addColumn(`ALTER TABLE public.tc_sessions
      ALTER COLUMN token DROP NOT NULL`);

    await addColumn(`ALTER TABLE public.tc_sessions
      ADD COLUMN IF NOT EXISTS device_info JSONB`);

    await addColumn(`ALTER TABLE public.tc_sessions
      ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`);

    console.log('\n✅ tc_sessions columns are in sync.');
  } catch (error) {
    console.error('\n❌ Failed to ensure tc_sessions columns:', error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

ensureSessionColumns();
