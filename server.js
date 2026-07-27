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

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di port ${PORT}`);
});
