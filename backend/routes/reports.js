const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.post('/', async (req, res) => {
  try {
    const { county, category, summary, details } = req.body || {};
    if (!summary || summary.length < 20) return res.status(400).json({ error: 'Summary must be at least 20 characters' });
    const case_number = 'KW-' + Date.now().toString(36).toUpperCase();
    await pool.query(
      'INSERT INTO reports (case_number, county, category, summary, details) VALUES ($1,$2,$3,$4,$5)',
      [case_number, county || null, category || null, summary, details || null]
    );
    res.status(201).json({ case_number, message: 'Report received anonymously' });
  } catch (e) {
    console.error('[report]', e.message);
    res.status(500).json({ error: 'Failed to submit report. Please try again.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM reports ORDER BY created_at DESC LIMIT 50');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load reports' });
  }
});

module.exports = router;
