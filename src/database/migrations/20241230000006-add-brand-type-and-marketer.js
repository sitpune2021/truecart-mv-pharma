module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Adding brand type and marketer support...\n');

      // Create tc_marketers table (separate from manufacturers)
      console.log('📋 Creating tc_marketers table...');
      await queryInterface.createTable('tc_marketers', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true
        },
        slug: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        logo_url: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        website: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        country: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        meta_title: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        meta_description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'tc_users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        updated_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'tc_users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        deleted_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'tc_users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });

      await queryInterface.addIndex('tc_marketers', ['name'], { unique: true, transaction });
      await queryInterface.addIndex('tc_marketers', ['slug'], { unique: true, transaction });
      await queryInterface.addIndex('tc_marketers', ['is_active'], { transaction });
      await queryInterface.addIndex('tc_marketers', ['deleted_at'], { transaction });

      // Add brand_type to tc_brands
      console.log('📋 Adding brand_type to tc_brands...');
      await queryInterface.addColumn('tc_brands', 'brand_type', {
        type: Sequelize.ENUM(
          'private_label',
          'fmcg_otc',
          'ayurvedic',
          'herbal_supplement',
          'dermatology',
          'baby_care',
          'generic',
          'other'
        ),
        allowNull: true,
        defaultValue: 'other',
        comment: 'Type of brand - Private Label, FMCG/OTC, Ayurvedic, etc.'
      }, { transaction });

      await queryInterface.addIndex('tc_brands', ['brand_type'], { transaction });

      // Add category field to tc_brands (as shown in image)
      console.log('📋 Adding category to tc_brands...');
      await queryInterface.addColumn('tc_brands', 'category', {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Brand category - Healthcare, Ayurveda & Herbal, Skin Care, Personal Care, etc.'
      }, { transaction });

      await queryInterface.addIndex('tc_brands', ['category'], { transaction });

      // Add marketer_id to tc_products
      console.log('📋 Adding marketer_id to tc_products...');
      await queryInterface.addColumn('tc_products', 'marketer_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tc_marketers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });

      await queryInterface.addIndex('tc_products', ['marketer_id'], { transaction });

      // Remove display_order from tc_categories
      console.log('📋 Removing display_order from tc_categories...');
      await queryInterface.removeColumn('tc_categories', 'display_order', { transaction });

      await transaction.commit();
      console.log('✅ Brand type and marketer support added successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error adding brand type and marketer:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      await queryInterface.addColumn('tc_categories', 'display_order', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }, { transaction });

      await queryInterface.removeIndex('tc_products', ['marketer_id'], { transaction });
      await queryInterface.removeColumn('tc_products', 'marketer_id', { transaction });

      await queryInterface.removeIndex('tc_brands', ['category'], { transaction });
      await queryInterface.removeColumn('tc_brands', 'category', { transaction });

      await queryInterface.removeIndex('tc_brands', ['brand_type'], { transaction });
      await queryInterface.removeColumn('tc_brands', 'brand_type', { transaction });

      await queryInterface.dropTable('tc_marketers', { transaction });

      await transaction.commit();
      console.log('✅ Reverted brand type and marketer changes');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error reverting changes:', error);
      throw error;
    }
  }
};
