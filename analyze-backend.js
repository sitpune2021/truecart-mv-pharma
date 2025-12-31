require('dotenv').config();
const { sequelize, Category, Permission, User, Role, Product, Brand, Manufacturer, Marketer, ProductName } = require('./src/database/models');

async function analyzeBackend() {
  console.log('\n=== TRUECART BACKEND ANALYSIS ===\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // 1. Category Analysis
    console.log('📊 CATEGORY STRUCTURE ANALYSIS:');
    console.log('─'.repeat(60));
    
    const categoryStats = await sequelize.query(`
      SELECT 
        level,
        COUNT(*) as count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
      FROM tc_categories
      WHERE deleted_at IS NULL
      GROUP BY level
      ORDER BY level
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('Category Distribution:');
    categoryStats.forEach(stat => {
      const levelName = stat.level === 1 ? 'Category' : stat.level === 2 ? 'Sub-Category' : 'Sub-Sub-Category';
      console.log(`  Level ${stat.level} (${levelName}): ${stat.count} total, ${stat.active_count} active`);
    });

    // Sample categories
    const sampleCategories = await sequelize.query(`
      SELECT id, name, level, parent_id, slug, is_active
      FROM tc_categories
      WHERE deleted_at IS NULL
      ORDER BY level, name
      LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\nSample Categories:');
    sampleCategories.forEach(cat => {
      console.log(`  [L${cat.level}] ${cat.name} (ID: ${cat.id}, Parent: ${cat.parent_id || 'None'}, Active: ${cat.is_active})`);
    });

    // 2. Permission Analysis
    console.log('\n\n📋 PERMISSION STRUCTURE ANALYSIS:');
    console.log('─'.repeat(60));

    const permissionsByModule = await sequelize.query(`
      SELECT 
        module,
        COUNT(*) as total_permissions,
        COUNT(CASE WHEN action = 'read' THEN 1 END) as read_perms,
        COUNT(CASE WHEN action = 'create' THEN 1 END) as create_perms,
        COUNT(CASE WHEN action = 'update' THEN 1 END) as update_perms,
        COUNT(CASE WHEN action = 'delete' THEN 1 END) as delete_perms
      FROM tc_permissions
      WHERE is_active = true
      GROUP BY module
      ORDER BY module
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('Permissions by Module:');
    permissionsByModule.forEach(mod => {
      console.log(`  ${mod.module}: ${mod.total_permissions} total (R:${mod.read_perms}, C:${mod.create_perms}, U:${mod.update_perms}, D:${mod.delete_perms})`);
    });

    // Category-specific permissions
    const categoryPermissions = await sequelize.query(`
      SELECT name, display_name, action
      FROM tc_permissions
      WHERE module = 'categories' AND is_active = true
      ORDER BY action
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\nCategory Module Permissions:');
    categoryPermissions.forEach(perm => {
      console.log(`  ${perm.name} - ${perm.display_name} (${perm.action})`);
    });

    // 3. Database Schema Overview
    console.log('\n\n🗄️  DATABASE TABLES:');
    console.log('─'.repeat(60));

    const tables = await sequelize.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `, { type: sequelize.QueryTypes.SELECT });

    console.log(`Total Tables: ${tables.length}`);
    tables.forEach(table => {
      console.log(`  ${table.table_name} (${table.column_count} columns)`);
    });

    // 4. Master Data Statistics
    console.log('\n\n📦 MASTER DATA STATISTICS:');
    console.log('─'.repeat(60));

    const [manufacturers, brands, marketers, productNames, products] = await Promise.all([
      sequelize.query('SELECT COUNT(*) as count FROM tc_manufacturers WHERE deleted_at IS NULL', { type: sequelize.QueryTypes.SELECT }),
      sequelize.query('SELECT COUNT(*) as count FROM tc_brands WHERE deleted_at IS NULL', { type: sequelize.QueryTypes.SELECT }),
      sequelize.query('SELECT COUNT(*) as count FROM tc_marketers WHERE deleted_at IS NULL', { type: sequelize.QueryTypes.SELECT }),
      sequelize.query('SELECT COUNT(*) as count FROM tc_product_names WHERE deleted_at IS NULL', { type: sequelize.QueryTypes.SELECT }),
      sequelize.query('SELECT COUNT(*) as count FROM tc_products WHERE deleted_at IS NULL', { type: sequelize.QueryTypes.SELECT })
    ]);

    console.log(`  Manufacturers: ${manufacturers[0].count}`);
    console.log(`  Brands: ${brands[0].count}`);
    console.log(`  Marketers: ${marketers[0].count}`);
    console.log(`  Product Names: ${productNames[0].count}`);
    console.log(`  Products: ${products[0].count}`);

    // 5. Foreign Key Relationships
    console.log('\n\n🔗 CATEGORY TABLE RELATIONSHIPS:');
    console.log('─'.repeat(60));

    const categoryConstraints = await sequelize.query(`
      SELECT
        tc.constraint_name,
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
        AND tc.table_name = 'tc_categories'
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('Foreign Keys:');
    categoryConstraints.forEach(fk => {
      console.log(`  ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });

    // 6. Indexes on Categories
    console.log('\n\n🔍 CATEGORY TABLE INDEXES:');
    console.log('─'.repeat(60));

    const categoryIndexes = await sequelize.query(`
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'tc_categories'
      ORDER BY indexname
    `, { type: sequelize.QueryTypes.SELECT });

    categoryIndexes.forEach(idx => {
      console.log(`  ${idx.indexname}`);
    });

    // 7. User and Role Statistics
    console.log('\n\n👥 USER & ROLE STATISTICS:');
    console.log('─'.repeat(60));

    const [userStats, roleStats] = await Promise.all([
      sequelize.query(`
        SELECT 
          user_type,
          COUNT(*) as count,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
        FROM tc_users
        WHERE deleted_at IS NULL
        GROUP BY user_type
      `, { type: sequelize.QueryTypes.SELECT }),
      sequelize.query(`
        SELECT name, is_active
        FROM tc_roles
        WHERE deleted_at IS NULL
        ORDER BY name
      `, { type: sequelize.QueryTypes.SELECT })
    ]);

    console.log('Users by Type:');
    userStats.forEach(stat => {
      console.log(`  ${stat.user_type}: ${stat.count} total, ${stat.active_count} active`);
    });

    console.log('\nRoles:');
    roleStats.forEach(role => {
      console.log(`  ${role.name} (Active: ${role.is_active})`);
    });

    console.log('\n\n✅ Analysis Complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

analyzeBackend();
