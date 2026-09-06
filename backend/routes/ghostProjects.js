const express = require('express');
const router = express.Router();
const { pool } = require('../db');
router.get('/', async (req, res) => {
  try {
    const { county } = req.query;
    let sql = 'SELECT * FROM ghost_projects';
    const params = [];
    if (county) { params.push(county); sql += ' WHERE county = $1'; }
    sql += ' ORDER BY created_at DESC LIMIT 100';
    const r = await pool.query(sql, params);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to load ghost projects' }); }
});
module.exports = router;