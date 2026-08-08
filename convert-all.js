const csv = require('csvtojson');
const fs = require('fs');
const path = require('path');

const csvDir = '/root';
const outputFile = 'resep.json';

const files = fs.readdirSync(csvDir).filter(f => f.endsWith('.csv'));
console.log(`📁 Ditemukan ${files.length} file CSV.\n`);

let allRecipes = [];
let processed = 0;

files.forEach((file) => {
  const filePath = path.join(csvDir, file);
  console.log(`⏳ Memproses ${file}...`);

  csv()
    .fromFile(filePath)
    .then((rows) => {
      rows.forEach(row => {
        const title = row.Title || row.title || '';
        const ingredientsRaw = row.Ingredients || row.ingredients || '';
        const stepsRaw = row.Steps || row.steps || '';

        if (!title) return;

        // Parsing ingredients: split by '--'
        const ingredients = ingredientsRaw.split('--').map(item => item.trim()).filter(item => item);
        const ingredientsList = ingredients.map(item => {
          // Coba pisahkan jumlah dan nama
          const match = item.match(/^([\d.,]+)\s*(.*)$/);
          if (match) {
            return { name: match[2].trim(), amount: match[1].replace(',', '.'), unit: 'gram' };
          } else {
            return { name: item, amount: '', unit: 'gram' };
          }
        });

        // Parsing steps: split by '--'
        const steps = stepsRaw.split('--').map(s => s.trim()).filter(s => s);

        allRecipes.push({ title, ingredients: ingredientsList, steps });
      });

      processed++;
      console.log(`  ✅ ${file} selesai (${rows.length} resep)`);

      if (processed === files.length) {
        fs.writeFileSync(outputFile, JSON.stringify(allRecipes, null, 2));
        console.log(`\n🎉 Selesai! Total resep: ${allRecipes.length}`);
        console.log(`💾 Disimpan di ${outputFile}`);
      }
    })
    .catch(err => console.error(`❌ Error pada ${file}:`, err.message));
});
