'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add display_order if it does not exist
    await queryInterface.addColumn('tc_categories', 'display_order', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tc_categories', 'display_order');
  }
};
