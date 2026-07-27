const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Tes server
app.get('/', (req, res) => {
  res.send('🚀 MBG ERP Backend is ON!');
});

// Dummy Auth (sementara)
app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Register berhasil (dummy)', user: req.body });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login berhasil (dummy)', token: 'dummy-jwt-123' });
});
// Endpoint Kalkulator Resep
app.post('/api/recipes/calculate', (req, res) => {
  const { recipeId, portions } = req.body;
  
  // Data dummy resep (nanti akan diambil dari database)

// Data dummy resep (semua dalam GRAM agar akurat untuk ERP)
const recipes = {
  'ayam-kecap': {
    name: 'Ayam Kecap',
    ingredients: [
      { name: 'Ayam', unit: 'gram', amount: 500 },
      { name: 'Kecap Manis', unit: 'ml', amount: 100 },
      { name: 'Bawang Merah', unit: 'gram', amount: 50 },
      { name: 'Bawang Putih', unit: 'gram', amount: 30 },
      { name: 'Gula Merah', unit: 'gram', amount: 50 },
      { name: 'Garam', unit: 'gram', amount: 5 }
    ]
  },
  'soto-ayam': {
    name: 'Soto Ayam',
    ingredients: [
      { name: 'Ayam', unit: 'gram', amount: 300 },
      { name: 'Bihun', unit: 'gram', amount: 100 },
      { name: 'Tauge', unit: 'gram', amount: 50 },
      { name: 'Daun Bawang', unit: 'gram', amount: 30 },
      { name: 'Bawang Goreng', unit: 'gram', amount: 20 },
      { name: 'Garam', unit: 'gram', amount: 3 }
    ]
  }
};

  const recipe = recipes[recipeId];
  if (!recipe) {
    return res.status(404).json({ error: 'Resep tidak ditemukan' });
  }

  // Hitung kebutuhan berdasarkan porsi
  const multiplier = portions / 1; // porsi default = 1
  const calculated = recipe.ingredients.map(ing => ({
    ...ing,
    total: Math.round(ing.amount * multiplier * 100) / 100 // pembulatan 2 desimal
  }));

  res.json({
    recipeName: recipe.name,
    portions: portions,
    ingredients: calculated
  });
});
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di port ${PORT}`);
});
