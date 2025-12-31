require('dotenv').config();
const { sequelize, Sequelize } = require('../../src/database/models');
const db = require('../../src/database/models');

async function inspectDatabase() {
  try {
    console.log('\n========================================');
    console.log('🔍 TRUECART DATABASE INSPECTION REPORT');
    console.log('========================================\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection: SUCCESS\n');

    // Database info
    const dbConfig = sequelize.config;
    console.log('📊 DATABASE CONFIGURATION:');
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Dialect: ${dbConfig.dialect}`);
    console.log(`   Username: ${dbConfig.username}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);

    // Get all tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND lower(table_name) <> 'sequelizemeta'
      ORDER BY table_name;
    `);

    console.log('📋 TABLES IN DATABASE:');
    console.log(`   Total Tables: ${tables.length}`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });
    console.log('');

    // Inspect each model
    const models = Object.keys(db).filter(key => 
      key !== 'sequelize' && key !== 'Sequelize' && typeof db[key] === 'function'
    );

    console.log('🗂️  SEQUELIZE MODELS LOADED:');
    console.log(`   Total Models: ${models.length}`);
    models.forEach((modelName, index) => {
      console.log(`   ${index + 1}. ${modelName}`);
    });
    console.log('');

    // Detailed table structure
    console.log('📐 DETAILED TABLE STRUCTURES:\n');
    
    for (const table of tables) {
      const tableName = table.table_name;
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`TABLE: ${tableName.toUpperCase()}`);
      console.log('='.repeat(60));

      // Get columns
      const [columns] = await sequelize.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `);

      console.log('\n📋 COLUMNS:');
      columns.forEach((col, index) => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`   ${index + 1}. ${col.column_name}`);
        console.log(`      Type: ${col.data_type}${length}`);
        console.log(`      Nullable: ${nullable}${defaultVal}`);
      });

      // Get primary keys
      let primaryKeys = [];
      try {
        const [pkResult] = await sequelize.query(`
          SELECT a.attname
          FROM pg_index i
          JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
          WHERE i.indrelid = to_regclass(:regclass)
          AND i.indisprimary;
        `, {
          replacements: { regclass: `public.${tableName}` }
        });
        primaryKeys = pkResult;
      } catch (pkError) {
        if (pkError.original?.code !== '42P01') {
          throw pkError;
        }
        console.warn(`   ⚠️ Unable to read primary key info for ${tableName}: ${pkError.message}`);
      }

      if (primaryKeys.length > 0) {
        console.log('\n🔑 PRIMARY KEY:');
        primaryKeys.forEach(pk => console.log(`   - ${pk.attname}`));
      }

      // Get foreign keys
      const [foreignKeys] = await sequelize.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name='${tableName}';
      `);

      if (foreignKeys.length > 0) {
        console.log('\n🔗 FOREIGN KEYS:');
        foreignKeys.forEach(fk => {
          console.log(`   - ${fk.column_name} → ${fk.foreign_table_name}(${fk.foreign_column_name})`);
        });
      }

      // Get indexes
      const [indexes] = await sequelize.query(`
        SELECT
          indexname,
          indexdef
        FROM pg_indexes
        WHERE tablename = '${tableName}'
        AND schemaname = 'public';
      `);

      if (indexes.length > 0) {
        console.log('\n📇 INDEXES:');
        indexes.forEach(idx => {
          console.log(`   - ${idx.indexname}`);
        });
      }

      // Get row count
      const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM "${tableName}";`);
      console.log(`\n📊 ROW COUNT: ${countResult[0].count}`);

      // Show sample data if exists
      if (parseInt(countResult[0].count) > 0) {
        const [sampleData] = await sequelize.query(`SELECT * FROM "${tableName}" LIMIT 3;`);
        console.log('\n📄 SAMPLE DATA (first 3 rows):');
        sampleData.forEach((row, index) => {
          console.log(`\n   Row ${index + 1}:`);
          Object.entries(row).forEach(([key, value]) => {
            let displayValue = value;
            if (value === null) displayValue = 'NULL';
            else if (typeof value === 'object') displayValue = JSON.stringify(value);
            else if (typeof value === 'string' && value.length > 50) displayValue = value.substring(0, 50) + '...';
            console.log(`      ${key}: ${displayValue}`);
          });
        });
      }
    }

    // Model associations
    console.log('\n\n' + '='.repeat(60));
    console.log('🔗 MODEL ASSOCIATIONS');
    console.log('='.repeat(60) + '\n');

    models.forEach(modelName => {
      const model = db[modelName];
      if (model.associations && Object.keys(model.associations).length > 0) {
        console.log(`\n${modelName}:`);
        Object.entries(model.associations).forEach(([assocName, assoc]) => {
          console.log(`   - ${assoc.associationType}: ${assocName} (${assoc.target.name})`);
        });
      }
    });

    // Database statistics
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 DATABASE STATISTICS');
    console.log('='.repeat(60) + '\n');

    const [dbSize] = await sequelize.query(`
      SELECT pg_size_pretty(pg_database_size('${dbConfig.database}')) as size;
    `);
    console.log(`Database Size: ${dbSize[0].size}`);

    const [tablesSizes] = await sequelize.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      AND lower(tablename) <> 'sequelizemeta'
      ORDER BY size_bytes DESC;
    `);

    console.log('\nTable Sizes:');
    tablesSizes.forEach(table => {
      console.log(`   ${table.tablename}: ${table.size}`);
    });

    console.log('\n\n' + '='.repeat(60));
    console.log('✅ INSPECTION COMPLETE');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR during inspection:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed\n');
  }
}

// Run inspection
inspectDatabase();
