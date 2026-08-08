const csv = require('csvtojson');
const fs = require('fs');
const path = require('path');

const csvDir = '/root';
const outputFile = 'resep.json';

let allRecipes = [];

// Baca semua file CSV di /root
const files = fs.readdirSync(csvDir).filter(f => f.endsWith('.csv'));

console.log(`📂 Ditemukan ${files.length} file CSV.`);

files.forEach((file, index) => {
  const filePath = path.join(csvDir, file);
  console.log(`⏳ Memproses ${file}...`);
  csv()
    .fromFile(filePath)
    .then((json) => {
      const recipes = json.map(row => {
        // Coba cari kolom yang sesuai
        let title = row.title || row.name || row.judul || row.resep || 'Resep';
        let ingredients = [];
        let steps = [];

        const ingredientField = row.ingredients || row.bahan || row.ingredient || '';
        if (ingredientField) {
          ingredients = ingredientField.split(',').map(i => {
            const parts = i.trim().split(' ');
            const amount = parts.find(p => !isNaN(p)) || '';
            const name = parts.filter(p => isNaN(p) && p).join(' ');
            return { name: name || i.trim(), amount: amount || '' };
          });
        }

        const stepsField = row.steps || row.step || row.langkah || row.cara || '';
        if (stepsField) {
          steps = stepsField.split('.').filter(s => s.trim());
        }

        return { title, ingredients, steps };
      });
      allRecipes = allRecipes.concat(recipes);
      console.log(`✅ ${file} selesai (${recipes.length} resep)`);
      
      // Jika semua file sudah diproses, simpan
      if (index === files.length - 1) {
        fs.writeFileSync(outputFile, JSON.stringify(allRecipes, null, 2));
        console.log(`🎉 Selesai! Total resep: ${allRecipes.length}. Disimpan di ${outputFile}`);
      }
    })
    .catch(err => {
      console.error(`❌ Error pada ${file}:`, err.message);
    });
});
