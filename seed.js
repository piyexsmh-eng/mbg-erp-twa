const { sequelize, Recipe, RecipeIngredient } = require('./models/index');

const data = [
  {
    name: 'Ayam Kecap',
    description: 'Ayam manis gurih dengan kecap',
    ingredients: [
      { name: 'Ayam', unit: 'gram', amount: 500 },
      { name: 'Kecap Manis', unit: 'ml', amount: 100 },
      { name: 'Bawang Merah', unit: 'gram', amount: 50 },
      { name: 'Bawang Putih', unit: 'gram', amount: 30 },
      { name: 'Gula Merah', unit: 'gram', amount: 50 },
      { name: 'Garam', unit: 'gram', amount: 5 }
    ]
  },
  {
    name: 'Soto Ayam',
    description: 'Sup ayam dengan bihun dan tauge',
    ingredients: [
      { name: 'Ayam', unit: 'gram', amount: 300 },
      { name: 'Bihun', unit: 'gram', amount: 100 },
      { name: 'Tauge', unit: 'gram', amount: 50 },
      { name: 'Daun Bawang', unit: 'gram', amount: 30 },
      { name: 'Bawang Goreng', unit: 'gram', amount: 20 },
      { name: 'Garam', unit: 'gram', amount: 3 }
    ]
  }
];

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Tabel dibuat');

    for (const d of data) {
      const recipe = await Recipe.create({ name: d.name, description: d.description });
      for (const ing of d.ingredients) {
        await RecipeIngredient.create({ recipeId: recipe.id, ...ing });
      }
      console.log(`✅ Resep "${d.name}" masuk`);
    }
    console.log('🎉 Selesai!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Gagal:', err.message);
    process.exit(1);
  }
}
seed();
