module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tc_vendor_inventory', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tc_users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tc_products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      total_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      online_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      offline_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      low_stock_threshold: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
        validate: {
          min: 0
        }
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tc_users',
          key: 'id'
        }
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tc_users',
          key: 'id'
        }
      },
      deleted_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tc_users',
          key: 'id'
        }
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
    });

    // Add indexes
    await queryInterface.addIndex('tc_vendor_inventory', ['vendor_id']);
    await queryInterface.addIndex('tc_vendor_inventory', ['product_id']);
    await queryInterface.addIndex('tc_vendor_inventory', ['vendor_id', 'product_id'], {
      unique: true,
      where: {
        deleted_at: null
      }
    });
    await queryInterface.addIndex('tc_vendor_inventory', ['total_stock']);
    await queryInterface.addIndex('tc_vendor_inventory', ['online_stock']);

    // Add constraint to ensure total_stock = online_stock + offline_stock
    await queryInterface.sequelize.query(`
      ALTER TABLE tc_vendor_inventory
      ADD CONSTRAINT check_stock_allocation
      CHECK (total_stock = online_stock + offline_stock);
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('tc_vendor_inventory');
  }
};
