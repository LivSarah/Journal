"use strict";

module.exports = {
	up: (queryInterface, Sequelize) => {
		/*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

		return queryInterface.addColumn("journalentries", "user_id", {
			type: Sequelize.INTEGER,
			references: { model: "users", key: "id" }
		});
	},

	down: (queryInterface, Sequelize) => {
		/*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
		return queryInterface.removeColumn("journalentries", "user_id");
	}
};
