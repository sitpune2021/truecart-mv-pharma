module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tc_inventory_logs', {
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
      transaction_type: {
        type: Sequelize.ENUM(
          'restock',
          'sale',
          'offline_sale',
          'adjustment',
          'allocation_change',
          'damage',
          'return',
          'transfer'
        ),
        allowNull: false
      },
      quantity_change: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Positive for additions, negative for reductions'
      },
      stock_type: {
        type: Sequelize.ENUM('total', 'online', 'offline'),
        allowNull: false,
        defaultValue: 'total'
      },
      previous_total_stock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      new_total_stock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      previous_online_stock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      new_online_stock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      previous_offline_stock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      new_offline_stock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reference_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Type of reference: order, offline_sale, manual_adjustment, etc.'
      },
      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID of the referenced entity (order_id, sale_id, etc.)'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      performed_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tc_users',
          key: 'id'
        },
        comment: 'User who performed this transaction'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for efficient querying
    await queryInterface.addIndex('tc_inventory_logs', ['vendor_id']);
    await queryInterface.addIndex('tc_inventory_logs', ['product_id']);
    await queryInterface.addIndex('tc_inventory_logs', ['vendor_id', 'product_id']);
    await queryInterface.addIndex('tc_inventory_logs', ['transaction_type']);
    await queryInterface.addIndex('tc_inventory_logs', ['reference_type', 'reference_id']);
    await queryInterface.addIndex('tc_inventory_logs', ['created_at']);
    await queryInterface.addIndex('tc_inventory_logs', ['performed_by']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('tc_inventory_logs');
  }
};
