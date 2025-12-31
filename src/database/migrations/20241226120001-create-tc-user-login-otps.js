module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tc_user_login_otps', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: false,
        index: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tc_users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      otp_code: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      otp_expiry: {
        type: Sequelize.DATE,
        allowNull: false
      },
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      max_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 25
      },
      is_used: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
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
      }
    });

    await queryInterface.addIndex('tc_user_login_otps', ['phone']);
    await queryInterface.addIndex('tc_user_login_otps', ['user_id']);
    await queryInterface.addIndex('tc_user_login_otps', ['is_used']);
    await queryInterface.addIndex('tc_user_login_otps', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('tc_user_login_otps');
  }
};
