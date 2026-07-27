const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize, Recipe, RecipeIngredient } = require('./models/index');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send('🚀 MBG ERP Backend is ON! (DB connected)');
  } catch (e) {
    res.send('❌ DB error: ' + e.message);
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.findAll({ attributes: ['id', 'name'] });
    res.json(recipes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/recipes/calculate', async (req, res) => {
  const { recipeId, portions } = req.body;
  try {
    const recipe = await Recipe.findByPk(recipeId, {
      include: [{ model: RecipeIngredient }]
    });
    if (!recipe) return res.status(404).json({ error: 'Resep tidak ditemukan' });

    const multiplier = portions || 1;
    const ingredients = recipe.RecipeIngredients.map(ing => ({
      name: ing.name,
      unit: ing.unit,
      amount: ing.amount,
      total: Math.round(ing.amount * multiplier * 100) / 100
    }));

    res.json({
      recipeName: recipe.name,
      portions: multiplier,
      ingredients
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));
