module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tc_product_names', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Generic/Salt name (e.g., Paracetamol, Ibuprofen)'
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Medical description of the generic medicine'
      },
      uses: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Medical uses and indications'
      },
      side_effects: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Common side effects'
      },
      precautions: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Precautions and warnings'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    });

    await queryInterface.addIndex('tc_product_names', ['name'], { unique: true });
    await queryInterface.addIndex('tc_product_names', ['slug'], { unique: true });
    await queryInterface.addIndex('tc_product_names', ['is_active']);
    await queryInterface.addIndex('tc_product_names', ['deleted_at']);

    console.log('✅ tc_product_names table created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tc_product_names');
    console.log('✅ tc_product_names table dropped');
  }
};
