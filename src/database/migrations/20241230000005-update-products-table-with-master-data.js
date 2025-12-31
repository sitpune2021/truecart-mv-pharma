module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Updating tc_products table with master data relationships...\n');

      console.log('📋 Adding slug column...');
      await queryInterface.addColumn('tc_products', 'slug', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      }, { transaction });

      console.log('📋 Adding product_name_id column...');
      await queryInterface.addColumn('tc_products', 'product_name_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tc_product_names',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });

      console.log('📋 Adding brand_id column...');
      await queryInterface.addColumn('tc_products', 'brand_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tc_brands',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });

      console.log('📋 Adding manufacturer_id column...');
      await queryInterface.addColumn('tc_products', 'manufacturer_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tc_manufacturers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });

      console.log('📋 Adding category_id column...');
      await queryInterface.addColumn('tc_products', 'category_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tc_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });

      console.log('📋 Adding pack_size column...');
      await queryInterface.addColumn('tc_products', 'pack_size', {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'e.g., "10 tablets", "100ml", "30 capsules"'
      }, { transaction });

      console.log('📋 Adding SEO meta fields...');
      await queryInterface.addColumn('tc_products', 'meta_title', {
        type: Sequelize.STRING(255),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('tc_products', 'meta_description', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('tc_products', 'meta_keywords', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      console.log('📋 Creating indexes...');
      await queryInterface.addIndex('tc_products', ['slug'], { 
        unique: true, 
        transaction 
      });
      await queryInterface.addIndex('tc_products', ['product_name_id'], { transaction });
      await queryInterface.addIndex('tc_products', ['brand_id'], { transaction });
      await queryInterface.addIndex('tc_products', ['manufacturer_id'], { transaction });
      await queryInterface.addIndex('tc_products', ['category_id'], { transaction });

      await transaction.commit();
      console.log('✅ tc_products table updated successfully with master data relationships');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error updating tc_products table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      await queryInterface.removeIndex('tc_products', ['slug'], { transaction });
      await queryInterface.removeIndex('tc_products', ['product_name_id'], { transaction });
      await queryInterface.removeIndex('tc_products', ['brand_id'], { transaction });
      await queryInterface.removeIndex('tc_products', ['manufacturer_id'], { transaction });
      await queryInterface.removeIndex('tc_products', ['category_id'], { transaction });

      await queryInterface.removeColumn('tc_products', 'meta_keywords', { transaction });
      await queryInterface.removeColumn('tc_products', 'meta_description', { transaction });
      await queryInterface.removeColumn('tc_products', 'meta_title', { transaction });
      await queryInterface.removeColumn('tc_products', 'pack_size', { transaction });
      await queryInterface.removeColumn('tc_products', 'category_id', { transaction });
      await queryInterface.removeColumn('tc_products', 'manufacturer_id', { transaction });
      await queryInterface.removeColumn('tc_products', 'brand_id', { transaction });
      await queryInterface.removeColumn('tc_products', 'product_name_id', { transaction });
      await queryInterface.removeColumn('tc_products', 'slug', { transaction });

      await transaction.commit();
      console.log('✅ tc_products table reverted to original state');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error reverting tc_products table:', error);
      throw error;
    }
  }
};
