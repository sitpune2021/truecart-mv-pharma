module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      brand: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      cost_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      mrp: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      low_stock_threshold: {
        type: Sequelize.INTEGER,
        defaultValue: 10
      },
      unit: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      weight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      dimensions: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'JSON: {length, width, height, unit}'
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: []
      },
      primary_image: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      requires_prescription: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      deleted_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
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

    // Create indexes
    await queryInterface.addIndex('products', ['sku'], { unique: true });
    await queryInterface.addIndex('products', ['name']);
    await queryInterface.addIndex('products', ['category']);
    await queryInterface.addIndex('products', ['brand']);
    await queryInterface.addIndex('products', ['is_active']);
    await queryInterface.addIndex('products', ['is_featured']);
    await queryInterface.addIndex('products', ['created_at']);
    await queryInterface.addIndex('products', ['deleted_at']);

    console.log('✅ Products table created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('products');
    console.log('✅ Products table dropped');
  }
};
