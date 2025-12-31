'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    await queryInterface.bulkInsert('tc_permissions', [
      {
        name: 'inventory:read',
        display_name: 'View Inventory',
        module: 'inventory',
        action: 'read',
        scope: 'all',
        description: 'View inventory data and reports',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        name: 'inventory:create',
        display_name: 'Create Inventory',
        module: 'inventory',
        action: 'create',
        scope: 'all',
        description: 'Add products to inventory',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        name: 'inventory:update',
        display_name: 'Update Inventory',
        module: 'inventory',
        action: 'update',
        scope: 'all',
        description: 'Update inventory stock and settings',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        name: 'inventory:delete',
        display_name: 'Delete Inventory',
        module: 'inventory',
        action: 'delete',
        scope: 'all',
        description: 'Remove products from inventory',
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tc_permissions', {
      module: 'inventory'
    });
  }
};
