"use strict";
module.exports = (sequelize, DataTypes) => {
	const journalentry = sequelize.define(
		"journalentry",
		{
			title: DataTypes.STRING,
			subtitle: DataTypes.STRING,
			body: DataTypes.STRING,
			IMG: DataTypes.STRING
			// user_id: {
			// 	type: DataTypes.INTEGER,

			// 	references: {
			// 		// This is a reference to another model
			// 		model: sequelize.user,

			// 		// This is the column name of the referenced model
			// 		key: "id"
			// 	}
			// }
		},
		{}
	);
	journalentry.associate = function(models) {
		models.user.hasMany(journalentry, {
			foreignKey: "user_id"
		});
		journalentry.belongsTo(models.user, {
			foreignKey: "user_id"
		});
		// associations can be defined here
	};
	return journalentry;
};
