const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  logging: false
});

const Recipe = sequelize.define('Recipe', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT }
}, { tableName: 'recipes', timestamps: true });

const RecipeIngredient = sequelize.define('RecipeIngredient', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  recipeId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  unit: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false }
}, { tableName: 'recipe_ingredients', timestamps: true });

Recipe.hasMany(RecipeIngredient, { foreignKey: 'recipeId' });
RecipeIngredient.belongsTo(Recipe, { foreignKey: 'recipeId' });

module.exports = { sequelize, Recipe, RecipeIngredient };
