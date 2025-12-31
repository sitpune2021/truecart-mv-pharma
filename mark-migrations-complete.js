const { sequelize } = require('./src/database/models');

async function markMigrationsComplete() {
  try {
    const migrations = [
      '20241226000001-add-audit-columns-smart.js',
      '20241226000002-create-audit-logging-tables.js',
      '20241226000003-create-products-table.js',
      '20241226120001-create-tc-user-login-otps.js',
      '20241226124500-add-missing-user-columns.js'
    ];

    for (const migration of migrations) {
      await sequelize.query(
        `INSERT INTO "SequelizeMeta" (name) VALUES (:name) ON CONFLICT DO NOTHING`,
        {
          replacements: { name: migration },
          type: sequelize.QueryTypes.INSERT
        }
      );
      console.log(`✓ Marked ${migration} as complete`);
    }

    console.log('\n✅ All old migrations marked as complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

markMigrationsComplete();
