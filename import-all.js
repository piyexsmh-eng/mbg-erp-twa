const { sequelize, Recipe, RecipeIngredient } = require('./models/index');
const fs = require('fs');

async function importAll() {
  try {
    // Baca file resep.json
    const raw = fs.readFileSync('resep.json', 'utf8');
    const recipes = JSON.parse(raw);
    
    console.log(`📚 Total resep di dataset: ${recipes.length}`);

    let count = 0;
    for (const r of recipes) {
      // Skip jika title kosong atau ingredients kosong
      if (!r.title || !r.ingredients || r.ingredients.length === 0) continue;

      // Simpan ke database
      const recipe = await Recipe.create({
        name: r.title,
        description: r.steps ? r.steps.join('\n') : ''
      });

      for (const ing of r.ingredients) {
        let amount = parseFloat(ing.amount) || 0;
        let unit = ing.unit || 'gram';

        // Konversi singkatan
        if (unit === 'sdm') { unit = 'ml'; amount = amount * 15; }
        if (unit === 'sdt') { unit = 'ml'; amount = amount * 5; }
        if (unit === 'bh' || unit === 'buah') { unit = 'butir'; }
        if (unit === 'siung') { unit = 'gram'; amount = amount * 5; }
        if (unit === 'secukupnya') { unit = 'gram'; amount = 5; }

        await RecipeIngredient.create({
          recipeId: recipe.id,
          name: ing.name,
          unit: unit,
          amount: amount || 1
        });
      }

      count++;
      if (count % 10 === 0) console.log(`✅ ${count} resep terimport...`);
    }

    console.log(`🎉 Selesai! Total ${count} resep berhasil diimport.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

importAll();
