module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addColumn('tc_manufacturers', 'brand_name', {
        type: Sequelize.STRING(255),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('tc_manufacturers', 'brand_logo_url', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('tc_products', 'is_best_seller', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }, { transaction });

      await queryInterface.addColumn('tc_products', 'is_offer', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }, { transaction });

      await queryInterface.addIndex('tc_products', ['is_best_seller'], { transaction });
      await queryInterface.addIndex('tc_products', ['is_offer'], { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeIndex('tc_products', ['is_best_seller'], { transaction });
      await queryInterface.removeIndex('tc_products', ['is_offer'], { transaction });

      await queryInterface.removeColumn('tc_products', 'is_best_seller', { transaction });
      await queryInterface.removeColumn('tc_products', 'is_offer', { transaction });

      await queryInterface.removeColumn('tc_manufacturers', 'brand_name', { transaction });
      await queryInterface.removeColumn('tc_manufacturers', 'brand_logo_url', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
