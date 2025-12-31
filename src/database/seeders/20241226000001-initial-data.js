const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log(' Seeding initial data...\n');

      // Hash password for super admin
      const hashedPassword = await bcrypt.hash('Admin@123', 12);

      // 1. Create Super Admin User
      console.log(' Creating super admin user...');
      const [superAdmin] = await queryInterface.sequelize.query(
        `INSERT INTO tc_users (email, phone, full_name, password_hash, user_type, is_active, is_verified, created_at, updated_at)
         VALUES ('superadmin@truecart.com', '9999999999', 'Super Admin', '${hashedPassword}', 'super_admin', true, true, NOW(), NOW())
         RETURNING id;`,
        { transaction }
      );
      const superAdminId = superAdmin[0].id;
      console.log(` Super Admin created with ID: ${superAdminId}`);

      // 2. Create Roles
      console.log('\n Creating roles...');
      const roles = [
        { name: 'super_admin', display_name: 'Super Administrator', description: 'Full system access', created_by_type: 'system', is_system: true },
        { name: 'admin', display_name: 'Administrator', description: 'Administrative access', created_by_type: 'system', is_system: true },
        { name: 'vendor', display_name: 'Vendor', description: 'Store owner/manager', created_by_type: 'system', is_system: true },
        { name: 'customer', display_name: 'Customer', description: 'Regular customer', created_by_type: 'system', is_system: true },
        { name: 'delivery_agent', display_name: 'Delivery Agent', description: 'Delivery personnel', created_by_type: 'system', is_system: true }
      ];

      const roleIds = {};
      for (const role of roles) {
        const [result] = await queryInterface.sequelize.query(
          `INSERT INTO tc_roles (name, display_name, description, created_by_type, is_system, is_active, created_at, updated_at)
           VALUES ('${role.name}', '${role.display_name}', '${role.description}', '${role.created_by_type}', ${role.is_system}, true, NOW(), NOW())
           RETURNING id;`,
          { transaction }
        );
        roleIds[role.name] = result[0].id;
        console.log(` Created role: ${role.display_name}`);
      }

      // 3. Create Permissions
      console.log('\n Creating permissions...');
      const permissions = [
        // User permissions
        { name: 'users:read', display_name: 'View Users', module: 'users', action: 'read', scope: 'all' },
        { name: 'users:create', display_name: 'Create Users', module: 'users', action: 'create', scope: 'all' },
        { name: 'users:update', display_name: 'Update Users', module: 'users', action: 'update', scope: 'all' },
        { name: 'users:delete', display_name: 'Delete Users', module: 'users', action: 'delete', scope: 'all' },
        
        // Role permissions
        { name: 'roles:read', display_name: 'View Roles', module: 'roles', action: 'read', scope: 'all' },
        { name: 'roles:create', display_name: 'Create Roles', module: 'roles', action: 'create', scope: 'all' },
        { name: 'roles:update', display_name: 'Update Roles', module: 'roles', action: 'update', scope: 'all' },
        { name: 'roles:delete', display_name: 'Delete Roles', module: 'roles', action: 'delete', scope: 'all' },
        
        // Permission permissions
        { name: 'permissions:read', display_name: 'View Permissions', module: 'permissions', action: 'read', scope: 'all' },
        { name: 'permissions:create', display_name: 'Create Permissions', module: 'permissions', action: 'create', scope: 'all' },
        { name: 'permissions:update', display_name: 'Update Permissions', module: 'permissions', action: 'update', scope: 'all' },
        { name: 'permissions:delete', display_name: 'Delete Permissions', module: 'permissions', action: 'delete', scope: 'all' },
        
        // Product permissions
        { name: 'products:read', display_name: 'View Products', module: 'products', action: 'read', scope: 'all' },
        { name: 'products:create', display_name: 'Create Products', module: 'products', action: 'create', scope: 'all' },
        { name: 'products:update', display_name: 'Update Products', module: 'products', action: 'update', scope: 'all' },
        { name: 'products:delete', display_name: 'Delete Products', module: 'products', action: 'delete', scope: 'all' }
      ];

      const permissionIds = [];
      for (const perm of permissions) {
        const [result] = await queryInterface.sequelize.query(
          `INSERT INTO tc_permissions (name, display_name, module, action, scope, is_active, created_at, updated_at)
           VALUES ('${perm.name}', '${perm.display_name}', '${perm.module}', '${perm.action}', '${perm.scope}', true, NOW(), NOW())
           RETURNING id;`,
          { transaction }
        );
        permissionIds.push(result[0].id);
      }
      console.log(` Created ${permissions.length} permissions`);

      // 4. Assign all permissions to super_admin role
      console.log('\n Assigning permissions to super_admin role...');
      for (const permId of permissionIds) {
        await queryInterface.sequelize.query(
          `INSERT INTO tc_role_permissions (role_id, permission_id, granted_at, created_at, updated_at)
           VALUES (${roleIds.super_admin}, ${permId}, NOW(), NOW(), NOW());`,
          { transaction }
        );
      }
      console.log(` Assigned all permissions to super_admin role`);

      // 5. Assign super_admin role to super admin user
      console.log('\n Assigning super_admin role to user...');
      await queryInterface.sequelize.query(
        `INSERT INTO tc_user_roles (user_id, role_id, assigned_at, created_at, updated_at)
         VALUES (${superAdminId}, ${roleIds.super_admin}, NOW(), NOW(), NOW());`,
        { transaction }
      );
      console.log(` Super admin role assigned`);

      await transaction.commit();
      
      console.log('\n Seeding complete!\n');
      console.log(' Super Admin Credentials:');
      console.log('   Email: superadmin@truecart.com');
      console.log('   Password: Admin@123');
      console.log('\n You can now login and start using the system!');
      
    } catch (error) {
      await transaction.rollback();
      console.error('\n Seeding failed:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      await queryInterface.sequelize.query('DELETE FROM tc_user_roles;', { transaction });
      await queryInterface.sequelize.query('DELETE FROM tc_role_permissions;', { transaction });
      await queryInterface.sequelize.query('DELETE FROM tc_permissions;', { transaction });
      await queryInterface.sequelize.query('DELETE FROM tc_roles;', { transaction });
      await queryInterface.sequelize.query('DELETE FROM tc_users;', { transaction });
      
      await transaction.commit();
      console.log(' Seed data removed');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
