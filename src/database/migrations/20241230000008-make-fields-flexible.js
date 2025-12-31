/**
 * Make fields more flexible - remove mandatory restrictions
 * Allow changes during development phase
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Making fields more flexible...\n');

      // Make manufacturer name optional (can be added later)
      console.log('📋 Updating tc_manufacturers...');
      await queryInterface.changeColumn('tc_manufacturers', 'name', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: false
      }, { transaction });

      await queryInterface.changeColumn('tc_manufacturers', 'slug', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: false
      }, { transaction });

      // Make marketer name optional
      console.log('📋 Updating tc_marketers...');
      await queryInterface.changeColumn('tc_marketers', 'name', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: false
      }, { transaction });

      await queryInterface.changeColumn('tc_marketers', 'slug', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: false
      }, { transaction });

      // Make brand name optional
      console.log('📋 Updating tc_brands...');
      await queryInterface.changeColumn('tc_brands', 'name', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: false
      }, { transaction });

      await queryInterface.changeColumn('tc_brands', 'slug', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: false
      }, { transaction });

      // Make category name optional
      console.log('📋 Updating tc_categories...');
      await queryInterface.changeColumn('tc_categories', 'name', {
        type: Sequelize.STRING(255),
        allowNull: true
      }, { transaction });

      await queryInterface.changeColumn('tc_categories', 'slug', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: false
      }, { transaction });

      await queryInterface.changeColumn('tc_categories', 'level', {
        type: Sequelize.INTEGER,
        allowNull: true
      }, { transaction });

      // Make product name optional
      console.log('📋 Updating tc_product_names...');
      await queryInterface.changeColumn('tc_product_names', 'name', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: false
      }, { transaction });

      await queryInterface.changeColumn('tc_product_names', 'slug', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: false
      }, { transaction });

      // Make product fields more flexible
      console.log('📋 Updating tc_products...');
      await queryInterface.changeColumn('tc_products', 'name', {
        type: Sequelize.STRING(255),
        allowNull: true
      }, { transaction });

      await queryInterface.changeColumn('tc_products', 'sku', {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: false
      }, { transaction });

      await queryInterface.changeColumn('tc_products', 'price', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      }, { transaction });

      await transaction.commit();
      console.log('✅ Fields made flexible for development');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error making fields flexible:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Reverting would require data validation, skip for now
    console.log('⚠️  Revert not implemented - manual intervention required');
  }
};
