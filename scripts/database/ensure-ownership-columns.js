require('dotenv').config();
const { sequelize } = require('../../src/database/models');

async function ensureOwnershipColumns() {
  const client = sequelize;
  try {
    await client.authenticate();
    console.log('🔍 Ensuring owner_user_id columns on tc_users and tc_roles');

    // tc_users.owner_user_id
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tc_users' AND column_name = 'owner_user_id'
        ) THEN
          ALTER TABLE tc_users ADD COLUMN owner_user_id INTEGER NULL;
          CREATE INDEX IF NOT EXISTS idx_tc_users_owner_user_id ON tc_users(owner_user_id);
        END IF;
      END$$;
    `);

    // tc_roles.owner_user_id
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tc_roles' AND column_name = 'owner_user_id'
        ) THEN
          ALTER TABLE tc_roles ADD COLUMN owner_user_id INTEGER NULL;
          CREATE INDEX IF NOT EXISTS idx_tc_roles_owner_user_id ON tc_roles(owner_user_id);
        END IF;
      END$$;
    `);

    console.log('✅ Ownership columns ensured');
  } catch (error) {
    console.error('❌ Failed ensuring ownership columns', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

ensureOwnershipColumns();
