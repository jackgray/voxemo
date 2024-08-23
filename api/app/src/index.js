// server.js

const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

const pool = new Pool({
  user: 'yourusername',
  host: 'localhost',
  database: 'yourdatabase',
  password: 'yourpassword',
  port: 5432,
});

app.use(express.json());

// Endpoint to fetch devices
app.get('/api/devices', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM devices');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Endpoint to add a purchase record
app.post('/api/purchase', async (req, res) => {
  const { userId, deviceId, purchaseDate } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO purchases (user_id, device_id, purchase_date) VALUES ($1, $2, $3) RETURNING *',
      [userId, deviceId, purchaseDate]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
