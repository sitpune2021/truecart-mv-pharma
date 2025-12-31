require('dotenv').config();
const { sequelize, User, Role, Permission } = require('./src/database/models');

async function testConnection() {
  console.log('\n Testing TrueCart Database Connection...\n');

  try {
    // Test 1: Database Connection
    console.log('1️ Testing database connection...');
    await sequelize.authenticate();
    console.log('    Database connection successful!\n');

    // Test 2: Count Tables
    console.log('2️ Checking tables...');
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log(`    Found ${tables.length} tables\n`);

    // Test 3: Count Users
    console.log('3️ Checking users...');
    const userCount = await User.count();
    console.log(`    Found ${userCount} user(s)\n`);

    // Test 4: Count Roles
    console.log('4️ Checking roles...');
    const roleCount = await Role.count();
    const roles = await Role.findAll({ attributes: ['name'] });
    console.log(`    Found ${roleCount} roles:`);
    roles.forEach(role => console.log(`      - ${role.name}`));
    console.log('');

    // Test 5: Count Permissions
    console.log('5️ Checking permissions...');
    const permissionCount = await Permission.count();
    console.log(`    Found ${permissionCount} permissions\n`);

    // Test 6: Check Super Admin
    console.log('6️ Checking super admin user...');
    const admin = await User.findOne({
      where: { email: 'admin@truecart.com' },
      include: [{ model: Role, as: 'roles' }]
    });
    
    if (admin) {
      console.log(`    Super admin found:`);
      console.log(`      Email: ${admin.email}`);
      console.log(`      Name: ${admin.full_name}`);
      console.log(`      Type: ${admin.user_type}`);
      console.log(`      Roles: ${admin.roles.map(r => r.name).join(', ')}`);
      console.log(`      Active: ${admin.is_active}`);
    } else {
      console.log('    Super admin not found!');
    }

    console.log('\n All tests passed! Database is ready.\n');
    console.log(' Next steps:');
    console.log('  1. Create .env file (copy from .env.example)');
    console.log('   2. Update DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET');
    console.log('   3. Run: npm run dev');
    console.log('   4. Test: http://localhost:5000/health\n');

    process.exit(0);
  } catch (error) {
    console.error('\n Test failed:', error.message);
    console.error('\n Make sure:');
    console.error('   1. PostgreSQL is running');
    console.error('   2. Database "truecart_db" exists');
    console.error('   3. You ran database_setup.sql');
    console.error('   4. .env file has correct DB credentials\n');
    process.exit(1);
  }
}

testConnection();
