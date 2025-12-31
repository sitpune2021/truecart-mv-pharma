module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tc_categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tc_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '1=Category, 2=Sub-Category, 3=Sub-Sub-Category'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      icon: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    });

    await queryInterface.addConstraint('tc_categories', {
      fields: ['level'],
      type: 'check',
      where: {
        level: {
          [Sequelize.Op.in]: [1, 2, 3]
        }
      },
      name: 'check_category_level'
    });

    await queryInterface.addIndex('tc_categories', ['slug'], { unique: true });
    await queryInterface.addIndex('tc_categories', ['parent_id']);
    await queryInterface.addIndex('tc_categories', ['level']);
    await queryInterface.addIndex('tc_categories', ['is_active']);
    await queryInterface.addIndex('tc_categories', ['display_order']);
    await queryInterface.addIndex('tc_categories', ['deleted_at']);

    console.log('✅ tc_categories table created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tc_categories');
    console.log('✅ tc_categories table dropped');
  }
};
