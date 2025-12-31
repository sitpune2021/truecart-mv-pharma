module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const tableName = 'tc_users';
      const columns = await queryInterface.describeTable(tableName);

      const addColumnIfMissing = async (name, definition) => {
        if (!columns[name]) {
          await queryInterface.addColumn(tableName, name, definition, { transaction });
        }
      };

      await addColumnIfMissing('email_verified', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });

      await addColumnIfMissing('phone_verified', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });

      await addColumnIfMissing('failed_login_attempts', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      });

      await addColumnIfMissing('locked_until', {
        type: Sequelize.DATE,
        allowNull: true
      });

      await addColumnIfMissing('last_login_at', {
        type: Sequelize.DATE,
        allowNull: true
      });

      await addColumnIfMissing('full_name', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'User'
      });

      await addColumnIfMissing('profile_image', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const tableName = 'tc_users';
      const columns = await queryInterface.describeTable(tableName);

      const removeColumnIfExists = async (name) => {
        if (columns[name]) {
          await queryInterface.removeColumn(tableName, name, { transaction });
        }
      };

      await removeColumnIfExists('email_verified');
      await removeColumnIfExists('phone_verified');
      await removeColumnIfExists('failed_login_attempts');
      await removeColumnIfExists('locked_until');
      await removeColumnIfExists('last_login_at');
      await removeColumnIfExists('profile_image');
    });
  }
};
