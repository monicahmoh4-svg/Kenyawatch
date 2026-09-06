const express = require('express');
const router = express.Router();
const { pool } = require('../db');
router.get('/', async (_req, res) => {
  const stats = {};
  const queries = {
    total: 'SELECT COUNT(*) FROM contracts',
    by_data_type: 'SELECT data_type, COUNT(*) FROM contracts GROUP BY data_type',
    by_county: 'SELECT county, COUNT(*) FROM contracts GROUP BY county ORDER BY COUNT(*) DESC LIMIT 10',
    critical: "SELECT COUNT(*) FROM contracts WHERE risk_score >= 75 AND data_type <> 'reference'",
    documented: "SELECT COUNT(*) FROM contracts WHERE data_type = 'documented'",
    reports_total: 'SELECT COUNT(*) FROM reports'
  };
  for (const [key, sql] of Object.entries(queries)) {
    try {
      const r = await pool.query(sql);
      stats[key] = (key === 'by_data_type' || key === 'by_county') ? r.rows : Number(r.rows[0].count);
    } catch (e) { stats[key] = null; }
  }
  res.json(stats);
});
module.exports = router;