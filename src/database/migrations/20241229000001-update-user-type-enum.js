module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // First, update any existing 'customer' users to a temporary type or handle them
      await queryInterface.sequelize.query(
        `UPDATE tc_users SET user_type = 'admin' WHERE user_type = 'customer';`,
        { transaction }
      );

      // Drop the default value constraint
      await queryInterface.sequelize.query(
        `ALTER TABLE tc_users ALTER COLUMN user_type DROP DEFAULT;`,
        { transaction }
      );

      // Convert to VARCHAR temporarily
      await queryInterface.sequelize.query(
        `ALTER TABLE tc_users ALTER COLUMN user_type TYPE VARCHAR(50);`,
        { transaction }
      );

      // Drop the old ENUM type
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "enum_tc_users_user_type";`,
        { transaction }
      );

      // Create new ENUM type without 'customer'
      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_tc_users_user_type" AS ENUM('super_admin', 'admin', 'vendor', 'delivery_agent');`,
        { transaction }
      );

      // Convert back to ENUM
      await queryInterface.sequelize.query(
        `ALTER TABLE tc_users ALTER COLUMN user_type TYPE "enum_tc_users_user_type" USING user_type::"enum_tc_users_user_type";`,
        { transaction }
      );

      // Restore default value if needed
      await queryInterface.sequelize.query(
        `ALTER TABLE tc_users ALTER COLUMN user_type SET DEFAULT 'admin'::"enum_tc_users_user_type";`,
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        `ALTER TABLE tc_users ALTER COLUMN user_type TYPE VARCHAR(50);`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "enum_tc_users_user_type";`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_tc_users_user_type" AS ENUM('super_admin', 'admin', 'vendor', 'customer', 'delivery_agent');`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE tc_users ALTER COLUMN user_type TYPE "enum_tc_users_user_type" USING user_type::"enum_tc_users_user_type";`,
        { transaction }
      );
    });
  }
};
