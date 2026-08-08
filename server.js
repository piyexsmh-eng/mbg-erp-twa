const express = require('express');
const cors = require('cors');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: { ssl: false },
    logging: false
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files dari public folder
app.use(express.static(path.join(__dirname, '../public')));

// Models
const Recipe = sequelize.define('Recipe', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT }
}, { tableName: 'recipes', timestamps: true });

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: '✅ Server on port 5000' });
});

// GET all recipes
app.get('/api/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.findAll();
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET recipe by ID
app.get('/api/recipes/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findByPk(req.params.id);
        if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
        res.json(recipe);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST new recipe
app.post('/api/recipes', async (req, res) => {
    try {
        const { name, description } = req.body;
        const recipe = await Recipe.create({ name, description });
        res.status(201).json(recipe);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE recipe
app.delete('/api/recipes/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findByPk(req.params.id);
        if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
        await recipe.destroy();
        res.json({ message: 'Recipe deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET bumbu standard untuk resep
app.get('/api/recipes/:id/bumbu', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await sequelize.query(
            'SELECT id, bumbu_name, persentase, category, is_required FROM bumbu_standard WHERE recipe_id = $1 ORDER BY is_required DESC, persentase DESC',
            { bind: [id], type: sequelize.QueryTypes.SELECT }
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST calculate bumbu
app.post('/api/calculate-bumbu', async (req, res) => {
    try {
        const { recipe_id, berat_utama } = req.body;
        
        if (!recipe_id || !berat_utama) {
            return res.status(400).json({ error: 'recipe_id dan berat_utama required' });
        }

        const bumbu = await sequelize.query(
            'SELECT bumbu_name, persentase, category, is_required FROM bumbu_standard WHERE recipe_id = $1',
            { bind: [recipe_id], type: sequelize.QueryTypes.SELECT }
        );

        if (bumbu.length === 0) {
            return res.status(404).json({ error: 'Bumbu standard tidak ditemukan' });
        }

        const hasil = bumbu.map(b => ({
            nama: b.bumbu_name,
            persentase: b.persentase,
            berat: Math.round((berat_utama * b.persentase) / 100 * 100) / 100,
            kategori: b.category,
            pasti: b.is_required
        }));

        const total_bumbu = Math.round(hasil.reduce((sum, b) => sum + b.berat, 0) * 100) / 100;

        await sequelize.query(
            'INSERT INTO calculation_history (recipe_id, berat_utama, total_bumbu, hasil_perhitungan) VALUES ($1, $2, $3, $4)',
            {
                bind: [recipe_id, berat_utama, total_bumbu, JSON.stringify(hasil)],
                type: sequelize.QueryTypes.INSERT
            }
        );

        res.json({
            recipe_id,
            berat_utama,
            total_bumbu,
            persentase_total: Math.round((total_bumbu / berat_utama) * 100 * 100) / 100,
            detail_bumbu: hasil
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET calculation history
app.get('/api/calculation-history/:recipe_id', async (req, res) => {
    try {
        const { recipe_id } = req.params;
        const history = await sequelize.query(
            'SELECT * FROM calculation_history WHERE recipe_id = $1 ORDER BY created_at DESC LIMIT 10',
            { bind: [recipe_id], type: sequelize.QueryTypes.SELECT }
        );
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// FALLBACK: Serve index.html untuk semua route yang tidak match API
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server on port ${PORT}`);
});
