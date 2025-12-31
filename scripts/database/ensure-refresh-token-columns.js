require('dotenv').config();
const { sequelize } = require('../../src/database/models');

async function ensureRefreshTokenColumns() {
  try {
    console.log('\n=============================================');
    console.log('🔧 Ensuring tc_refresh_tokens has required columns...');
    console.log('=============================================\n');

    const run = async (sql) => {
      try {
        await sequelize.query(sql);
      } catch (err) {
        if (err.original && err.original.code === '42701') {
          console.log('ℹ️  Column already exists');
        } else {
          console.warn('⚠️  Alter warning:', err.message);
        }
      }
    };

    await run(`ALTER TABLE public.tc_refresh_tokens
      ADD COLUMN IF NOT EXISTS token_hash VARCHAR(255) NOT NULL DEFAULT ''`);

    await run(`ALTER TABLE public.tc_refresh_tokens
      ALTER COLUMN token_hash DROP DEFAULT`);

    await run(`ALTER TABLE public.tc_refresh_tokens
      ALTER COLUMN token DROP NOT NULL`);

    await run(`ALTER TABLE public.tc_refresh_tokens
      ADD COLUMN IF NOT EXISTS token_family UUID`);

    await run(`UPDATE public.tc_refresh_tokens SET token_family = gen_random_uuid() WHERE token_family IS NULL`);

    await run(`ALTER TABLE public.tc_refresh_tokens
      ALTER COLUMN token_family SET NOT NULL`);

    await run(`ALTER TABLE public.tc_refresh_tokens
      ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE`);

    await run(`ALTER TABLE public.tc_refresh_tokens
      ADD COLUMN IF NOT EXISTS revoked_reason VARCHAR(255)`);

    console.log('\n✅ tc_refresh_tokens columns are in sync.');
  } catch (error) {
    console.error('\n❌ Failed to ensure tc_refresh_tokens columns:', error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

ensureRefreshTokenColumns();
